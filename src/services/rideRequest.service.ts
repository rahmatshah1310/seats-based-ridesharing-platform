import { rideRequests } from "@/db/schema/rideRequest.model";
import { db } from "@/db/db";
import { eq } from "drizzle-orm";
import type { CreateRideRequestInput } from "@/db/types/rideRequest.types";
import { rides } from "@/db/schema/rides.model";
import { normalizeDateOnly } from "@/helpers/normalizeDate";

export const createRideRequest = async (
  requestData: CreateRideRequestInput,
) => {
  try {
    const normalizedData: CreateRideRequestInput = {
      ...requestData,
      passengerId: requestData.passengerId,
      date: normalizeDateOnly(requestData.date),
    };
    const [rideRequest] = await db
      .insert(rideRequests)
      .values(normalizedData)
      .returning();
    return rideRequest;
  } catch (error) {
    console.error("RideRequestService [createRideRequest] Error:", error);
    throw error;
  }
};

export const requestToSpecificRide = async (
  requestId: string,
  rideId: string,
  requiredSeats: number,
) => {
  try {
    // 1️⃣ Get the ride to extract driverId
    const [ride] = await db.select().from(rides).where(eq(rides.id, rideId));

    if (!ride) {
      throw new Error("Ride not found");
    }

    // 2️⃣ Update ride request
    const [updatedRequest] = await db
      .update(rideRequests)
      .set({
        matchedRideId: rideId,
        matchedDriverId: ride.driverId,
        status: "open",
        driverResponse: "pending",
        requiredSeats: requiredSeats,
      })
      .where(eq(rideRequests.id, requestId))
      .returning();

    return updatedRequest;
  } catch (error) {
    console.error("RideRequestService [requestToSpecificRide] Error:", error);
    throw error;
  }
};

export const updateRideRequest = async (
  requestData: CreateRideRequestInput,
  requestId: string,
) => {
  try {
    const normalizedData: CreateRideRequestInput = {
      ...requestData,
      date: normalizeDateOnly(requestData.date),
    };
    const [rideRequest] = await db
      .update(rideRequests)
      .set(normalizedData)
      .where(eq(rideRequests.id, requestId))
      .returning();

    return rideRequest;
  } catch (error) {
    console.error("RideRequestService [updateRideRequest] Error:", error);
    throw error;
  }
};

export const getAllRideRequests = async () => {
  try {
    const result = await db.select().from(rideRequests);
    return result;
  } catch (error) {
    console.error("RideRequestService [getAllRideRequests] Error:", error);
    throw error;
  }
};
