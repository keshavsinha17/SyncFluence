import { User } from "../models/user.model.js";
import { asyncHandler } from "../utilities/AsyncHandler.js";
import { ApiError } from "../utilities/ApiError.js";
import { ApiResponse } from "../utilities/ApiResponse.js";
import { validationResult } from 'express-validator';

// Register User
const registerUser = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new ApiError(400, "Validation Error", errors.array());
    }

    const {
        username,
        email,
        fullname,
        password,
        userType,
        bio,
        // Influencer fields
        niche,
        followers,
        engagementRate,
        // Brand fields
        industry,
        budget,
        campaignGoal
    } = req.body;

    // Check required fields
    if (!username || !email || !fullname || !password || !userType) {
        throw new ApiError(400, "All required fields must be provided");
    }

    // Validate userType
    if (!['brand', 'influencer'].includes(userType)) {
        throw new ApiError(400, "Invalid user type. Must be either 'brand' or 'influencer'");
    }

    // Check if user already exists
    const existingUser = await User.findOne({
        $or: [{ email }, { username }]
    });

    if (existingUser) {
        throw new ApiError(409, "User with email or username already exists");
    }

    // Create user object based on userType
    const userData = {
        fullname,
        email,
        password,
        username: username.toLowerCase(),
        userType,
        bio: bio || "",
        ...(userType === 'influencer' 
            ? { niche, followers, engagementRate }
            : { industry, budget, campaignGoal }
        )
    };

    const user = await User.create(userData);

    // Generate tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Update user with refresh token
    user.refreshToken = refreshToken;
    await user.save();

    // Remove sensitive fields
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    // Set cookies
    const options = {
        httpOnly: true,
        // secure: process.env.NODE_ENV === "production"
        secure:true
    };

    return res
        .status(201)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                201,
                {
                    user: createdUser,
                    accessToken,
                    refreshToken
                },
                "User registered successfully"
            )
        );
});

// Login User
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }

    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(401, "Invalid credentials");
    }

    const isPasswordValid = await user.matchPassword(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid credentials");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save();

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                },
                "User logged in successfully"
            )
        );
});

// Get User Profile
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select("-password -refreshToken");
    
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                user,
                "User profile fetched successfully"
            )
        );
});

export {
    registerUser,
    loginUser,
    getUserProfile
};
