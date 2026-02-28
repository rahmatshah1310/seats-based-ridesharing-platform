import { ratingScoreEnum } from "@/db/schema";
import Joi from "joi";

export const createRatingSchema = Joi.object({
    rideId: Joi.string().required(),
    score: Joi.number().min(0).max(5).required(),
    feedbackTags: Joi.array().items(Joi.string()),
    comment: Joi.string(),
})


