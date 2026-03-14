import {
  createConversation,
  getConversationsController,
} from "@/controllers/conversation.controller";
import { ensureAuthenticated } from "@/middlewares/auth.mw";
import express from "express";
const router = express.Router();

router.post("/new", ensureAuthenticated, createConversation);
router.get("/", ensureAuthenticated, getConversationsController);

export default router;
