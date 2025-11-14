const express = require('express');
const router = express.Router();
const { addAsset, getUserAssets, updateAssetStatus } = require('../Controllers/assetController');

router.post('/', addAsset);
router.get('/:userId', getUserAssets);
router.patch('/:assetId', updateAssetStatus);

module.exports = router;
