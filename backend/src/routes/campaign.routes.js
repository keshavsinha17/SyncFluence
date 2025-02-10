import { Router } from "express";
import { createCampaign, getCampaigns, getCampaignById, deleteCampaign, updateCampaign } from "../controllers/campaign.controller.js";
import { protect, isBrand } from "../middlewares/auth.middleware.js";
const router = Router();

router.route('/')
  .post(protect, isBrand, createCampaign)
  .get(protect, getCampaigns);

router.route('/:id')
  .get(protect, getCampaignById)
  .put(protect, isBrand, updateCampaign)
  .delete(protect, isBrand, deleteCampaign);

export default router;