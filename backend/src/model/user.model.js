import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema({
    fullname: {
        type: String,
        required: true,
        trim: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters']
    },
    bio: {
        type: String,
        default: ""
    },
    userType: {
        type: String,
        enum: ['influencer', 'brand'],
        required: true
    },
    // Influencer specific fields
    niche: {
        type: String,
        required: function() { return this.userType === 'influencer'; }
    },
    followers: {
        type: Number,
        required: function() { return this.userType === 'influencer'; }
    },
    engagementRate: {
        type: Number,
        required: function() { return this.userType === 'influencer'; }
    },
    pastCampaigns: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campaign'
    }],
    // Brand specific fields
    industry: {
        type: String,
        required: function() { return this.userType === 'brand'; }
    },
    budget: {
        type: Number,
        required: function() { return this.userType === 'brand'; }
    },
    campaignGoal: {
        type: String,
        required: function() { return this.userType === 'brand'; }
    },
    refreshToken: {
        type: String
    }
}, {
    timestamps: true
});

// Pre-save hook to hash password
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Method to check password
userSchema.methods.matchPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

// Method to generate access token
userSchema.methods.generateAccessToken = function() {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            userType: this.userType
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    );
};

// Method to generate refresh token
userSchema.methods.generateRefreshToken = function() {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    );
};

export const User = mongoose.model('User', userSchema);