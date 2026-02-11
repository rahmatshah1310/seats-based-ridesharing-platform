import type { rideRequestStatusEnum } from "../schema/enums";

export interface CreateRideRequestInput {
  from: string;
  to: string;
  date: string;
  time: string;
  requiredSeats: number;
  bookedSeats: number;
  passengers: number[];
  distanceKm: number;
  status: (typeof rideRequestStatusEnum.enumValues)[number];
}
