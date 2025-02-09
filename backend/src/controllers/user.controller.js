import { User } from "../model/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
import {asyncHandler} from "../utilities/AsyncHandler.js";
import {ApiError} from "../utilities/ApiError.js";
import {ApiResponse} from "../utilities/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
    const { username, email, fullname, password, userType } = req.body;

    if (!username || !email || !fullname || !password || !userType) {
        throw new ApiError(400, "All fields are required");
    }

    // Validate userType
    if (!['brand', 'influencer'].includes(userType)) {
        throw new ApiError(400, "Invalid user type. Must be either 'brand' or 'influencer'");
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (existedUser) {
        throw new ApiError(400, "User already exists");
    }
    if(!req.file||!req.file.avatar){
        throw new ApiError(400, "Avatar is required");
    }
    const avatarLocalPath = req.files?.avatar[0]?.path;
    let avatar;
    try {
        avatar = await uploadFileOnCloudinary(avatarLocalPath);
        console.log("Cloudinary avatar response:", avatar);
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        throw new ApiError(400, "Error uploading avatar to cloudinary");
    }
    if (!avatar) {
        throw new ApiError(400, "Error while uploading avatar")
    }
    const user = await User.create({
        fullname: fullname,
        avatar: avatar.url,
        userType: userType,
        bio:bio||null,
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

})


export{
    registerUser
}
    