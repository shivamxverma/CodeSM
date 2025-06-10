import { Router } from "express";
import {registerUser,loginUser,LogoutUser} from "../controllers/user.controller.js";
const router = Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.post("/logout", LogoutUser);


export default router;