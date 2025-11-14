const express = require('express');
const router = express.Router();
const { signAgreement, getUserAgreements } = require('../Controllers/agreementController');

router.post('/', signAgreement);
router.get('/:userId', getUserAgreements);

module.exports = router;
