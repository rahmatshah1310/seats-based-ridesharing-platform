import { Server } from "socket.io";
import { users } from "@/db/schema/user.model";
import { eq, and } from "drizzle-orm";
import { db } from "@/db/db";
import { authenticateSocket } from "@/middlewares/socket.mw";
import { messages } from "@/db/schema/messages.model";
import { conversationParticipants } from "@/db/schema/conversationParticipants.model";
import { messageReads } from "@/db/schema/messageRead.model";

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
        `User Connected: ${client.user.name} (Client ID: ${client.id})`,
      );

      // Join private room
      client.join(`user:${userId}`);
      console.log(`Client ${client.id} joined private room: user:${userId}`);

      // Join role room
      client.join(client.user.role);
      console.log(`Client ${client.id} joined role room: ${client.user.role}`);

      // Handle joining conversation rooms
      client.on("join:conversation", async (conversationId: string) => {
        try {
          // Verify user is a participant in this conversation
          const isParticipant =
            await db.query.conversationParticipants.findFirst({
              where: (conversationParticipants, { eq, and }) =>
                and(
                  eq(conversationParticipants.conversationId, conversationId),
                  eq(conversationParticipants.userId, client.user.id),
                ),
            });

          if (isParticipant) {
            client.join(`conversation:${conversationId}`);
            console.log(
              `Client ${client.id} joined conversation room: conversation:${conversationId}`,
            );
            client.emit("conversation:joined", { conversationId });
          } else {
            client.emit("conversation:error", {
              conversationId,
              error: "Not a participant",
            });
          }
        } catch (error) {
          console.error("Error joining conversation room:", error);
          client.emit("conversation:error", {
            conversationId,
            error: "Failed to join",
          });
        }
      });

      // Handle leaving conversation rooms
      client.on("leave:conversation", (conversationId: string) => {
        client.leave(`conversation:${conversationId}`);
        console.log(
          `Client ${client.id} left conversation room: conversation:${conversationId}`,
        );
        client.emit("conversation:left", { conversationId });
      });

      // ✅ Update only online status
      await db
        .update(users)
        .set({
          isOnline: true,
        })
        .where(eq(users.id, userId));

      client.on(
        "message:send",
        async (content: string, conversationId: string) => {
          try {
            const isParticipant =
              await db.query.conversationParticipants.findFirst({
                where: (conversationParticipants, { eq, and }) =>
                  and(
                    eq(conversationParticipants.conversationId, conversationId),
                    eq(conversationParticipants.userId, client.user.id),
                  ),
              });

            if (!isParticipant) {
              return client.emit(
                "message:error",
                "You are not a participant of this conversation",
              );
            }

            const [message] = await db
              .insert(messages)
              .values({
                conversationId,
                senderId: client.user.id,
                message: content,
              })
              .returning();

            if (!message) {
              return client.emit("message:error", "Failed to send message");
            }

            io.to(`conversation:${conversationId}`).emit("message:received", {
              id: message.id,
              conversationId,
              senderId: client.user.id,
              message: content,
            });
          } catch (error) {
            console.error("SocketService [message:send]: Error", error);
          }
        },
      );

      client.on(
        "message:read",
        async (messageId: string, conversationId: string) => {
          try {
            const isRead = await db.query.messageReads.findFirst({
              where: (messageReads, { eq, and }) =>
                and(
                  eq(messageReads.messageId, messageId),
                  eq(messageReads.userId, client.user.id),
                ),
            });

            if (!isRead) {
              await db.insert(messageReads).values({
                messageId,
                userId: client.user.id,
              });
            }

            io.to(`conversation:${conversationId}`).emit("message:read", {
              messageId,
              userId: client.user.id,
            });
          } catch (error) {
            console.error("SocketService [message:read]: Error", error);
          }
        },
      );

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
