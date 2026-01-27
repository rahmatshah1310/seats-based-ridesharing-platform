import Joi from "joi";
import { rideStatusEnum } from "@/db/schema";

export const createRideSchema = Joi.object({
  driverId: Joi.number().required(),
  vehicleId: Joi.number().required(),
  from: Joi.string().required(),
  to: Joi.string().required(),
  departureTime: Joi.string().required(),
  availableSeats: Joi.number().required().min(1).max(7),
});

export const updateRideSchema = Joi.object({
  driverId: Joi.number(),
  vehicleId: Joi.number(),
  from: Joi.string(),
  to: Joi.string(),
  departureTime: Joi.string(),
  availableSeats: Joi.number().min(1).max(7),
});

export const updateStatusOfRideSchema = Joi.object({
  status: Joi.string().required().valid(rideStatusEnum),
});
