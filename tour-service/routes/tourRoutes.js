const express = require('express');
const router = express.Router();
const { Tour } = require('../models/Tour');

// GET /tours - Get all tours
router.get('/tours', async (req, res) => {
  try {
    console.log('[Tour Service] GET /tours - Fetching from MongoDB');
    
    const tours = await Tour.find({}).sort({ id: 1 });

    console.log(`[Tour Service] Found ${tours.length} tours`);
    return res.status(200).json(tours);
  } catch (error) {
    console.error('[Tour Service] Error getting tours:', error);
    res.status(500).json({
      message: 'Error retrieving tours',
      error: error.message
    });
  }
});

// GET /tours/:id - Get tour by ID
router.get('/tours/:id', async (req, res) => {
  try {
    const tourId = parseInt(req.params.id);
    console.log(`[Tour Service] GET /tours/${tourId}`);

    const tour = await Tour.findOne({ id: tourId });

    if (!tour) {
      console.warn(`[Tour Service] Tour not found: ID ${tourId}`);
      return res.status(404).json(null);
    }

    console.log(`[Tour Service] Tour found: ${tour.name}`);
    return res.status(200).json(tour);
  } catch (error) {
    console.error(`[Tour Service] Error getting tour:`, error);
    res.status(500).json({
      message: 'Error retrieving tour',
      error: error.message
    });
  }
});

module.exports = router;
