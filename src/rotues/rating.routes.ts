import express from "express";
const router = express.Router();
import {
  createRatingController,
  deletingRatingController,
} from "@/controllers/rating.controller";
import { authorizeRoles, ensureAuthenticated } from "@/middlewares/auth.mw.js";



router.post("/:rateeId", ensureAuthenticated, createRatingController);
router.delete("/:ratingId", ensureAuthenticated, deletingRatingController);


export default router;