import { asyncHandler } from '../utilities/AsyncHandler';
import { Application } from '../model/application.model';
import {Campaign} from '../model/campaign.model.js';
import { ApiError } from '../utilities/ApiError';
import { ApiResponse } from '../utilities/ApiResponse';
// @desc    Create application
// @route   POST /api/applications
// @access  Private/Influencer
const createApplication = asyncHandler(async (req, res) => {
  const { campaignId, proposal } = req.body;

  const campaign = await Campaign.findById(campaignId);
  if (!campaign) {
    throw new ApiError(404, 'Campaign not found');
  }

  const existingApplication = await Application.findOne({
    campaign: campaignId,
    influencer: req.user._id
  });

  if (existingApplication) {
    throw new ApiError(400, 'You have already applied for this campaign');
  }

  const application = await Application.create({
    campaign: campaignId,
    influencer: req.user._id,
    proposal
  });

  campaign.applications.push(application._id);
  await campaign.save();

  return res.status(201).json(new ApiResponse(200, application, "Application created successfully"));
});

// @desc    Update application status
// @route   PUT /api/applications/:id
// @access  Private/Brand
const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const application = await Application.findById(req.params.id)
    .populate('campaign');

  if (!application) {
    throw new ApiError(404, 'Application not found');   
  }

  if (application.campaign.brand.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not authorized to update this application');
  }

  application.status = status;
  const updatedApplication = await application.save();

 return res.status(200).json(new ApiResponse(200, updatedApplication, "Application status updated successfully"));
});

// @desc    Get applications for a campaign
// @route   GET /api/applications/campaign/:campaignId
// @access  Private/Brand
const getCampaignApplications = asyncHandler(async (req, res) => {
  const campaign = await Campaign.findById(req.params.campaignId);
  
  if (!campaign) {
    throw new ApiError(404, 'Campaign not found');
  }

  if (campaign.brand.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not authorized to get applications for this campaign');
  }

  const applications = await Application.find({ campaign: req.params.campaignId })
    .populate('influencer', 'name email niche followers engagementRate');

  return res.status(200).json(new ApiResponse(200, applications, "Applications fetched successfully"));
});

module.exports = {
  createApplication,
  updateApplicationStatus,
  getCampaignApplications
};