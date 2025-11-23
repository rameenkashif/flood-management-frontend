const express = require('express');
const router = express.Router();
const reliefController = require('../Controllers/reliefCampController');

// GET /api/relief-camps
router.get('/', reliefController.getAllCamps);

// POST /api/relief-camps
router.post('/', reliefController.addCamp);

module.exports = router;
