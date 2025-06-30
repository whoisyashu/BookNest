const mongoose = require('mongoose');

const onboardingStatusSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: [true, 'Seller is required']
  },
  stepName: {
    type: String,
    required: [true, 'Step name is required'],
    enum: [
      'profile_completion',
      'document_upload',
      'payment_setup',
      'return_policy',
      'first_listing',
      'verification_complete'
    ]
  },
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: ['pending', 'complete', 'failed'],
    default: 'pending'
  },
  completedAt: {
    type: Date
  },
  notes: {
    type: String
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Compound index to ensure unique step per seller
onboardingStatusSchema.index({ sellerId: 1, stepName: 1 }, { unique: true });

// Indexes for faster queries
onboardingStatusSchema.index({ sellerId: 1 });
onboardingStatusSchema.index({ status: 1 });

module.exports = mongoose.model('OnboardingStatus', onboardingStatusSchema); 