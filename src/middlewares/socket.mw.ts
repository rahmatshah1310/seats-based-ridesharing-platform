import jwt from "jsonwebtoken";
import { users } from "@/db/schema/user.model";
import { db } from "@/db/db";
import { eq } from "drizzle-orm";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not set in environment variables");
}

export const authenticateSocket = async (socket: any, next: any) => {
    try {
        const authToken =
            socket.handshake.auth?.token ||
            socket.handshake.headers?.authorization?.replace("Bearer ", "");

        if (!authToken) {
            return next(new Error("Authentication error: Token missing."));
        }

        let decoded: any;
        try {
            decoded = jwt.verify(authToken, JWT_SECRET);
        } catch (err: any) {
            return next(new Error(`Authentication error: ${err.message}`));
        }

        const userId = decoded.id || decoded.sub;
        if (!userId) {
            return next(new Error("Authentication error: Invalid token payload."));
        }

        // ✅ Correct Drizzle query
        const [user] = await db
            .select({
                id: users.id,
                name: users.name,
                profileImage: users.profileImage,
                role: users.role,
                status: users.status,
            })
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);

        if (!user) {
            return next(new Error("Authentication error: User not found."));
        }

        // ✅ Re-add status protection
        if (user.status === "blocked") {
            return next(new Error("Authentication error: Account not allowed."));
        }

        socket.user = user;

        return next();
    } catch (err) {
        console.error("Socket authentication error:", err);
        return next(new Error("Authentication error."));
    }
};
