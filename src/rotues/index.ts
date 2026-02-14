import Express from "express";
const router = Express.Router();
import authRotues from "./auth.routes";
import rideRoutes from "./ride.routes";
import requestRoutes from "./request.routes";

router.use("/auth", authRotues);
router.use("/rides", rideRoutes);
router.use("/requests", requestRoutes);
export default router;
