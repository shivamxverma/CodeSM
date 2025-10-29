import { Router } from "express";
import {registerUser,loginUser,LogoutUser,refreshAccessToken} from "../controllers/user.controller.js";
// import {upload} from '../middlewares/multer.middleware.js';
import {verifyJWT} from "../middlewares/auth.middleware.js";
const router = Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/logout", verifyJWT, LogoutUser);

router.post("/token",refreshAccessToken);


export default router;