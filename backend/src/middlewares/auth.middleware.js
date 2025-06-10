import {ApiError}  from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from 'jsonwebtoken';
import {User} from '../model/user.model.js';


export const verifyJWT = asyncHandler(async(req,res , next)=>{
    try {
        // console.log("Cookies:", req.cookies);
        const token = req.cookies?.AccessToken || req.header("Authorization")?.replace("Bearer ","");
        // console.log(token);
        if(!token){
            throw new ApiError(401,"Unauthorized Request");
        }
    
        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);

        console.log(decodedToken);
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
    
        if(!user){
            throw new ApiError(401,"Invalid Access Token")
        }
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid Access Token");
    }
})
