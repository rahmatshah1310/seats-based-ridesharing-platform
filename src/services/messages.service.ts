import { db } from "@/db/db";
import { messages } from "@/db/schema/messages.model";
import { desc, sql } from "drizzle-orm";

export const getMessages = async (page: number = 1, pageSize: number = 20) => {
  try {
    const offset = (page - 1) * pageSize;
    const results = await db
      .select()
      .from(messages)
      .orderBy(desc(messages.createdAt))
      .limit(pageSize)
      .offset(offset);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(messages);
    return {
      messages: results,
      pagination: {
        total: Number(count),
        page,
        pageSize,
        totalPages: Math.ceil(Number(count) / pageSize),
      },
    };
  } catch (error) {
    throw new Error("Error fetching messages");
  }
};
