import { db } from "@/db/db";
import { messages } from "@/db/schema/messages.model";

export const getMessages = async () => {
  try {
    const results = await db.select().from(messages);
    return results;
  } catch (error) {
    throw new Error("Error fetching messages");
  }
};
