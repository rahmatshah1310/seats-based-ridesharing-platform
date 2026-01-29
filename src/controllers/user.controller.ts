import {
  createUser,
  getUserById,
  getAllUsers,
  getUserByRole,
  deleteUsers,
  loginUser,
  getCurrentUser,
  approveDriver,
} from "@/services/user.service";
import type { userRole } from "@/db/types/user.types";
import type { Controller } from "@/db/types/controller";
import type { ResponseWithHelpers } from "@/middlewares/response.mw";
import {
  serializeUser,
  serializeDriverProfile,
  serializePassengerProfile,
} from "@/helpers/serializeProfile";
import { generateToken } from "@/helpers/jwt";

export const registerUser: Controller = async (req, res) => {
  const r = res as ResponseWithHelpers;
  try {
    const body = { ...req.body };

    if (req.files && !Array.isArray(req.files)) {
      if (req.files.profileImage && req.files.profileImage.length > 0) {
        body.profileImage = req.files.profileImage[0]?.path;
      }

      if (
        body.role === "driver" &&
        req.files.vehicleImages &&
        req.files.vehicleImages.length > 0
      ) {
        body.vehicleImages = req.files.vehicleImages.map((f: any) => f.path);
      }
    }

    const user = await createUser(body);
    r.success({ phone: user.phone }, "User registered successfully");
  } catch (error) {
    return r.fail((error as Error).message);
    console.error("UserController [registerUser] Error:", error);
    r.serverError(error);
  }
};

export const login: Controller = async (req, res) => {
  const r = res as ResponseWithHelpers;
  try {
    const phone = req.body.phone;
    const userData = await loginUser(phone);
    if (!userData) {
      return r.fail("User not found.Please check your phone number");
    }
    // Serialize the user
    const serializedUser = serializeUser(userData);

    // Serialize profile based on role
    let serializedProfile = null;
    if (
      userData.role === "driver" &&
      "driverProfile" in userData &&
      userData.driverProfile
    ) {
      serializedProfile = serializeDriverProfile(userData.driverProfile);
    } else if (
      userData.role === "passenger" &&
      "passengerProfile" in userData &&
      userData.passengerProfile
    ) {
      serializedProfile = serializePassengerProfile(userData.passengerProfile);
    }
    const authUser = {
      _id: String(userData.id), // Convert number to string
      role: userData.role,
      isDriverApproved: userData.isDriverApproved ?? false, // Handle null
    };
    const token = generateToken(authUser);
    return r.success(
      {
        ...token,
        user: serializedUser,
        ...(serializedProfile && { profile: serializedProfile }),
      },
      "User logged in successfully",
    );
  } catch (error) {
    console.error("UserController [loginUser] Error:", error);
    r.serverError(error);
  }
};

export const get_me: Controller = async (req, res) => {
  const r = res as ResponseWithHelpers;
  try {
    const userId = Number((req as any).user?._id);

    if (!Number.isInteger(userId) || userId <= 0) {
      return r.fail("Unauthorized");
    }

    const userData = await getCurrentUser(userId);
    if (!userData) {
      return r.fail("User not found");
    }
    // Serialize the user
    const serializedUser = serializeUser(userData);

    // Serialize profile based on role
    let serializedProfile = null;
    if (
      userData.role === "driver" &&
      "driverProfile" in userData &&
      userData.driverProfile
    ) {
      serializedProfile = serializeDriverProfile(userData.driverProfile);
    } else if (
      userData.role === "passenger" &&
      "passengerProfile" in userData &&
      userData.passengerProfile
    ) {
      serializedProfile = serializePassengerProfile(userData.passengerProfile);
    }

    // Return serialized data
    return r.success(
      {
        ...serializedUser,
        ...(serializedProfile && { profile: serializedProfile }),
      },
      "Current user retrieved successfully",
    );
  } catch (error) {
    console.error("UserController [get_me] Error:", error);
    r.serverError(error);
  }
};

export const getUserProfile: Controller = async (req, res) => {
  const r = res as ResponseWithHelpers;
  try {
    const userId = Number(req.params.id);
    const user = await getUserById(userId);
    if (!user) {
      r.fail("User not found");
    }
    r.success(user, "User profile retrieved successfully");
  } catch (error) {
    console.error("UserController [getUserProfile] Error:", error);
    r.serverError(error);
  }
};

export const allUsers: Controller = async (req, res) => {
  const r = res as ResponseWithHelpers;
  try {
    const users = await getAllUsers();
    return r.success(users, "All Users Fetched Successfully");
  } catch (error) {
    console.error("UserController [getAllUsers] Error:", error);
    r.serverError(error);
  }
};

export const getUsersByRole: Controller = async (req, res) => {
  const r = res as ResponseWithHelpers;
  try {
    const role = req.params.role;
    const users = await getUserByRole(role as userRole);
    return r.success(users, " Successfully Getted Users by Role");
  } catch (error) {
    console.error("UserController [getUsersByRole] Error:", error);
    r.serverError(error);
  }
};

export const deleteUser: Controller = async (req, res) => {
  const r = res as ResponseWithHelpers;
  try {
    const userId = Number(req.params.id);
    const deletedUser = await deleteUsers(userId);
    return r.success(deletedUser, "User Deleted Successfully");
  } catch (error) {
    console.error("UserController [deleteUser] Error:", error);
    r.serverError(error);
  }
};

export const driverApprove: Controller = async (req, res) => {
  const r = res as ResponseWithHelpers;
  try {
    const userId = Number(req.params.id);
    const approvedUser = await approveDriver(userId);
    return r.success(approvedUser, "Driver Approved Successfully");
  } catch (error) {
    console.error("UserController [driverApprove] Error:", error);
    r.serverError(error);
  }
};
