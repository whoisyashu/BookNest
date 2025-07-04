const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const buyerSchema = new mongoose.Schema({
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
  address: { type: Object }
});

// Hash password before saving
buyerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
buyerSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Buyer', buyerSchema);