import express from "express";
const router = express.Router();
import { createRideController } from "@/controllers/rides.controller";
import { authorizeRoles, ensureAuthenticated } from "@/middlewares/auth.mw.js";

router.post(
  "/createRide",
  ensureAuthenticated,
  authorizeRoles("driver"),
  createRideController,
);

export default router;
