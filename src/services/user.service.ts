import { users } from "@/db/schema/user.model";
import { driverProfiles } from "@/db/schema/driverProfile.model";
import { passengerProfiles } from "@/db/schema/passengerProfile.model";
import { db } from "@/db/db";
import { and, eq, ne } from "drizzle-orm";
import type { CreateUserInput, userRole } from "@/db/types/user.types";

type DriverReq = {
  licenseNumber: string;
  licenseExpiry: string;
  vehicleName: string;
  vehicleColor: string;
  vehicleModel: string;
  vehicleNumberPlate: string;
};

type PassengerReq = {
  city: string;
  district: string;
  country: string;
};

export const createUser = async (userData: CreateUserInput) => {
  try {
    return await db.transaction(async (tx) => {
      const [user] = await tx
        .insert(users)
        .values({
          name: userData.name,
          phone: userData.phone,
          cnic: userData.cnic,
          city: userData.city,
          district: userData.district,
          country: userData.country,
          profileImage: userData.profileImage ?? null,
          vehicleImages:
            userData.role === "driver" ? userData.vehicleImages ?? null : null,
          role: userData.role || "passenger",
        })
        .returning();

      if (!user) {
        throw new Error("Failed to create user");
      }

      if (user.role === "passenger") {
        await tx.insert(passengerProfiles).values({
          userId: user.id,
          cnic: userData.cnic,
          city: userData.city,
          district: userData.district,
          country: userData.country,
          isComplete: false,
        });
      }

      if (user.role === "driver") {
        await tx.insert(driverProfiles).values({
          userId: user.id,
          cnic: userData.cnic,
          vehicleName: userData.vehicleName!,
          vehicleNumberPlate: userData.vehicleNumberPlate!,
          licenseNumber: userData.licenseNumber!,
          vehicleModel: userData.vehicleModel!,
          vehicleColor: userData.vehicleColor!,
          isComplete: false,
          isVerified: false,
        });
      }

      return user;
    });
  } catch (error) {
    console.error("UserService [createUser] Error:", error);

    const pgError = error?.cause;
    if (pgError?.code === "23505") {
      if (pgError?.detail?.includes("phone")) {
        throw new Error("Phone number is already registered.");
      }
      if (pgError?.detail?.includes("cnic")) {
        throw new Error("CNIC is already registered.");
      }
      if (pgError?.detail?.includes("vehicle_number_plate")) {
        throw new Error("Vehicle number plate is already registered.");
      }
      if (pgError?.detail?.includes("license_number")) {
        throw new Error("License number is already registered.");
      }
    }

    throw new Error("Could not create user. Please try again.");
  }
};

export const loginUser = async (phone: string) => {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.phone, phone))
      .limit(1);
    if (!user) {
      throw new Error("User not found.Please check your phone number");
    }
    if (user.role === "driver") {
      const [driverProfile] = await db
        .select()
        .from(driverProfiles)
        .where(eq(driverProfiles.userId, user.id))
        .limit(1);
      return { ...user, driverProfile: driverProfile ?? null };
    }

    if (user.role === "passenger") {
      const [passengerProfile] = await db
        .select()
        .from(passengerProfiles)
        .where(eq(passengerProfiles.userId, user.id))
        .limit(1);
      return { ...user, passengerProfile: passengerProfile ?? null };
    }

    return user;
  } catch (error) {
    console.error("UserService [loginUser] Error:", error);
    throw new Error("Could not login user. Please try again.");
  }
};

export const getUserById = async (userId: number) => {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.id, userId), eq(users.isDeleted, false)))
      .limit(1);

    if (!user) {
      return null;
    }

    if (user.role === "passenger") {
      const [passengerProfile] = await db
        .select()
        .from(passengerProfiles)
        .where(eq(passengerProfiles.userId, userId))
        .limit(1);

      return {
        ...user,
        passengerProfile: passengerProfile ?? null,
      };
    }

    if (user.role === "driver") {
      const [driverProfile] = await db
        .select()
        .from(driverProfiles)
        .where(eq(driverProfiles.userId, userId))
        .limit(1);

      return {
        ...user,
        driverProfile: driverProfile ?? null,
      };
    }

    return user;
  } catch (error) {
    console.error("UserService [getUserById] Error:", error);
    throw new Error("Could not fetch user");
  }
};

export const getCurrentUser = async (userId: number) => {
  try {
    const currentUser = await getUserById(userId);
    if (!currentUser) {
      throw new Error("User not found");
    }
    return currentUser;
  } catch (error) {
    console.error("UserService [getCurrentUser] Error:", error);
    throw new Error("Could not fetch current user");
  }
};

export const getAllUsers = async () => {
  try {
    const usersList = await db
      .select()
      .from(users)
      .where(and(eq(users.isDeleted, false), ne(users.role, "admin")));

    return usersList;
  } catch (error) {
    console.error("UserService [getAllUsers] Error:", error);
    throw new Error("Could not fetch users");
  }
};

export const getUserByRole = async (role: userRole) => {
  try {
    const usersByRole = await db
      .select()
      .from(users)
      .where(and(eq(users.role, role), eq(users.isDeleted, false)));

    return usersByRole;
  } catch (error) {
    console.error("UserService [getUserByRole] Error:", error);
    throw new Error("Could not fetch users by role");
  }
};

export const deleteUsers = async (userId: number) => {
  try {
    const deleteUser = await db
      .update(users)
      .set({
        isDeleted: true,
        deletedAt: new Date().toISOString(),
      })
      .where(eq(users.id, userId));

    return deleteUser;
  } catch (error) {
    console.error("UserService [deleteUsers] Error:", error);
    throw new Error("Could not delete user");
  }
};

export const updateProfile = async (userId: number, updateData: {}) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new Error("User not found");
  }
  const updatedUser=await db.update(user).set({...updateData}).
};

export const changeRole = async (userId: number, targetRole: userRole) => {
  try {
    const updateUser = await db
      .update(users)
      .set({
        role: targetRole,
      })
      .where(eq(users.id, userId));
    return updateUser;
  } catch (error) {}
};
