const mongoose = require('mongoose');

const premiumContentSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: [true, 'Seller is required']
  },
  title: {
    type: String,
    required: [true, 'Title is required']
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  mediaUrl: {
    type: String
  },
  contentType: {
    type: String,
    enum: ['ebook', 'audiobook', 'video', 'document', 'course'],
    required: [true, 'Content type is required']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [String],
  duration: {
    type: Number // in minutes for audio/video
  },
  fileSize: {
    type: Number // in bytes
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

premiumContentSchema.index({ sellerId: 1 });
premiumContentSchema.index({ contentType: 1 });
premiumContentSchema.index({ isActive: 1 });
premiumContentSchema.index({ price: 1 });

module.exports = mongoose.model('PremiumContent', premiumContentSchema); 