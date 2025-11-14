const Agreement = require('../models/Agreement');

// Sign agreement
exports.signAgreement = async (req, res) => {
  try {
    const { assetId, agreementText } = req.body;
    const agreement = await Agreement.create({ assetId, agreementText });
    res.status(201).json(agreement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user agreements
exports.getUserAgreements = async (req, res) => {
  try {
    const agreements = await Agreement.find()
      .populate({ path: 'assetId', match: { userId: req.params.userId } });
    res.json(agreements.filter(a => a.assetId));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
