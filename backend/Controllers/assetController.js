const Asset = require('../models/Asset');

// Add new asset
exports.addAsset = async (req, res) => {
  try {
    const { userId, type, description, value } = req.body;
    const asset = await Asset.create({ userId, type, description, value });
    res.status(201).json(asset);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
