const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const { addAsset, getUserAssets, updateAssetStatus, getMyAssets } = require('../Controllers/assetController');

// get all assets (admin)
router.get('/', protect, require('../Controllers/assetController').getAllAssets);

// create asset (authenticated)
router.post('/', protect, addAsset);

// get assets for authenticated user
router.get('/me', protect, getMyAssets);

// get assets by arbitrary userId (public)
router.get('/user/:userId', getUserAssets);


// update asset (authenticated - owner)
router.patch('/:assetId', protect, updateAssetStatus);

// delete asset (authenticated - owner)
router.delete('/:assetId', protect, require('../Controllers/assetController').deleteAsset);

module.exports = router;
