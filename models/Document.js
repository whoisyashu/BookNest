const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: [true, 'Seller is required']
  },
  type: {
    type: String,
    required: [true, 'Document type is required'],
    enum: [
      'identity_proof',
      'address_proof',
      'business_license',
      'tax_document',
      'bank_statement',
      'other'
    ]
  },
  path: {
    type: String,
    required: [true, 'Document path is required']
  },
  verified: {
    type: Boolean,
    required: [true, 'Verification status is required'],
    default: false
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  verifiedAt: {
    type: Date
  },
  originalName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  notes: {
    type: String
  },
  rejectionReason: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for faster queries
documentSchema.index({ sellerId: 1 });
documentSchema.index({ type: 1 });
documentSchema.index({ verified: 1 });
documentSchema.index({ verifiedBy: 1 });

module.exports = mongoose.model('Document', documentSchema); 