import Express from "express";
import { createCheckoutSession } from "@/controllers/payment.controller";
import { ensureAuthenticated } from "@/middlewares/auth.mw";

const router = Express.Router();

router.post("/checkout-session", ensureAuthenticated, createCheckoutSession);

export default router;
