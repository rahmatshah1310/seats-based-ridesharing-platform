import Joi from "joi";
import { rideStatusEnum } from "@/db/schema";

export const createRideRequestSchema = Joi.object({
  from: Joi.string().required(),
  to: Joi.string().required(),
  date: Joi.date().required(),
  time: Joi.string()
    .pattern(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/)
    .required()
    .messages({
      "string.pattern.base": "Time must be HH:mm or HH:mm:ss",
    }),
  requiredSeats: Joi.number().required().min(1).max(7),
});

export const updateRideRequestSchema = Joi.object({
  from: Joi.string(),
  to: Joi.string(),
  date: Joi.date(),
  time: Joi.string(),
  requiredSeats: Joi.number().min(1).max(7),
});

export const requestToSpecificRideSchema = Joi.object({
  rideId: Joi.string().required(),
  requiredSeats: Joi.number().required().min(1).max(7),
});
