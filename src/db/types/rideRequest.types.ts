import type { rideRequestStatusEnum } from "../schema/enums";

export interface PassengerInfo {
  passengerId: string;
  name: string;
  profileImage?: string;
  phone?: string;
}

export interface CreateRideRequestInput {
  from: string;
  to: string;
  date: string;
  time: string;
  requiredSeats: number;
  bookedSeats: number;
  passengerId: string;
  passengers: PassengerInfo[];
  distanceKm: number;
  status: (typeof rideRequestStatusEnum.enumValues)[number];
}

export interface RequestToSpecificRideInput {
  rideId: string;
  requiredSeats: number;
}
