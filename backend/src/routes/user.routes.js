import { Router } from "express";
import { registerUser,loginUser,getUserProfile } from "../controllers/user.controller.js";
import {protect} from "../middlewares/auth.middleware.js";

const router = Router();

// Validation middleware
const registerValidation = [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
    check('fullname', 'Full name is required').notEmpty(),
    check('username', 'Username is required').notEmpty(),
    check('userType', 'User type must be either influencer or brand').isIn(['influencer', 'brand']),
    // Conditional validation for influencer
    check('niche')
        .if(check('userType').equals('influencer'))
        .notEmpty()
        .withMessage('Niche is required for influencers'),
    check('followers')
        .if(check('userType').equals('influencer'))
        .isNumeric()
        .withMessage('Followers must be a number'),
    check('engagementRate')
        .if(check('userType').equals('influencer'))
        .isNumeric()
        .withMessage('Engagement rate must be a number'),
    // Conditional validation for brand
    check('industry')
        .if(check('userType').equals('brand'))
        .notEmpty()
        .withMessage('Industry is required for brands'),
    check('budget')
        .if(check('userType').equals('brand'))
        .isNumeric()
        .withMessage('Budget must be a number'),
    check('campaignGoal')
        .if(check('userType').equals('brand'))
        .notEmpty()
        .withMessage('Campaign goal is required for brands')
];

const loginValidation = [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').notEmpty()
];

// Routes
router.post('/register', registerValidation, registerUser);
router.post('/login', loginValidation, loginUser);
router.get('/profile', protect, getUserProfile);

export default router;