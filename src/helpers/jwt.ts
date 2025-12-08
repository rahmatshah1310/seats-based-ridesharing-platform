import jwt from "jsonwebtoken"
import type { userRole } from "@/db/types/user.types";

export interface AuthUser {
  _id: string;
  role: userRole;
  isDriverApproved: boolean;
}

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

export const generateToken = (user:AuthUser) => ({
  token: "Bearer " + jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "60d" }),
  user,
});
