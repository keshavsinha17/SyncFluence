import { Router } from "express";
import { protect, isBrand, isInfluencer } from "../middlewares/auth.middleware.js";
import {
    getMatchingInfluencers,
    getMatchingCampaigns
}  from "../controllers/matching.controller.js"

const router = Router();


router.get('/:brandId', protect, isBrand, getMatchingInfluencers);
router.get('/influencer/:influencerId', protect, isInfluencer, getMatchingCampaigns);

export default router;