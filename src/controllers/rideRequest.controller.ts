import { createRideRequest } from "@/services/rideRequest.service";
import type { Controller } from "@/db/types/controller";
import type { ResponseWithHelpers } from "@/middlewares/response.mw";
import { createRideRequestSchema } from "../validations/request.schema";

export const createRideRequestController: Controller = async (req, res) => {
  const r = res as ResponseWithHelpers;
  try {
    const result = await createRideRequestSchema.validateAsync(req.body);
    return r.success(result, "Ride Request created successfully");
  } catch (error) {
    console.error(
      "RideRequestController [createRideRequestController] Error:",
      error,
    );
    return r.serverError(error);
  }
};
