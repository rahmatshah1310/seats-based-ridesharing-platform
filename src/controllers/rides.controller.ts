import {
  createRide,
  deleteRide,
  getAllRides,
  getRideById,
  updateRide,
} from "@/services/rides.service";
import type { Controller } from "@/db/types/controller";
import type { ResponseWithHelpers } from "@/middlewares/response.mw";
import type { CreateRideInput } from "@/db/types/rides.types";
import { createRideSchema } from "../validations/rides.schema";

export const createRideController: Controller = async (req, res) => {
  const r = res as ResponseWithHelpers;

  try {
    const results = await createRideSchema.validateAsync(req.body);

    const userId = Number(req.user?._id);
    if (!Number.isFinite(userId) || userId <= 0) {
      return r.fail({ message: "User ID not found" });
    }

    const rideDate =
      results.date instanceof Date
        ? results.date.toISOString().slice(0, 10)
        : String(results.date); // expect "YYYY-MM-DD"

    const rideData: CreateRideInput = {
      driverId: userId,
      from: results.from,
      to: results.to,
      date: rideDate, // ✅ use the normalized date
      time: results.time,
      availableSeats: results.availableSeats,
    };

    const ride = await createRide(rideData);
    return r.success(ride, "Ride created successfully");
  } catch (error) {
    console.error("RidesController [createRideController] Error:", error);
    return (res as ResponseWithHelpers).serverError(error);
  }
};

export const updateRideController: Controller = async (req, res) => {
  const r = res as ResponseWithHelpers;
  try {
    const result = await createRideSchema.validateAsync(req.body);
    const rideId = Number(req.params.rideId);
    if (!Number.isFinite(rideId) || rideId <= 0) {
      return r.fail({ message: "Invalid ride ID" });
    }
    const updatedRide = await updateRide(rideId, result);
    return r.success(updatedRide, "Ride updated successfully");
  } catch (error) {
    console.error("RidesController [updateRideController] Error:", error);
    return r.serverError(error);
  }
};

export const getallRidesController: Controller = async (req, res) => {
  const r = res as ResponseWithHelpers;
  try {
    const result = await getAllRides();
    console.log(result, "result==========================>");
    return r.success(result, "Rides fetched successfully");
  } catch (error) {
    console.error("RideController [getallRidesController] Error", error);
    return r.serverError(error);
  }
};

export const getRideByIdController: Controller = async (req, res) => {
  const r = res as ResponseWithHelpers;
  try {
    const result = await getRideById(Number(req.params.rideId));
    if (!result) {
      return r.fail({ message: "Ride not found" });
    }
    return r.success(result, "Ride fetched successfully");
  } catch (error) {
    console.error("RidesController [getRideByIdController] Error:", error);
    return r.serverError(error);
  }
};

export const deleteRideController: Controller = async (req, res) => {
  const r = res as ResponseWithHelpers;
  try {
    const result = await deleteRide(Number(req.params.rideId));
    return r.success({ message: "Ride Deleted Successfully" });
  } catch (error) {
    console.error("RideController [deleteRideController] Error.", error);
    return r.serverError(error);
  }
};
