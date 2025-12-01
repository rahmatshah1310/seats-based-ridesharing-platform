import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "@/db/schema";
import postgres from "postgres"; 

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in environment variables");
}

export const connection = postgres(process.env.DATABASE_URL, {
  max: 1,
});

export const db = drizzle(connection, {
  schema,
  logger: true,
});

export type Db = typeof db;
