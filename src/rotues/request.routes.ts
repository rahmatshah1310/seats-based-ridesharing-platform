import express from "express";
const router = express.Router();
import {
  createRideRequestController,
  deleteRideRequestController,
  getAllRideRequestsController,
  getRideRequestByIdController,
  requestToSpecificRideController,
  respondToRideRequestController,
  updateRideRequestController,
} from "@/controllers/rideRequest.controller";
import { authorizeRoles, ensureAuthenticated } from "@/middlewares/auth.mw.js";

router.get(
  "/getAllRideRequests",
  ensureAuthenticated,
  authorizeRoles("passenger"),
  getAllRideRequestsController,
);

router.get(
  "/getRideRequestById/:id",
  ensureAuthenticated,
  authorizeRoles("passenger"),
  getRideRequestByIdController,
);

router.post(
  "/createRideRequest",
  ensureAuthenticated,
  authorizeRoles("passenger"),
  createRideRequestController,
);

router.post(
  "/requestToSpecificRide/:id",
  ensureAuthenticated,
  authorizeRoles("passenger"),
  requestToSpecificRideController,
);

router.post(
  "/respondToRideRequest/:id",
  ensureAuthenticated,
  authorizeRoles("passenger", "driver"),
  respondToRideRequestController,
);

router.put(
  "/updateRideRequest/:id",
  ensureAuthenticated,
  authorizeRoles("passenger"),
  updateRideRequestController,
);

router.delete(
  "/deleteRideRequest/:id",
  ensureAuthenticated,
  authorizeRoles("passenger"),
  deleteRideRequestController,
);
export default router;
