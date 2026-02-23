import Express from "express";
import multer from "multer";
import { jotformWebhookController } from "@/controllers/webhook.controller";
import { stripeWebhookController } from "@/controllers/stripe.webhook.controller";

const router = Express.Router();
const upload = multer();

// Jotform sends data as multipart/form-data
router.post("/jotform", upload.none(), jotformWebhookController);

// Stripe webhook (requires raw body, handled in app.ts)
router.post("/stripe", stripeWebhookController);

export default router;
