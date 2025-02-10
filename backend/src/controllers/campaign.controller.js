import {asyncHandler} from "../utilities/AsyncHandler.js";
import {ApiError} from "../utilities/ApiError.js";
import {ApiResponse} from "../utilities/ApiResponse.js";
import {Campaign} from "../model/campaign.model.js";

const createCampaign = asyncHandler(async (req, res) => {
    const { brand, title, description, budget, requirements } = req.body;

    if (!brand || !title || !description || !budget || !requirements) {
        throw new ApiError(400, "All fields are required");
    }
    const campaign = await Campaign.create({
        brand,
        title,
        description,
        budget,
        requirements,
    });

    if (!campaign) {
        throw new ApiError(500, "Something went wrong while creating the campaign");
    }

    return res.status(201).json(
        new ApiResponse(200, campaign, "Campaign created successfully") 
    )

});

const getCampaignById = asyncHandler(async (req, res) => {
    const campaign = await Campaign.findById(req.params.id)
      .populate('brand', 'name industry')
      .populate('applications');
  
    if (campaign) {
      return res.status(200).json(new ApiResponse(200, campaign, "Campaign fetched successfully"));   
    } else {
      throw new ApiError(404, "Campaign not found");
    }
  });

const getCampaigns = asyncHandler(async (req, res) => {
    const campaigns = await Campaign.find({ status: 'active' })
      .populate('brand', 'name industry');
    if (!campaigns) {
      throw new ApiError(500, "Something went wrong while fetching the campaigns");
    }

    return res.status(200).json(new ApiResponse(200, campaigns, "Campaigns fetched successfully"));
  });

const deleteCampaign = asyncHandler(async (req, res) => {
    const campaign = await Campaign.findById(req.params.id);
    
    if (campaign) {
      if (campaign.brand.toString() !== req.user._id.toString()) {
        throw new ApiError(401, "You are not authorized to delete this campaign");
      }
  
      await campaign.remove();
      return res.status(200).json(new ApiResponse(200, campaign, "Campaign deleted successfully"));
    } else {
      res.status(404);
      throw new ApiError(404, "Campaign not found");
    }
  });

const updateCampaign = asyncHandler(async (req, res) => {
    const campaign = await Campaign.findById(req.params.id);
  
    if (campaign) {
      if (campaign.brand.toString() !== req.user._id.toString()) {
        throw new ApiError(401, "You are not authorized to update this campaign");
      }
  
      campaign.title = req.body.title || campaign.title;
      campaign.description = req.body.description || campaign.description;
      campaign.budget = req.body.budget || campaign.budget;
      campaign.requirements = req.body.requirements || campaign.requirements;
      campaign.status = req.body.status || campaign.status;
  
      const updatedCampaign = await campaign.save();
     return res.status(200).json(new ApiResponse(200, updatedCampaign, "Campaign updated successfully"));
    } else {
      throw new ApiError(404, "Campaign not found");
    }
  });
export {
    createCampaign,
    getCampaigns,
    getCampaignById,
    deleteCampaign,
    updateCampaign
}