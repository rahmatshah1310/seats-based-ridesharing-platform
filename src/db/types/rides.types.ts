import type { rideStatusEnum } from "../schema/enums";

export interface CreateRideInput {
  driverId: string;
  from: string;
  to: string;
  date: string;
  time: string;
  availableSeats: number;
}
