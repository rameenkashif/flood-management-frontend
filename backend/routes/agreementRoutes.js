const express = require('express');
const router = express.Router();
const { signAgreement, getUserAgreements } = require('../Controllers/agreementController');
const protect = require('../middleware/authMiddleware');

router.post('/', protect, signAgreement);
router.get('/:userId', getUserAgreements);

module.exports = router;
