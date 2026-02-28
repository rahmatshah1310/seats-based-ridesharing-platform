import { rides } from "@/db/schema/rides.model";
import { db } from "@/db/db";
import { desc, eq, sql } from "drizzle-orm";
import type { CreateRideInput } from "@/db/types/rides.types";
import { normalizeDateOnly } from "@/helpers/normalizeDate";
import { rideRequests } from "@/db/schema/rideRequest.model";
import { users } from "@/db/schema/user.model";
import { AppError } from "@/helpers/appError";

export const createRide = async (rideData: CreateRideInput) => {
  try {
    const normalizedData: CreateRideInput = {
      ...rideData,
      date: normalizeDateOnly(rideData.date),
    };

    const [ride] = await db.insert(rides).values(normalizedData).returning();

    return ride;
  } catch (error) {
    console.error("RidesService [createRide] Error:", error);
    throw error;
  }
};

export const updateRide = async (
  rideId: string,
  updateData: Partial<CreateRideInput>,
) => {
  try {
    const normalizedData: Partial<CreateRideInput> = {
      ...updateData,
      ...(updateData.date && {
        date: normalizeDateOnly(updateData.date),
      }),
    };

    const [updatedRide] = await db
      .update(rides)
      .set(normalizedData)
      .where(eq(rides.id, rideId))
      .returning();

    if (!updatedRide) {
      throw new Error("Ride not found");
    }

    return updatedRide;
  } catch (error) {
    console.error("RidesService [updateRide] Error:", error);
    throw error;
  }
};

export const getAllRides = async (page: number = 1, pageSize: number = 10) => {
  try {
    const offset = (page - 1) * pageSize
    const result = await db.select().from(rides).orderBy(desc(rides.createdAt)).limit(pageSize).offset(offset);
    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(rides)
    return {
      rides: result,
      pagination: {
        total: Number(count),
        page,
        pageSize,
        totalPages: Math.ceil(Number(count) / pageSize)
      }
    };
  } catch (error) {
    console.error("RidesService [getAllRides] Error:", error);
    throw error;
  }
};

export const getRideById = async (rideId: string) => {
  try {
    const [ride] = await db.select().from(rides).where(eq(rides.id, rideId));

    if (!ride) {
      throw new AppError("Ride not found", 404);
    }
    const passengerRequests = await db
      .select({
        passengerId: rideRequests.passengerId,
        requiredSeats: rideRequests.requiredSeats,
        status: rideRequests.status,
        driverResponse: rideRequests.driverResponse,
        passengerResponse: rideRequests.passengerResponse,
        name: users.name,
        phone: users.phone,
        profileImage: users.profileImage,
      })
      .from(rideRequests)
      .innerJoin(users, eq(rideRequests.passengerId, users.id))
      .where(eq(rideRequests.matchedRideId, rideId));

    return {
      ...ride,
      passengers: passengerRequests,
      passengerRequestCount: passengerRequests.length,
    };
  } catch (error) {
    console.error("RidesService [getRideById] Error:", error);
    throw error;
  }
};

export const deleteRide = async (rideId: string) => {
  try {
    const result = await db.delete(rides).where(eq(rides.id, rideId));
    return result;
  } catch (error) {
    console.error("RideService [deleteRide] Error.", error);
    throw error;
  }
};
