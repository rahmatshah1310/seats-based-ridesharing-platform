
import type { rideStatusEnum } from "../schema/enums";

export interface CreateRideInput{
    driverId: number;
    vehicleId: number;
    from: string;
    to: string;
    departureTime: string;
    availableSeats: number;
    bookedSeats: number;
    passengers: number[];
    distanceKm: number;
    status: (typeof rideStatusEnum.enumValues)[number];
    cancellationReason: string;
    cancelledAt: string;
    cancelledBy: number;
}