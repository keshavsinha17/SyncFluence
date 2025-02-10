import { Router } from "express";
import {protect} from "../middlewares/auth.middleware.js";
import {
    createReview,
    getReviews
} from "../controllers/review.controller.js";

const router = Router();

router.post('/', protect, createReview);
router.get('/user/:userId', protect, getUserReviews);

export default router;