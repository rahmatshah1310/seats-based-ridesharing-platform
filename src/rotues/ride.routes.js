import express from "express";
const router = express.Router();
import {
  createRideController,
  getallRidesController,
  updateRideController,
} from "@/controllers/rides.controller";
import { authorizeRoles, ensureAuthenticated } from "@/middlewares/auth.mw.js";

router.get(
  "/allRides",
  ensureAuthenticated,
  authorizeRoles("driver"),
  getallRidesController,
);
router.post(
  "/createRide",
  ensureAuthenticated,
  authorizeRoles("driver"),
  createRideController,
);
router.put(
  "/updateRide/:rideId",
  ensureAuthenticated,
  authorizeRoles("driver"),
  updateRideController,
);

export default router;
