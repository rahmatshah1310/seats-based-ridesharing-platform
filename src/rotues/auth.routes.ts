import express from "express";
import UserController from "../controllers/user.controller.js";
import { registrationUpload } from "@/middlewares/upload.mw.js";
import { authorizeRoles, ensureAuthenticated } from "@/middlewares/auth.mw.js";

const router = express.Router();

router.post("/register",registrationUpload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "vehicleImages", maxCount: 5 },
  ]), UserController.registerUser);
router.post("/login",UserController.login);
router.get("/all",ensureAuthenticated,authorizeRoles("admin"), UserController.allUsers);
router.get("/role/:role", ensureAuthenticated,authorizeRoles("admin"), UserController.getUsersByRole);
router.delete("/delete/:id", ensureAuthenticated,authorizeRoles("admin","passenger"), UserController.deleteUser);
router.get("/profile/:id", ensureAuthenticated,authorizeRoles("admin","passenger","driver"), UserController.getUserProfile);
router.get("/me", ensureAuthenticated,authorizeRoles("admin","passenger","driver"), UserController.get_me);
export default router;
