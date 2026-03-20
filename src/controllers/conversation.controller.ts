import type { ResponseWithHelpers } from "@/middlewares/response.mw";
import { AppError } from "@/helpers/appError";
import type { Controller } from "@/db/types/controller";
import { db } from "@/db/db";
import { conversations } from "@/db/schema/conversation.model";
import { conversationParticipants } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getConversations } from "@/services/conversation.service";

export const createConversation: Controller = async (req, res) => {
  const r = res as ResponseWithHelpers;
  try {
    const { otherUserId } = req.body;
    const userId = req.user?._id;

    const existingConversation = await db
      .select({ conversation: conversations })
      .from(conversations)
      .innerJoin(
        conversationParticipants,
        eq(conversationParticipants.conversationId, conversations.id),
      )
      .where(
        and(
          eq(conversations.type, "private"),
          eq(conversationParticipants.userId, userId),
        ),
      )
      .limit(1);

    // ✅ Check array length instead
    if (existingConversation.length > 0) {
      return r.success(existingConversation[0], "Conversation already exists");
    }

    // ✅ Create new conversation
    const [newConversation] = await db
      .insert(conversations)
      .values({
        name: `Private Chat: ${userId} {user.name} & ${otherUserId}{user.name}`,
        type: "private",
        createdBy: userId,
      })
      .returning();

    if (!newConversation) {
      return r.fail("Failed to create conversation", 500);
    }
    // ✅ Add both users as participantsx
    await db.insert(conversationParticipants).values([
      { conversationId: newConversation.id, userId },
      { conversationId: newConversation.id, userId: otherUserId },
    ]);

    return r.success(newConversation, "Conversation created successfully");
  } catch (error) {
    if (error instanceof AppError)
      return r.fail(error.message, error.statusCode);
    return r.serverError(error);
  }
};

export const getConversationsController: Controller = async (req, res) => {
  const r = res as ResponseWithHelpers;
  try {
    const conversationsList = await getConversations();
    return r.success(conversationsList, "Conversations retrieved successfully");
  } catch (error) {
    if (error instanceof AppError)
      return r.fail(error.message, error.statusCode);
    return r.serverError(error);
  }
};
