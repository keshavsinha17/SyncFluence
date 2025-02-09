import { User } from "../model/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
import {asyncHandler} from "../utilities/AsyncHandler.js";
import {ApiError} from "../utilities/ApiError.js";
import {ApiResponse} from "../utilities/ApiResponse.js";
import {uploadOnCloudinary} from "../utilities/cloudinary.upload.js";
const registerUser = asyncHandler(async (req, res) => {
    const { username, email, fullname, password, userType, bio } = req.body;

    if (!username || !email || !fullname || !password || !userType) {
        throw new ApiError(400, "All fields are required");
    }

    // Check if avatar file exists
    if (!req.file) {
        throw new ApiError(400, "Avatar file is required");
    }

    // Validate userType
    if (!['brand', 'influencer'].includes(userType)) {
        throw new ApiError(400, "Invalid user type. Must be either 'brand' or 'influencer'");
    }

    const userExists = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (userExists) {
        throw new ApiError(409, "User with email or username already exists");
    }

    // Upload file to cloudinary
    const avatarLocalPath = req.file?.path;
    
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar) {
        throw new ApiError(400, "Avatar file upload failed");
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        email,
        password,
        username: username.toLowerCase(),
        userType,
        bio: bio || ""
    });

    const createdUser = await User.findById(user._id).select(
        "-password"
    );

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    );
});


export{
    registerUser
}
    