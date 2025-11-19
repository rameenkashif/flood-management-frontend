const express = require('express');
const router = express.Router();
const floodController = require('../Controllers/floodController_fixed');

// GET /api/floods
router.get('/', floodController.listAlerts);

// POST /api/floods - create a new alert
router.post('/', floodController.createAlertHandler);

// POST /api/floods/refresh - force fetch external alerts
router.post('/refresh', floodController.refreshAlertsHandler);

// DELETE /api/floods - clear all alerts
router.delete('/', floodController.clearAlertsHandler);

module.exports = router;
