import Express from "express";
import authRotues from "./auth.routes";
import rideRoutes from "./ride.routes";
import requestRoutes from "./request.routes";
import ratingRoutes from "./rating.routes";
import paymentRoutes from "./payment.routes";
import conversationRoutes from "./conversation.routes";
import messagesRoutes from "./messages.routes";
const router = Express.Router();

router.use("/auth", authRotues);
router.use("/rides", rideRoutes);
router.use("/requests", requestRoutes);
router.use("/rating", ratingRoutes);
router.use("/payments", paymentRoutes);
router.use("/conversations", conversationRoutes);
router.use("/messages", messagesRoutes);

export default router;
