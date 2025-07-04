const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const sellerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, match: /.+\@.+\..+/ },
  phone: { type: String },
  password: { type: String, required: true },
  isActive: {
    type: Boolean,
    default: true
  },
  registrationDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  tierId: { type: mongoose.Schema.Types.ObjectId, ref: 'SellerTier', required: true }
});

// Hash password before saving
sellerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
sellerSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Seller', sellerSchema);
