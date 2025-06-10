import asyncHandler from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js';
import {ApiResponse} from '../utils/ApiResponse.js';
import {User} from '../model/user.model.js';
import {uploadImageToCloudinary} from '../utils/cloudinary.js';

const generateAccessTokenAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);

        // console.log(user);

        const AccessToken = await user.generateAccessToken();
        const RefreshToken = await user.generateRefreshToken();

        // console.log(AccessToken);
        // console.log(RefreshToken);

        user.refreshToken = RefreshToken;

        await user.save({validateBeforeSave : false});

        return {AccessToken, RefreshToken};

    } catch (error) {
        throw new ApiError(500,"Something Went Wrong While generating refresh and access token");
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const {username, fullName, email, password} = req.body;

    console.log(req.body);
    if (
        [username, fullName, email, password].some(field => !field.trim() === '')
    ) {
        return res.status(400).json(new ApiError(400, 'All fields are required'));
    }
    
    const existingUser = await User.findOne({ 
        $or: [{ username }, { email }] 
    }).select('-password');

    console.log(existingUser);

    if( existingUser ) {
        return res.status(400).json({ message: 'Username or email already exists' });
    }

    console.log(req.file);

    const avatarLocalPath = req.file?.path;

    console.log(avatarLocalPath);

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar Image is required");
    }

    console.log(avatarLocalPath);

    const avatar = await uploadImageToCloudinary(avatarLocalPath);

    if(!avatar){
        throw new ApiError(500, "Failed to upload avatar image");
    }


    const user = await User.create({
        username,
        email,
        fullName,
        password,
        avatar: avatar.url
    })

    const CreatedUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    console.log(CreatedUser);

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

    // console.log(req.body);

    if(!username && !email){
        throw new ApiError(400,"Username or Email is Required");
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    });

    // console.log(user);

    if(!user){
        throw new ApiError(404,"User doesn't Exist");
    }

    // console.log(user.isPasswordCorrect);

    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid){
        throw new ApiError(401,"Invalid user Password");
    }

    // console.log(user._id);
    const {AccessToken, RefreshToken} = await generateAccessTokenAndRefreshToken(user._id);

    console.log(AccessToken);
    // console.log(RefreshToken);

    // console.log(user);

    const LoggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    // console.log(LoggedInUser);

    const options = {
        httpOnly : true,
        secure : false
    }

    return res
    .status(200)
    .cookie("AccessToken", AccessToken, options)
    .cookie("RefreshToken", RefreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: LoggedInUser,
                RefreshToken,
                AccessToken
            },
            "User LoggedIn Successfully",
        )
    )
});

const LogoutUser = asyncHandler(async (req,res) => {
    // console.log(req.user);
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

    // console.log("User Logged Out");

    const options = {
        httpOnly : true,
        secure : false
    }

    return res
    .status(200)
    .clearCookie("AccessToken", AccessToken, options)
    .clearCookie("RefreshToken", RefreshToken, options)
    .json(new ApiResponse(200,{},"User logged out"));
})

export {
    registerUser,
    loginUser,
    LogoutUser
}