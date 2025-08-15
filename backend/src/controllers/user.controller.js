import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/user.model.js';
import Author from '../models/author.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js'
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
dotenv.config();

const generateAccessTokenAndRefreshToken = async (userId, role) => {
    try {
        let user;
        if (role && role.toLowerCase() === "author") {
            user = await Author.findById(userId);
        } else {
            user = await User.findById(userId);
        }

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        const accessToken = jwt.sign(
            {
                _id: user._id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                role: role || (user.role ? user.role : undefined),
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '1d',
            }
        );
        const refreshToken = jwt.sign(
            {
                _id: user._id,
                role: role || (user.role ? user.role : undefined),
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
        throw new ApiError(500, "Something Went Wrong While generating refresh and access token");
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const { role,fullName, email, username, password } = req.body;

    if (
        [role,fullName, email, password, username].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required");
    }

    let ExistedUser = "";

    if (role.toLowerCase() === "author") {
        ExistedUser = await Author.findOne(
            { $or: [{ username }, { email }] }
        );
    } else if(role.toLowerCase() === "user") {
        ExistedUser = await User.findOne({
        $or: [
            { username: username },
            { email: email }
        ]
    })
    } else {
        throw new ApiError(400, "Invalid role");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (!hashedPassword) {
        throw new ApiError(500, "Something Went Wrong While Hashing Password");
    }

    if (ExistedUser) {
        throw new ApiError(409, "Username or Email already exists");
    }


    const user = role.toLowerCase() === "author"
        ? await Author.create({
            username: username,
            email,
            fullName,
            password: hashedPassword,
        })
        : await User.create({
            username: username,
            email,
            fullName,
            password: hashedPassword,
        });

    const CreatedUser = role.toLowerCase() === "author"
        ? await Author.findById(user._id).select("-password -refreshToken")
        : await User.findById(user._id).select("-password -refreshToken");

    if (!CreatedUser) {
        throw new ApiError(500, "SomeThing Went Wrong Registering User");
    }

    return res.status(201).json(
        new ApiResponse(200, CreatedUser, "User Registered Succesfully")
    );
});

const loginUser = asyncHandler(async (req, res) => {
    const {role, username, email, password } = req.body;

    if (!username && !email) {
        throw new ApiError(400, 'Username or Email is Required');
    }
    if (!role) {
        throw new ApiError(400, 'Role is required');
    }

    let user;
    if (role.toLowerCase() === "author") {
        user = await Author.findOne({ $or: [{ username }, { email }] });
    } else if (role.toLowerCase() === "user") {
        user = await User.findOne({ $or: [{ username }, { email }] });
    } else {
        throw new ApiError(400, 'Invalid role');
    }

    if (!user) {
        throw new ApiError(404, "User doesn't Exist");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new ApiError(401, 'Invalid password');
    }

    const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id, role);

    if (!accessToken || !refreshToken) {
        throw new ApiError(500, 'Failed to generate tokens');
    }

    const loggedInUser = role.toLowerCase() === "author"
        ? await Author.findById(user._id).select('-password -refreshToken')
        : await User.findById(user._id).select('-password -refreshToken');

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
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(400, "Refresh Token is required");
    }

    try {
        const docodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        const user = await User.findById(docodedToken?._id);

        if (!user) {
            throw new ApiError(404, "Invalid Refresh Token");
        }

        if (user?.refreshToken !== incomingRefreshToken) {
            throw new ApiError(403, "Invalid Refresh Token");
        }

        const options = {
            httpOnly: false,
            secure: false,
            maxAge: 24 * 60 * 60 * 1000
        }

        const { AccesToken, newRefreshToken } = await generateAccessTokenAndRefreshToken(user._id);


        return res
            .status(200)
            .cookie("AccessToken", AccesToken,options)
            .cookie("RefreshToken", newRefreshToken,options)
            .json(
                new ApiResponse(
                    200,
                    { AccesToken, newRefreshToken },
                    "Access Token is Refreshed Successfully"
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Refresh Token");
    }

});

export {
    registerUser,
    loginUser,
    LogoutUser,
    refreshAccessToken,
};