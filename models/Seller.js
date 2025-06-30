const mongoose = require('mongoose');
const sellerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, match: /.+\@.+\..+/ },
  phone: { type: String },
  registrationDate: { type: Date, required: true },
  tierId: { type: mongoose.Schema.Types.ObjectId, ref: 'SellerTier', required: true }
});
module.exports = mongoose.model('Seller', sellerSchema);
