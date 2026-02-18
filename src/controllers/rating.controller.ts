import {
  createRating,
} from "@/services/rating.service";
import type { Controller } from "@/db/types/controller";
import type { ResponseWithHelpers } from "@/middlewares/response.mw";
import type { CreateRatingInput } from "@/db/types/rating.types";
import { createRatingSchema } from "../validations/rating.schema";
import { AppError } from "@/helpers/appError";


export const createRatingController: Controller = async (req, res) => {
  const r = res as ResponseWithHelpers;
  try {
    const raterId = req.user?._id;
    const rateeId = req.params.rateeId;

    if (!raterId) throw new AppError("Unauthorized", 401);
    if (!rateeId) throw new AppError("Ratee ID is required", 400);

    const { error, value } = createRatingSchema.validate(req.body);
    if (error) throw error; // r.serverError handles Joi errors by returning 400

    const rating = await createRating({
      ...value,
      raterId,
      rateeId,
    });

    return r.success(rating, "Rating created successfully");
  } catch (error) {
    if (error instanceof AppError)
      return r.fail(error.message, error.statusCode);
    return r.serverError(error);
  }
};