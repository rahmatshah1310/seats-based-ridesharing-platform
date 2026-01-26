import express from "express";
import { registerUser, login, allUsers, getUsersByRole, deleteUser, getUserProfile, get_me, driverApprove } from "../controllers/user.controller.js";
import { registrationUpload } from "@/middlewares/upload.mw.js";
import { authorizeRoles, ensureAuthenticated } from "@/middlewares/auth.mw.js";

const router = express.Router();

router.post(
  "/register",
  registrationUpload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "vehicleImages", maxCount: 5 },
  ]),
  registerUser,
);
router.post("/login", login);
router.get(
  "/all",
  ensureAuthenticated,
  authorizeRoles("admin"),
  allUsers,
);
router.get(
  "/role/:role",
  ensureAuthenticated,
  authorizeRoles("admin"),
  getUsersByRole,
);
router.delete(
  "/delete/:id",
  ensureAuthenticated,
  authorizeRoles("admin", "passenger"),
  deleteUser,
);
router.get(
  "/profile/:id",
  ensureAuthenticated,
  authorizeRoles("admin", "passenger", "driver"),
  getUserProfile,
);
router.get(
  "/me",
  ensureAuthenticated,
  authorizeRoles("admin", "passenger", "driver"),
  get_me,
);
router.put(
  "/driver/approve/:id",
  ensureAuthenticated,
  authorizeRoles("admin"),
  driverApprove,
);
export default router;
