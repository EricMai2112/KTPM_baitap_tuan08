const mongoose = require('mongoose');

// Define Tour Schema
const tourSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  duration: {
    type: Number,
    required: true,
    min: 1
  },
  location: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 0,
    max: 5
  },
  reviews: {
    type: Number,
    required: true,
    min: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { collection: 'tour' });

tourSchema.set('versionKey', false);
tourSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  }
});

tourSchema.set('toObject', {
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  }
});

// Create and export Tour model
const Tour = mongoose.model('Tour', tourSchema);

module.exports = { Tour, tourSchema };
