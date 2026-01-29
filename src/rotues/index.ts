import Express from "express";
const router = Express.Router();
import authRotues from "./auth.routes";
import rideRoutes from "./ride.routes";

router.use("/auth", authRotues);
router.use("/rides", rideRoutes);
export default router;
