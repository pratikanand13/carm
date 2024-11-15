const mongoose = require("mongoose");
const CarSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  images: [{ type: String, required: true, maxlength: 10 }],
  tags: {
      carType: String,
      company: String,
      dealer: String,
  },
}, { timestamps: true });
module.exports = mongoose.model('Car', CarSchema);
