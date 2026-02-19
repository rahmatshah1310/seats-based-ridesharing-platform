import { Server } from "socket.io";
import { users } from "@/db/schema/user.model";
import { eq } from "drizzle-orm";
import { db } from "@/db/db";
import { authenticateSocket } from "@/middlewares/socket.mw";

let io: Server;

export const configureSockets = (server: any) => {
    io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
            credentials: true,
            allowedHeaders: ["authorization"],
        },
    });

    // ✅ Attach Authentication Middleware
    io.use(authenticateSocket);

    io.on("connection", async (client: any) => {
        try {
            if (!client.user?.id) {
                console.log("Unauthorized socket connection");
                client.disconnect();
                return;
            }

            const userId = client.user.id;

            console.log(
                `User Connected: ${client.user.name} (Client ID: ${client.id})`
            );

            // Join private room
            client.join(`user:${userId}`);
            console.log(`Client ${client.id} joined private room: user:${userId}`);

            // Join role room
            client.join(client.user.role);
            console.log(`Client ${client.id} joined role room: ${client.user.role}`);

            // ✅ Update only online status
            await db
                .update(users)
                .set({
                    isOnline: true,
                })
                .where(eq(users.id, userId));

            // 🔥 Handle disconnect
            client.on("disconnect", async () => {
                console.log(`User Disconnected: ${userId}`);

                await db
                    .update(users)
                    .set({
                        isOnline: false,
                    })
                    .where(eq(users.id, userId));
            });

        } catch (error) {
            console.error("Socket connection error:", error);
        }
    });

    return io;
};
