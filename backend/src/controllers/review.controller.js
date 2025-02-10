import { Review } from "../model/review.model";
import {Campaign} from "../model/campaign.model.js";
import { asyncHandler } from "../utilities/AsyncHandler.js";
import { ApiError } from "../utilities/ApiError.js";
import { ApiResponse } from "../utilities/ApiResponse";

const createReview = asyncHandler(async (req, res) => {
    const { revieweeId, campaignId, rating, comment } = req.body;
  
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      throw new ApiError(404, 'Campaign not found');
    }
  
    const existingReview = await Review.findOne({
      reviewer: req.user._id,
      reviewee: revieweeId,
      campaign: campaignId
    });
  
    if (existingReview) {
      throw new ApiError(400, 'You have already reviewed this campaign');
    }
  
    const review = await Review.create({
      reviewer: req.user._id,
      reviewee: revieweeId,
      campaign: campaignId,
      rating,
      comment
    });
  
    return res.status(201).json(new ApiResponse(200, review, "Review created successfully"));   
  });
  
  // @desc    Get reviews for a user
  // @route   GET /api/reviews/user/:userId
  // @access  Private
  const getUserReviews = asyncHandler(async (req, res) => {
    const reviews = await Review.find({ reviewee: req.params.userId })
      .populate('reviewer', 'name userType')
      .populate('campaign', 'title');
  if(!reviews) {
      throw new ApiError(404, 'Reviews not found');
  }
    return res.status(200).json(new ApiResponse(200, reviews, "Reviews fetched successfully"));
  });
  
  module.exports = {
    createReview,
    getUserReviews
  };