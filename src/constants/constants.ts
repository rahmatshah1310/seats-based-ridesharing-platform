export const COMMON_SAFE_USER_FIELDS = [
  "name",
  "profileImage",
  "city",
  "district",
  "country",
] as const;

// Passenger should NOT update role/phone/cnic from this API.
export const PASSENGER_RESTRICTED_USER_FIELDS = [
  "role",
  "phone",
  "cnic",
] as const;

// Driver should NOT update these from this API either.
export const DRIVER_RESTRICTED_USER_FIELDS = [
  "role",
  "phone",
  "cnic",
  "vehicleImages",
] as const;

// Driver restricted profile fields
export const DRIVER_RESTRICTED_PROFILE_FIELDS = [
  "licenseNumber",
  "licenseExpiry",
  "vehicleName",
  "vehicleColor",
  "vehicleModel",
  "vehicleNumberPlate",
  "cnic",
] as const;
