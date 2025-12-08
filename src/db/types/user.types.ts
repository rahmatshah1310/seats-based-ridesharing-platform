export type userRole = "admin" | "passenger" | "driver";

export interface CreateUserInput {
  name: string;
  phone: string;
  cnic: string;
  city: string;
  district: string;
  country: string;
  role?: userRole;
  profileImage?: string;
  vehicleImages?: string[];
  vehicleName?: string;
  vehicleNumberPlate?: string;
  licenseNumber?: string;
  vehicleModel?: string;
  vehicleColor?: string;
}
