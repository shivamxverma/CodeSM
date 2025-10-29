import httpStatus from 'http-status';
import asyncHandler from '../../utils/asyncHandler';
import { Request, Response } from 'express';
import ApiError from '../../utils/apiError';
import apiResponse from '../../utils/apiResponse';
import {verifyRefreshToken} from '../../shared/jwt'

import {
    handleRefreshToken,
    hashPassword,
    verifyHashPassword
} from './auth-service';

import { setAuthCookies } from './auth-helper';

const registerUser = asyncHandler(async (req : Request, res : Response) => {
    const { role,fullName, email, username, password }  = req.body;

    if (
        [role,fullName, email, password, username].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required");
    }

    if(!['user','author','admin'].includes(role.toLowerCase())){
        throw new ApiError(400,"Role is Invalid");
    }

    const hashedPassword = await hashPassword(password);
    if (!hashedPassword) {
        throw new ApiError(500, "Something Went Wrong While Hashing Password");
    }

    const ExistedUser = await User.findOne({ $or : [{username},{email}]});

    if (ExistedUser) {
        throw new ApiError(409, "Username or Email already exists");
    }


    const user = await User.create({
            username: username,
            email,
            fullName,
            password: hashedPassword,
            role : role.toLowerCase()
    });

    const CreatedUser = await User.findById(user._id).select("-password -refreshToken");

    if (!CreatedUser) {
        throw new ApiError(500, "SomeThing Went Wrong Registering User");
    }

    return res.status(201).json(
        new apiResponse(200, CreatedUser, "User Registered Succesfully")
    );
});

const loginUser = asyncHandler(async (req : Request, res : Response) => {
    const {username,email,password } = req.body;

    if (!username && !email && !password) {
        throw new ApiError(400, 'Username or Email is Required');
    }

    const user = await User.findOne({ $or: [{ username }, { email }] });

    if (!user) {
        throw new ApiError(404, "User doesn't Exist");
    }

    const isPasswordValid = verifyHashPassword(password,user.password);

    if (!isPasswordValid) {
        throw new ApiError(401, 'Invalid password');
    }

    const { accessToken, refreshToken } = await handleRefreshToken(user);

    const response = {
        accessToken,
        refreshToken
    }


    if (!accessToken || !refreshToken) {
        throw new ApiError(500, 'Failed to generate tokens');
    }

    const loggedInUser = await User.findById(user._id).select('-password -refreshToken');


    const responseData = setAuthCookies(res ,response, origin);

    return res.json(
        new apiResponse(
            200,
            {
                user: loggedInUser,
                accessToken,
                refreshToken,
                data : responseData
            },
            'User Logged In Successfully'
        )
    );
});

const LogoutUser = asyncHandler(async (req : Request, res : Response) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    );

    const options : any = {
        httpOnly: true,
        secure: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: 'Strict',
    }

    return res
        .status(200)
        .clearCookie("accessToken",options)
        .clearCookie("refreshToken",options)
        .json(new apiResponse(200, {}, "User logged out"));
});

const refreshAccessToken = asyncHandler(async (req : Request, res : Response) => {
  const incomingRefreshToken = req.cookies?.refreshToken || req.header("Authorization")?.replace("Bearer ", "");
  if (!incomingRefreshToken) {
    return res.status(401).json({ message: "Unauthorized request" });
  }

  try {
    const decodedToken = verifyRefreshToken(incomingRefreshToken);

    const user = await User.findById(decodedToken?._id);
    if (!user) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    if (incomingRefreshToken !== user.refreshToken) {
      return res.status(401).json({ message: "Refresh token expired or used" });
    }

    const {accessToken,refreshToken} = await handleRefreshToken(user);

    const response = {
        accessToken,
        refreshToken
    }

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    const responseData = setAuthCookies(res ,response, origin);

    res
      .status(200)
      .json({ accessToken, refreshToken });
  } catch (error) {
    return res.status(401).json({ message: "Invalid refresh token" });
  }
});


export {
    registerUser,
    loginUser,
    LogoutUser,
    refreshAccessToken,
};