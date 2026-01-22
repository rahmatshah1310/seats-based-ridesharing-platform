import "dotenv/config";
import { db, connection } from "@/db/db";
import { users } from "@/db/schema/user.model";

function getArg(name: string) {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const name = getArg("--name");
const phone = getArg("--phone");
const cnic = getArg("--cnic");
const role = (getArg("--role") ?? "admin") as "admin" | "passenger" | "driver";

if (!name || !phone) {
  console.error('Usage: admin:create -- --name "Admin" --phone "0344..." --role "admin" --cnic "1234567890123"');
  process.exit(1);
}

if (!["admin", "passenger", "driver"].includes(role)) {
  console.error('Invalid --role. Use "admin" | "passenger" | "driver"');
  process.exit(1);
}

try {
  const [created] = await db
    .insert(users)
    .values({ name, phone, role, cnic })
    .returning();

  console.log("Created user:", created);
} catch (err: any) {
  // Postgres unique violation
  if (err?.code === "23505") {
    console.error("This phone already exists:", phone);
  } else {
    console.error("Failed to create admin:", err);
  }
  process.exitCode = 1;
} finally {
  // close postgres-js connection so the script exits
  await connection.end({ timeout: 5 });
}