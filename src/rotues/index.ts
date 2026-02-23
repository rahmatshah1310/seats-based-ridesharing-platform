import Express from "express";
const router = Express.Router();
import authRotues from "./auth.routes";
import rideRoutes from "./ride.routes";
import requestRoutes from "./request.routes";
import ratingRoutes from "./rating.routes";
import paymentRoutes from "./payment.routes";

router.use("/auth", authRotues);
router.use("/rides", rideRoutes);
router.use("/requests", requestRoutes);
router.use("/rating", ratingRoutes);
router.use("/payments", paymentRoutes);
export default router;
