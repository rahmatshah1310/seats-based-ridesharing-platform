import { db } from "@/db/db";
import { conversations } from "@/db/schema/conversation.model";
import { desc, sql } from "drizzle-orm";

export const getConversations = async (
  page: number = 1,
  pageSize: number = 20,
) => {
  try {
    const offset = (page - 1) * pageSize;
    const results = await db
      .select()
      .from(conversations)
      .orderBy(desc(conversations.createdAt))
      .limit(pageSize)
      .offset(offset);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(conversations);
    return {
      conversations: results,
      pagination: {
        total: Number(count),
        page,
        pageSize,
        totalPages: Math.ceil(Number(count) / pageSize),
      },
    };
  } catch (error) {
    throw new Error("Error fetching conversations");
  }
};
