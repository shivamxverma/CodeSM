import asyncHandler from 'express-async-handler';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { User } from '../models/User.js';

const generateAccessTokenAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);

        console.log(user.generateAccessToken);
        const AccesToken = await user.generateAccessToken;
        const RefreshToken = await user.generateRefreshToken;

        console.log(AccesToken);
        console.log(RefreshToken);

        user.refreshToken = RefreshToken;

        await user.save({validateBeforeSave : false});

        return {AccesToken,RefreshToken};

    } catch (error) {
        throw new ApiError(500,"Something Went Wrong While generating refresh and access token");
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const {username, fullName, email, password, links} = req.body;
    if (
        [username, fullName, email, password, links].some(field => !field.trim() === '')
    ) {
        return res.status(400).json(new ApiError(400, 'All fields are required'));
    }

    const existingUser = await User.findOne({ 
        $or: [{ username }, { email }] 
    }).select('-password');

    if( existingUser ) {
        return res.status(400).json({ message: 'Username or email already exists' });
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar Image are required");
    }

    const avatar = await uploadFileToCloudinary(avatarLocalPath);

    if(!avatar){
        throw new ApiError(500, "Failed to upload avatar image");
    }


    const user = await User.create({
        username: username,
        email,
        fullName,
        password,
        avatar: avatar.url,
        coverImage: coverImage ? coverImage.url : null,
        links: {
            github: req.body.links?.github || null,
            linkedin: req.body.links?.linkedin || null,
            website: req.body.links?.website || null,
        },
        refreshToken: null,
    })

    const CreatedUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if(!CreatedUser){
        throw new ApiError(500, "SomeThing Went Wrong Registering User");
    }

    if (!CreatedUser) {
        throw new ApiError(500, "SomeThing Went Wrong Registering User");
    }

    return res.status(201).json(
        new ApiResponse(200, CreatedUser, "User Registered Successfully")
    );
})

const loginUser = asyncHandler(async (req, res) => {
    const {username , email , password} = req.body;

    if(!username && !email){
        throw new ApiError(400,"Username or Email is Required");
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    });

    if(!user){
        throw new ApiError(404,"User doesn't Exist");
    }

    // console.log(user.isPasswordCorrect);

    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid){
        throw new ApiError(401,"Invalid user Password");
    }

    const {AccessToken, RefreshToken} = await generateAccessTokenAndRefreshToken(user._id);

    // console.log(AccessToken);
    // console.log(RefreshToken);

    console.log(user);

    const LoggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    console.log(LoggedInUser);

    const options = {
        httpOnly : true,
        secure : true
    }

    return res
    .status(200)
    .cookie("AccessToken",AccesToken,options)
    .cookie("RefreshToken",RefreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user: LoggedInUser,
                RefreshToken,
                AccessToken
            },
            "User LoggedIn SuccessFully",
        )
    )
});

const LogoutUser = asyncHandler(async (req,res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken : undefined
            }
        },
        {
            new : true
        }
    )

    const options = {
        httpOnly : true,
        secure : true
    }

    return res
    .status(200)
    .clearCookie("AccessToken",AccesToken)
    .clearCookie("RefreshToken",RefreshToken)
    .json(new ApiResponse(200,{},"User logged out"));
})

export {
    registerUser,
    loginUser,
    LogoutUser
}