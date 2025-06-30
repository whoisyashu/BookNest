const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  publisherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: [true, 'Publisher is required']
  },
  eventName: {
    type: String,
    required: [true, 'Event name is required']
  },
  eventType: {
    type: String,
    required: [true, 'Event type is required'],
    enum: ['livestream', 'special_edition', 'book_launch', 'author_meet', 'workshop']
  },
  eventDate: {
    type: Date,
    required: [true, 'Event date is required']
  },
  description: {
    type: String
  },
  location: {
    type: String
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  streamUrl: {
    type: String
  },
  maxAttendees: {
    type: Number
  },
  currentAttendees: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  registrationRequired: {
    type: Boolean,
    default: false
  },
  price: {
    type: Number,
    default: 0
  },
  tags: [String]
}, {
  timestamps: true
});

eventSchema.index({ publisherId: 1 });
eventSchema.index({ eventDate: 1 });
eventSchema.index({ eventType: 1 });
eventSchema.index({ isActive: 1 });

module.exports = mongoose.model('Event', eventSchema); 