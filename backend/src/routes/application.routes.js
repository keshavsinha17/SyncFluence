import { Router } from "express";
import {protect,isBrand,isInfluencer} from '../middlewares/auth.middleware.js'
import {
    createApplication,
    updateApplicationStatus,
    getCampaignApplications
}  from "../controllers/application.controller.js"

const router = Router();
router.post('/', protect, isInfluencer, createApplication);
router.put('/:id', protect, isBrand, updateApplicationStatus);
router.get('/campaign/:campaignId', protect, isBrand, getCampaignApplications);
export default router;