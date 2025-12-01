const Asset = require('../models/Asset');

// Add new asset
exports.addAsset = async (req, res) => {
  try {
    const { type, name, description, estimatedValue, currency, photoUrl, photo, value, location } = req.body;
    // allow authenticated users: prefer req.user.id when available
    const userId = req.user?.id || req.body.userId;
    const userRole = req.user?.role;
    // Basic required fields
    if (!userId) return res.status(400).json({ message: 'userId is required' });
    // Prevent admin from adding assets
    if (userRole === 'admin') return res.status(403).json({ message: 'Admin users cannot create assets' });
    if (!type) return res.status(400).json({ message: 'type is required' });
    if (!name) return res.status(400).json({ message: 'name is required' });
    // the frontend uses `value` (Estimated Value input). accept `value` primarily.
    if (value === undefined || value === null) return res.status(400).json({ message: 'value (estimated value) is required' });

    // validate location against Pakistan cities list
    const path = require('path');
    const PAK_CITIES = require(path.join(__dirname, '../data/pakistan_cities.json'));
    if (location && !PAK_CITIES.includes(location)) {
      return res.status(400).json({ message: 'Invalid location; must be a Pakistani city' });
    }

    // normalize numeric fields: primary numeric is `value`
    const parsedValue = Number(value);
    if (Number.isNaN(parsedValue)) return res.status(400).json({ message: 'value must be a number' });

    const parsedEstimated = estimatedValue !== undefined && estimatedValue !== null ? Number(estimatedValue) : parsedValue;

    const assetPayload = {
      userId,
      type,
      name,
      description,
      value: parsedValue,
      estimatedValue: parsedEstimated,
      currency: currency || 'PKR',
      // accept either `photo` (data URL from frontend) or `photoUrl` (hosted URL)
      photo: photo || undefined,
      photoUrl: photoUrl || undefined,
      location
    };

    const asset = await Asset.create(assetPayload);
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

// Get all assets (admin only)
exports.getAllAssets = async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const assets = await Asset.find().sort({ createdAt: -1 }).populate({ path: 'userId', select: 'name email' });
    res.json(assets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get assets for authenticated user
exports.getMyAssets = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Not authenticated' });
    const assets = await Asset.find({ userId }).sort({ createdAt: -1 });
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

    // if authenticated, ensure the user owns the asset
    if (req.user && String(req.user.id) !== String(asset.userId)) {
      return res.status(403).json({ message: 'Forbidden: not the asset owner' });
    }

    // allow updating status/compensationClaimed OR full editable fields
    const updatable = ['status', 'compensationClaimed', 'name', 'description', 'estimatedValue', 'currency', 'photoUrl', 'photo', 'value', 'location', 'type'];
    updatable.forEach((key) => {
      if (req.body[key] !== undefined) asset[key] = req.body[key];
    });

    await asset.save();
    res.json(asset);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete asset (owner only)
exports.deleteAsset = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.assetId);
    if (!asset) return res.status(404).json({ message: 'Asset not found' });
    if (req.user && String(req.user.id) !== String(asset.userId)) {
      return res.status(403).json({ message: 'Forbidden: not the asset owner' });
    }
    await asset.deleteOne();
    res.json({ message: 'Asset deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
