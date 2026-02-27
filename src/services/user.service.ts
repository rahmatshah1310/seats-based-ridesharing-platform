import { users } from "@/db/schema/user.model";
import { driverProfiles } from "@/db/schema/driverProfile.model";
import { passengerProfiles } from "@/db/schema/passengerProfile.model";
import { db } from "@/db/db";
import { and, desc, eq, ne, sql } from "drizzle-orm";
import type { CreateUserInput, userRole } from "@/db/types/user.types";
import { stripe } from "@/libs/stripe";

export const createUser = async (userData: CreateUserInput) => {
  try {
    return await db.transaction(async (tx) => {
      const [user] = await tx
        .insert(users)
        .values({
          name: userData.name,
          phone: userData.phone,
          email: userData.email,
          cnic: userData.cnic,
          city: userData.city,
          district: userData.district,
          country: userData.country,
          profileImage: userData.profileImage ?? null,
          vehicleImages:
            userData.role === "driver"
              ? (userData.vehicleImages ?? null)
              : null,
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
        // Create Stripe Customer
        let stripeCustomerId: string | undefined;
        if (user.email) {
          try {
            const customer = await stripe.customers.create({
              email: user.email,
              name: user.name,
              metadata: { userId: user.id },
            });
            stripeCustomerId = customer.id;

            // Update user record with stripeCustomerId
            await tx.update(users).set({ stripeCustomerId }).where(eq(users.id, user.id));
          } catch (stripeError) {
            console.error("Stripe Customer Creation Error:", stripeError);
          }
        }

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

export const getUserById = async (userId: string) => {
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

export const getCurrentUser = async (userId: string) => {
  try {
    if (!userId || userId.trim() === "") {
      throw new Error("Invalid user id");
    }

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

export const getAllUsers = async (page: number = 1, pageSize: number = 10) => {
  try {

    const offset = (page - 1) * pageSize
    const usersList = await db
      .select()
      .from(users)
      .where(and(eq(users.isDeleted, false), ne(users.role, "admin"))).orderBy(desc(users.createdAt)).limit(pageSize).offset(offset)

    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(users).where(and(eq(users.isDeleted, false), ne(users.role, "admin")))

    return {
      users: usersList,
      pagination: {
        total: Number(count),
        page,
        pageSize,
        totalPages: Math.ceil(Number(count) / pageSize)
      }
    };
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

export const deleteUsers = async (userId: string) => {
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

export const approveDriver = async (userId: string) => {
  try {
    if (!userId) {
      throw new Error("User id is required");
    }
    const approveDriver = await db
      .update(users)
      .set({
        isDriverApproved: true,
      })
      .where(eq(users.id, userId));

    if (!approveDriver) {
      throw new Error("Could not approve driver");
    }
    return approveDriver;
  } catch (error) {
    console.error("UserService [approveDriver] Error:", error);
    throw new Error("Could not approve driver");
  }
};
