import Express from "express";
import { ensureAuthenticated } from "@/middlewares/auth.mw";
import { getMessageController } from "@/controllers/messages.controller";
const router = Express.Router();

router.get("/", ensureAuthenticated, getMessageController);

export default router;
