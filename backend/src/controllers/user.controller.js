import dotenv from 'dotenv';
dotenv.config();
import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js'
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const generateAccessTokenAndRefreshToken = async (user) => {
    console.log(process.env.ACCESS_TOKEN_SECRET);

    try {

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        const accessToken = jwt.sign(
            {
                _id: user._id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '1d',
            }
        );
        const refreshToken = jwt.sign(
            {
                _id: user._id,
                role: user.role,
            },
            process.env.REFRESH_TOKEN_SECRET,
            {
                expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d',
            }
        );

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };

    } catch (error) {
        console.log(error);
        throw new ApiError(500, "Something Went Wrong While generating refresh and access token");
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, username, password } = req.body;

    if (
        [fullName, email, password, username].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required");
    }

    // if(!['user','author','admin'].includes(role.toLowerCase())){
    //     throw new ApiError(400,"Role is Invalid");
    // }

    const hashedPassword = await bcrypt.hash(password, 10);

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
    });

    const CreatedUser = await User.findById(user._id).select("-password -refreshToken");

    if (!CreatedUser) {
        throw new ApiError(500, "SomeThing Went Wrong Registering User");
    }

    return res.status(201).json(
        new ApiResponse(200, CreatedUser, "User Registered Succesfully")
    );
});

const loginUser = asyncHandler(async (req, res) => {
    const {username,email,password } = req.body;

    if (!username && !email && !password) {
        throw new ApiError(400, 'Username or Email is Required');
    }

    const user = await User.findOne({ $or: [{ username }, { email }] });

    if (!user) {
        throw new ApiError(404, "User doesn't Exist");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new ApiError(401, 'Invalid password');
    }

    const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user);


    if (!accessToken || !refreshToken) {
        throw new ApiError(500, 'Failed to generate tokens');
    }

    const loggedInUser = await User.findById(user._id).select('-password -refreshToken');


    const options = {
        httpOnly: true,
        secure: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: 'Strict',
    }

    res
        .status(200)
        .cookie('accessToken', accessToken, options)
        .cookie('refreshToken', refreshToken, options);

    return res.json(
        new ApiResponse(
            200,
            {
                user: loggedInUser,
                accessToken,
                refreshToken,
            },
            'User Logged In Successfully'
        )
    );
});

const LogoutUser = asyncHandler(async (req, res) => {
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

    const options = {
        httpOnly: true,
        secure: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: 'Strict',
    }

    return res
        .status(200)
        .clearCookie("accessToken",options)
        .clearCookie("refreshToken",options)
        .json(new ApiResponse(200, {}, "User logged out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken || req.header("Authorization")?.replace("Bearer ", "");
  if (!incomingRefreshToken) {
    return res.status(401).json({ message: "Unauthorized request" });
  }

  try {
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id);
    if (!user) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    if (incomingRefreshToken !== user.refreshToken) {
      return res.status(401).json({ message: "Refresh token expired or used" });
    }

    // const accessToken = await generateAccessTokenAndRefreshToken(user._id, user.role);

    // user.refreshToken = refreshToken;
    // await user.save({ validateBeforeSave: false });

    const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user);
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    res
      .status(200)
      .cookie("accessToken", accessToken, { httpOnly: true, secure: true })
      .cookie("refreshToken", refreshToken, { httpOnly: true, secure: true })
      .json({ accessToken, refreshToken });
  } catch (error) {
    return res.status(401).json({ message: error.message || "Invalid refresh token" });
  }
});


export {
    registerUser,
    loginUser,
    LogoutUser,
    refreshAccessToken,
};