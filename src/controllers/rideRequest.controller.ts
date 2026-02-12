import {
  createRideRequest,
  updateRideRequest,
  getAllRideRequests,
  requestToSpecificRide,
} from "@/services/rideRequest.service";
import type { Controller } from "@/db/types/controller";
import type { ResponseWithHelpers } from "@/middlewares/response.mw";
import {
  createRideRequestSchema,
  requestToSpecificRideSchema,
  updateRideRequestSchema,
} from "../validations/request.schema";

export const createRideRequestController: Controller = async (req, res) => {
  const r = res as ResponseWithHelpers;
  try {
    const result = await createRideRequestSchema.validateAsync(req.body);
    const passengerId = req.user?._id;
    if (!passengerId || passengerId.trim() === "") {
      return r.fail({ message: "Invalid passenger ID" });
    }
    const rideRequest = await createRideRequest({ ...result, passengerId });
    return r.success(rideRequest, "Ride Request created successfully");
  } catch (error) {
    console.error(
      "RideRequestController [createRideRequestController] Error:",
      error,
    );
    return r.serverError(error);
  }
};

export const requestToSpecificRideController: Controller = async (req, res) => {
  const r = res as ResponseWithHelpers;

  try {
    const passengerId = req.user?._id;
    const { id: rideId } = req.params;
    const { requiredSeats } = req.body;

    if (!passengerId) {
      return r.fail({ message: "Unauthorized" });
    }

    const rideRequest = await requestToSpecificRide(
      passengerId,
      rideId,
      requiredSeats,
    );

    return r.success(rideRequest, "Ride requested successfully");
  } catch (error) {
    console.error(
      "RideRequestController [requestToSpecificRideController] Error:",
      error,
    );
    return r.serverError(error);
  }
};

export const updateRideRequestController: Controller = async (req, res) => {
  const r = res as ResponseWithHelpers;

  try {
    const result = await updateRideRequestSchema.validateAsync(req.body);

    const passengerId = req.user?._id;
    const requestId = req.params.id;

    if (!passengerId || passengerId.trim() === "") {
      return r.fail({ message: "Invalid passenger ID" });
    }

    const rideRequest = await updateRideRequest(result, requestId);

    return r.success(rideRequest, "Ride Request updated successfully");
  } catch (error) {
    console.error(
      "RideRequestController [updateRideRequestController] Error:",
      error,
    );
    return r.serverError(error);
  }
};

export const getAllRideRequestsController: Controller = async (req, res) => {
  const r = res as ResponseWithHelpers;
  try {
    const rideRequests = await getAllRideRequests();
    return r.success(rideRequests, "Ride Requests retrieved successfully");
  } catch (error) {
    console.error(
      "RideRequestController [getAllRideRequestsController] Error:",
      error,
    );
    return r.serverError(error);
  }
};
