import {
  createRideRequest,
  updateRideRequest,
  getAllRideRequests,
  requestToSpecificRide,
  getRideRequestById,
  deleteRideRequest,
  respondToRideRequest,
} from "@/services/rideRequest.service";
import type { Controller } from "@/db/types/controller";
import type { ResponseWithHelpers } from "@/middlewares/response.mw";
import {
  createRideRequestSchema,
  requestToSpecificRideSchema,
  updateRideRequestSchema,
} from "../validations/request.schema";
import { AppError } from "@/helpers/appError";

export const createRideRequestController: Controller = async (req, res) => {
  const r = res as ResponseWithHelpers;
  try {
    const result = await createRideRequestSchema.validateAsync(req.body);
    const passengerId = req.user?._id;
    if (!passengerId || passengerId.trim() === "") {
      return r.fail({ message: "Invalid passenger ID" });
    }
    const rideRequest = await createRideRequest({ ...result, passengerId });

    const io = req.app.get("io")
    if (io) {
      io.to("driver").emit("ride:request:new", rideRequest);
    }

    return r.success(rideRequest, "Ride Request created successfully");
  } catch (error) {
    console.error(
      "RideRequestController [createRideRequestController] Error:",
      error,
    );
    if (error instanceof AppError)
      return r.fail(error.message, error.statusCode);
    return r.serverError(error);
  }
};

export const respondToRideRequestController: Controller = async (req, res) => {
  const r = res as ResponseWithHelpers;
  try {
    const { id: requestId } = req.params;
    const { response } = req.body;

    if (!requestId || !response) {
      return r.fail({ message: "Missing required fields" });
    }

    const result = await respondToRideRequest(
      requestId,
      req.user?._id!,
      response,
    );

    const io = req.app.get("io")
    if (io) {
      io.to("driver").emit("ride:request:passengerResponse", result);
      io.to("passenger").emit("ride:request:driverResponse", result);
    }
    return r.success(result, "Ride request responded to successfully");
  } catch (error) {
    console.error(
      "RideRequestController [respondToRideRequestController] Error:",
      error,
    );
    if (error instanceof AppError)
      return r.fail(error.message, error.statusCode);
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

    const io = req.app.get("io")
    if (io) {
      io.to("driver").emit("ride:request:specific", rideRequest);
    }
    return r.success(rideRequest, "Ride requested successfully");
  } catch (error) {
    console.error(
      "RideRequestController [requestToSpecificRideController] Error:",
      error,
    );
    if (error instanceof AppError)
      return r.fail(error.message, error.statusCode);
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
    if (error instanceof AppError)
      return r.fail(error.message, error.statusCode);
    return r.serverError(error);
  }
};

export const getAllRideRequestsController: Controller = async (req, res) => {
  const r = res as ResponseWithHelpers;
  try {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 10;
    const rideRequests = await getAllRideRequests(page, pageSize);
    return r.success(rideRequests, "Ride Requests retrieved successfully");
  } catch (error) {
    console.error(
      "RideRequestController [getAllRideRequestsController] Error:",
      error,
    );
    if (error instanceof AppError)
      return r.fail(error.message, error.statusCode);
    return r.serverError(error);
  }
};

export const getRideRequestByIdController: Controller = async (req, res) => {
  const r = res as ResponseWithHelpers;
  try {
    const requestId = req.params.id;
    const passengerId = req.user?._id;

    const rideRequest = await getRideRequestById(requestId, passengerId);
    return r.success(rideRequest, "Ride Request retrieved successfully");
  } catch (error) {
    console.error(
      "RideRequestController [getRideRequestByIdController] Error:",
      error,
    );
    if (error instanceof AppError)
      return r.fail(error.message, error.statusCode);
    return r.serverError(error);
  }
};

export const deleteRideRequestController: Controller = async (req, res) => {
  const r = res as ResponseWithHelpers;
  try {
    const passengerId = req.user?._id;
    const requestId = req.params.id;

    await deleteRideRequest(requestId);
    return r.success(null, "Ride Request deleted successfully");
  } catch (error) {
    console.error(
      "RideRequestController [deleteRideRequestController] Error:",
      error,
    );
    if (error instanceof AppError)
      return r.fail(error.message, error.statusCode);
    return r.serverError(error);
  }
};
