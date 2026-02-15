import express from "express";
const router = express.Router();
import {
  createRideController,
  getallRidesController,
  updateRideController,
  getRideByIdController,
  deleteRideController,
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

router.get("/singleRide/:rideId", ensureAuthenticated, getRideByIdController);
router.put(
  "/updateRide/:rideId",
  ensureAuthenticated,
  authorizeRoles("driver"),
  updateRideController,
);

router.delete(
  "/deleteRide/:rideId",
  ensureAuthenticated,
  authorizeRoles("driver"),
  deleteRideController,
);

export default router;
