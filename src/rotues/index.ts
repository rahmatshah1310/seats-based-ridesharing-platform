import Express from "express";
const router = Express.Router();
import authRotues from "./auth.routes";

router.use("/auth", authRotues);
export default router;
