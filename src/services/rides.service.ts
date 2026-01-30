import { rides } from "@/db/schema/rides.model";
import { db } from "@/db/db";
import type { CreateRideInput } from "@/db/types/ride.types";

export const createRide = async (rideData: CreateRideInput) => {
  try {
    console.log(rideData, "ridedata==================>");
    const ride = db.insert(rides).values(rideData).returning();
    return ride;
  } catch (error) {
    console.error("RidesService [createRide] Error:", error);
    throw error;
  }
};
