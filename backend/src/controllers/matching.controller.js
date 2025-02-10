import { asyncHandler } from '../utilities/AsyncHandler.js';
import { ApiError } from '../utilities/ApiError.js';
import { ApiResponse } from '../utilities/ApiResponse.js';
import { User } from '../model/user.model.js';
import { Campaign } from '../model/campaign.model.js';

const getMatchingInfluencers = asyncHandler(async (req, res) => {
    const brand = await User.findById(req.params.brandId);
    if (!brand || brand.userType !== 'brand') {
      throw new ApiError(404, 'Brand not found');
    }
  
    const matchingInfluencers = await User.find({
      userType: 'influencer',
      niche: brand.industry,
      followers: { $gte: 1000 }, // Minimum follower requirement
      engagementRate: { $gte: 1 } // Minimum engagement rate requirement
    }).select('-password');
  
    return res.status(200).json(new ApiResponse(200, matchingInfluencers, "Matching influencers fetched successfully"));
  });
  
  // @desc    Get matching campaigns for an influencer
  // @route   GET /api/match/influencer/:influencerId
  // @access  Private/Influencer
  const getMatchingCampaigns = asyncHandler(async (req, res) => {
    const influencer = await User.findById(req.params.influencerId);
    if (!influencer || influencer.userType !== 'influencer') {
      throw new ApiError(404, 'Influencer not found');
    }
  
    const matchingCampaigns = await Campaign.find({
      status: 'active',
      'requirements.minFollowers': { $lte: influencer.followers },
      'requirements.minEngagementRate': { $lte: influencer.engagementRate },
      'requirements.preferredNiche': influencer.niche
    }).populate('brand', 'name industry');
    if(!matchingCampaigns) {
        throw new ApiError(500, "Something went wrong while fetching the matching campaigns");
    }
    return res.status(200).json(new ApiResponse(200, matchingCampaigns, "Matching campaigns fetched successfully"));
  });
 export {
    getMatchingInfluencers,
    getMatchingCampaigns
 }