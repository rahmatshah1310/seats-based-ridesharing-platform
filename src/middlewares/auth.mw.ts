import type { Request, Response, NextFunction, RequestHandler } from "express";
import type { ResponseWithHelpers } from "./response.mw";
import jwt from "jsonwebtoken";
import { getUserById } from "@/services/user.service";
import type { userRole } from "@/db/types/user.types";
import type { AuthUser } from "@/helpers/jwt";

export const ensureAuthenticated: RequestHandler = async (req, res, next) => {
  const r = res as ResponseWithHelpers;

  const auth = (req.headers.authorization || req.headers.Authorization) as
    | string
    | undefined;

  if (!auth) {
    return r.status(401).json({ message: "Unauthorized" });
  }

  // 👇 THIS WAS BUGGY BEFORE
  const [scheme, raw] = String(auth).split(" ");

  if (!raw || !scheme || !/^Bearer$/i.test(scheme)) {
    return r.status(401).json({ message: "Unauthorized" });
  }

  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not set");
    return r.serverError("Server misconfiguration");
  }

  try {
    const decoded = jwt.verify(raw, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });

    const userId = (decoded as { id: string }).id;
    const user = await getUserById(userId);
    if (!user) return r.fail("Unauthorized");
    if (user.status === "blocked") {
      return r.fail("Account is suspended.");
    }

    req.user = {
      _id: String(user.id),
      role: user.role,
      isDriverApproved: user.isDriverApproved ?? false,
    };
    return next();
  } catch (err) {
    console.error("Auth error:", err);
    return r.fail("Unauthorized");
  }
};

export const authorizeRoles = (...allowedRoles: userRole[]): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    const r = res as ResponseWithHelpers;

    if (!req.user) return r.fail("Unauthorized");

    // Admin bypass
    if (req.user.role === "admin") return next();

    const userRole = req.user.role;
    if (!allowedRoles.includes(userRole)) {
      return r.fail("Forbidden: insufficient role");
    }

    if (userRole === "driver" && req.user.isDriverApproved !== true) {
      return r.fail(
        "Driver account requires admin approval before accessing this feature.",
      );
    }

    return next();
  };
};
