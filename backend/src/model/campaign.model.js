import mongoose,{Schema} from "mongoose";

const campaignSchema = new Schema({
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  budget: {
    type: Number,
    required: true
  },
  requirements: {
    type: {
      minFollowers: {
        type: Number,
        required: true
      },
      minEngagementRate: {
        type: Number,
        required: true
      },
      preferredNiche: {
        type: String,
        required: true
      }
    },
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'completed', 'cancelled'],
    default: 'active'
  },
  applications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application'
  }]
}, {
  timestamps: true
});

const Campaign = mongoose.model('Campaign', campaignSchema);
module.exports = Campaign;