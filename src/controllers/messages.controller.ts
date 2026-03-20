import type { Controller } from "@/db/types/controller";
import { AppError } from "@/helpers/appError";
import type { ResponseWithHelpers } from "@/middlewares/response.mw";
import { getMessages } from "@/services/messages.service";

export const getMessageController: Controller = async (req, res) => {
  const r = res as ResponseWithHelpers;
  try {
    const results = await getMessages();
    return r.success(results, "Messages fetched successfully");
  } catch (error) {
    if (error instanceof AppError)
      return r.fail(error.message, error.statusCode);
    return r.serverError(error);
  }
};
