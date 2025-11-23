const express = require('express');
const router = express.Router();
const path = require('path');

const cities = require(path.join(__dirname, '../data/pakistan_cities.json'));

// GET /api/locations/cities
router.get('/cities', (req, res) => {
  res.json(cities);
});

module.exports = router;
