import type { users } from "@/db/schema/user.model";
import type { driverProfiles } from "@/db/schema/driverProfile.model";
import type { passengerProfiles } from "@/db/schema/passengerProfile.model";

export function serializeUser(user: typeof users.$inferSelect) {
  return {
    id: user.id,
    name: user.name,
    phone: user.phone,
    role: user.role,
    city: user.city,
    district: user.district,
    country: user.country,
    profileImage: user.profileImage,
    isVerified: user.isVerified,
    isDriverApproved: user.isDriverApproved,
    averageRating: user.averageRating,
    totalRatings: user.totalRatings,
  };
}

export function serializeDriverProfile(dp: typeof driverProfiles.$inferSelect | null) {
  if (!dp) return null;
  return {
    licenseNumber: dp.licenseNumber,
    licenseExpiry: dp.licenseExpiry,
    vehicleModel: dp.vehicleModel,
    vehicleColor: dp.vehicleColor,
    vehicleName: dp.vehicleName,
    vehicleNumberPlate: dp.vehicleNumberPlate,
    verificationStatus: dp.verificationStatus,
    isComplete: dp.isComplete,
  };
}

export function serializePassengerProfile(pp: typeof passengerProfiles.$inferSelect | null) {
  if (!pp) return null;
  return {
    city: pp.city,
    district: pp.district,
    country: pp.country,
    isComplete: pp.isComplete,
  };
}
