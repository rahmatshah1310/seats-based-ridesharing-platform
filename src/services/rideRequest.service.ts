import { rideRequests } from "@/db/schema/rideRequest.model";
import { db } from "@/db/db";
import { eq, and, sql, desc } from "drizzle-orm";
import type { CreateRideRequestInput } from "@/db/types/rideRequest.types";
import { rides } from "@/db/schema/rides.model";
import { normalizeDateOnly } from "@/helpers/normalizeDate";
import { AppError } from "@/helpers/appError";

export const createRideRequest = async (
  requestData: CreateRideRequestInput,
) => {
  try {
    const normalizedData: CreateRideRequestInput = {
      ...requestData,
      passengerId: requestData.passengerId,
      date: normalizeDateOnly(requestData.date),
    };

    const [existingRequest] = await db
      .select()
      .from(rideRequests)
      .where(
        and(
          eq(rideRequests.passengerId, normalizedData.passengerId),
          eq(rideRequests.date, normalizedData.date),
          eq(rideRequests.status, "open"),
        ),
      );

    if (existingRequest) {
      throw new AppError(
        "You already have an active request for this date",
        409,
      );
    }

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

export const respondToRideRequest = async (
  requestId: string,
  responderId: string,
  response: "accepted" | "declined",
) => {
  try {
    return await db.transaction(async (tx) => {
      const [request] = await tx
        .select()
        .from(rideRequests)
        .where(eq(rideRequests.id, requestId));

      if (!request) throw new AppError("Ride request not found", 404);

      const isDriver = request.matchedDriverId === responderId;
      const isPassenger = request.passengerId === responderId;

      if (!isDriver && !isPassenger) throw new AppError("Unauthorized", 403);

      // If already final state
      if (request.status !== "open" && request.status !== "matched") {
        throw new AppError("Request already processed", 400);
      }

      // Decline path (driver OR passenger)
      if (response === "declined") {
        // If driver had already accepted earlier, you may want to restore seats
        // (Only if you previously reserved seats on driver acceptance)
        const driverAlreadyAccepted = request.driverResponse === "accepted";
        if (driverAlreadyAccepted && request.matchedRideId) {
          await tx
            .update(rides)
            .set({
              availableSeats: sql`${rides.availableSeats} + ${request.requiredSeats}`,
              bookedSeats: sql`${rides.bookedSeats} - ${request.requiredSeats}`,
            })
            .where(eq(rides.id, request.matchedRideId));
        }

        await tx
          .update(rideRequests)
          .set({
            status: "declined",
            driverResponse: isDriver ? "declined" : request.driverResponse,
            passengerResponse: isPassenger
              ? "declined"
              : request.passengerResponse,
          })
          .where(eq(rideRequests.id, requestId));

        return { message: "Request declined!" };
      }

      // ACCEPT path
      // Passenger accepts: just set passengerResponse
      if (isPassenger) {
        const [updated] = await tx
          .update(rideRequests)
          .set({
            passengerResponse: "accepted",
            // if driver already accepted, mark matched
            status: request.driverResponse === "accepted" ? "matched" : "open",
          })
          .where(eq(rideRequests.id, requestId))
          .returning();

        return { message: "Passenger accepted!", request: updated };
      }

      // Driver accepts: reserve seats atomically
      if (!request.matchedRideId)
        throw new AppError("Ride not linked yet", 400);

      const updatedRide = await tx
        .update(rides)
        .set({
          availableSeats: sql`${rides.availableSeats} - ${request.requiredSeats}`,
          bookedSeats: sql`${rides.bookedSeats} + ${request.requiredSeats}`,
        })
        .where(
          and(
            eq(rides.id, request.matchedRideId),
            sql`${rides.availableSeats} >= ${request.requiredSeats}`,
          ),
        )
        .returning({ id: rides.id });

      if (updatedRide.length === 0) {
        await tx
          .update(rideRequests)
          .set({ status: "declined", driverResponse: "declined" })
          .where(eq(rideRequests.id, requestId));

        throw new AppError("Not enough seats available", 409);
      }

      const [updatedRequest] = await tx
        .update(rideRequests)
        .set({
          driverResponse: "accepted",
          // if passenger already accepted, mark matched
          status: request.passengerResponse === "accepted" ? "matched" : "open",
        })
        .where(eq(rideRequests.id, requestId))
        .returning();

      return { message: "Driver accepted!", request: updatedRequest };
    });
  } catch (error) {
    console.error("RideRequestService [respondToRideRequest] Error:", error);
    throw error;
  }
};

export const requestToSpecificRide = async (
  passengerId: string,
  rideId: string,
  requiredSeats: number,
) => {
  try {
    return await db.transaction(async (tx) => {
      // 1) Fetch ride
      const [ride] = await tx.select().from(rides).where(eq(rides.id, rideId));

      if (!ride) throw new AppError("Ride not found", 404);
      if (ride.status !== "scheduled")
        throw new AppError("This ride is not available for booking", 400);

      if (ride.availableSeats <= 0)
        throw new AppError("All seats are already booked", 400);

      if (requiredSeats > ride.availableSeats)
        throw new AppError("Not enough available seats", 409);

      if (ride.driverId === passengerId)
        throw new AppError("You cannot request your own ride", 400);

      // 2) If already has an open request for this same ride -> stop
      const [existingRequest] = await tx
        .select()
        .from(rideRequests)
        .where(
          and(
            eq(rideRequests.passengerId, passengerId),
            eq(rideRequests.matchedRideId, rideId),
            eq(rideRequests.status, "open"),
          ),
        );

      if (existingRequest) {
        throw new AppError(
          "You already have an active request for this ride",
          409,
        );
      }

      // 3) Create the ride request directly from ride fields
      const [newRequest] = await tx
        .insert(rideRequests)
        .values({
          passengerId,
          from: ride.from,
          to: ride.to,
          date: ride.date,
          time: ride.time,
          requiredSeats,
          status: "open",
          matchedDriverId: ride.driverId,
          matchedRideId: rideId,
          passengerResponse: "pending",
          driverResponse: "pending",
          // approxFarePerSeat: ride.someFareField ?? null, // if you have it
        })
        .returning();

      if (!newRequest) {
        throw new AppError("Failed to create ride request", 500);
      }

      return newRequest;
    });
  } catch (error) {
    console.error("RideRequestService Error:", error);
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

export const getAllRideRequests = async (page: number = 1, pageSize: number = 10) => {
  try {
    const offset = (page - 1) * pageSize
    const result = await db.select().from(rideRequests).orderBy(desc(rideRequests.createdAt)).limit(pageSize).offset(offset);
    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(rideRequests)
    return {
      rideRequests: result,
      pagination: {
        total: Number(count),
        page,
        pageSize,
        totalPages: Math.ceil(Number(count) / pageSize)
      }
    };
  } catch (error) {
    console.error("RideRequestService [getAllRideRequests] Error:", error);
    throw error;
  }
};

export const getRideRequestById = async (
  requestId: string,
  passengerId: string,
) => {
  try {
    const [rideRequest] = await db
      .select()
      .from(rideRequests)
      .where(
        and(
          eq(rideRequests.id, requestId),
          eq(rideRequests.passengerId, passengerId),
        ),
      );

    return rideRequest;
  } catch (error) {
    console.error("RideRequestService [getRideRequestById] Error:", error);
    throw error;
  }
};

export const deleteRideRequest = async (requestId: string) => {
  try {
    await db.delete(rideRequests).where(eq(rideRequests.id, requestId));
  } catch (error) {
    console.error("RideRequestService [deleteRideRequest] Error:", error);
    throw error;
  }
};
