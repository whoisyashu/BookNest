const mongoose = require('mongoose');
const buyerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, match: /.+\@.+\..+/ },
  phone: { type: String },
  registrationDate: { type: Date, required: true },
  address: { type: Object }
});
module.exports = mongoose.model('Buyer', buyerSchema);