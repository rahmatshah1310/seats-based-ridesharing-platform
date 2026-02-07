import { rides } from "@/db/schema/rides.model";
import { db } from "@/db/db";
import { eq } from "drizzle-orm";
import type { CreateRideInput } from "@/db/types/ride.types";
import { normalizeDateOnly } from "@/helpers/normalizeDate";

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
  rideId: number,
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

export const getAllRides = async () => {
  try {
    const result = await db.select().from(rides);
    return result;
  } catch (error) {
    console.error("RidesService [getAllRides] Error:", error);
    throw error;
  }
};
