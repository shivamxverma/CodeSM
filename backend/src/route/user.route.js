import { Router } from "express";
import {registerUser,loginUser,LogoutUser} from "../controllers/user.controller.js";
import {upload} from '../middlewares/multer.middleware.js';
import {verifyJWT} from "../middlewares/auth.middleware.js";
const router = Router();

router.post("/register", upload.single('avatar'), registerUser);

router.post("/login", loginUser);

router.get("/logout", verifyJWT, LogoutUser);


export default router;