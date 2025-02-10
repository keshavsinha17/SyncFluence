import mongoose, { Schema } from "mongoose";

const applicationSchema = new Schema({
  campaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true
  },
  influencer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  proposal: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

export const Application = mongoose.model('Application', applicationSchema);
