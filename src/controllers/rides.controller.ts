import { createRide } from "@/services/rides.service";
import type { Controller } from "@/db/types/controller";
import type { ResponseWithHelpers } from "@/middlewares/response.mw";
import type { CreateRideInput } from "@/db/types/rides.types";
import { createRideSchema } from "../validations/rides.schema";

export const createRideController: Controller = async (req, res) => {
  const r = res as ResponseWithHelpers;
  try {
    const results = await createRideSchema.validateAsync(req.body);
    console.log(results, "==============================>");
    const userId = Number(req.user?._id);
    console.log(userId, "userid================>");
    if (!userId) {
      return res.fail({ message: "User ID not found" });
    }
    const rideData: CreateRideInput = {
      driverId: userId,
      from: results.from,
      to: results.to,
      date: results.date,
      time: results.time,
      availableSeats: results.availableSeats,
    };
    const ride = await createRide(rideData);
    return r.success(ride, "Ride created successfully");
  } catch (error) {
    console.error("RidesController [createRideController] Error:", error);
    r.serverError(error);
  }
};
