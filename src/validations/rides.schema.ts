import Joi from "joi";
import { rideStatusEnum } from "@/db/schema";

export const createRideSchema = Joi.object({
  from: Joi.string().required(),
  to: Joi.string().required(),
  date: Joi.date().required(),
  time: Joi.string()
    .pattern(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/)
    .required()
    .messages({
      "string.pattern.base": "Time must be HH:mm or HH:mm:ss",
    }),
  availableSeats: Joi.number().required().min(1).max(7),
});

export const updateRideSchema = Joi.object({
  driverId: Joi.number(),
  vehicleId: Joi.number(),
  from: Joi.string(),
  to: Joi.string(),
  date: Joi.date(),
  time: Joi.string(),
  availableSeats: Joi.number().min(1).max(7),
});

export const updateStatusOfRideSchema = Joi.object({
  status: Joi.string().required().valid(rideStatusEnum),
});
