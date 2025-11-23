const Asset = require('../models/Asset');

// Add new asset
exports.addAsset = async (req, res) => {
  try {
<<<<<<< HEAD
    // Destructure only fields present in frontend and schema
    const { userId, type, name, description, value, location, photo } = req.body;
    const asset = await Asset.create({
      userId,
      type,
      name,
      description,
      value,
      location,
      photo
    });
=======
    const { userId, type, description, value, location } = req.body;
    // validate location against Pakistan cities list
    const path = require('path');
    const PAK_CITIES = require(path.join(__dirname, '../data/pakistan_cities.json'));
    if (location && !PAK_CITIES.includes(location)) {
      return res.status(400).json({ message: 'Invalid location; must be a Pakistani city' });
    }

    const asset = await Asset.create({ userId, type, description, value, location });
>>>>>>> 05e78a24e2cac081fd83e44857535dc95066cc9b
    res.status(201).json(asset);
  } catch (error) {
    console.error('Error in addAsset:', error);
    res.status(500).json({ message: error.message, stack: error.stack });
  }
};

// Get assets by user
exports.getUserAssets = async (req, res) => {
  try {
    const assets = await Asset.find({ userId: req.params.userId });
    res.json(assets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update asset status
exports.updateAssetStatus = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.assetId);
    if (!asset) return res.status(404).json({ message: "Asset not found" });

    asset.status = req.body.status || asset.status;
    asset.compensationClaimed = req.body.compensationClaimed ?? asset.compensationClaimed;
    await asset.save();
    res.json(asset);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
