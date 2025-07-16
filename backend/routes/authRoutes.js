import express from "express";
import { register, login, logout , incomingRefreshAccessToken} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);

router.get("/refresh-access-token", incomingRefreshAccessToken);

export default router;
