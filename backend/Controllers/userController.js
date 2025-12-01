const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Register user
exports.registerUser = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    // Basic validation: require Gmail and Pakistani mobile number format
    if (!email || !email.toLowerCase().endsWith('@gmail.com')) {
      return res.status(400).json({ message: 'Please register with a valid Gmail address' });
    }
    const phoneRegex = /^03\d{9}$/; // e.g. 03001234567
    if (!phone || !phoneRegex.test(phone)) {
      return res.status(400).json({ message: 'Please provide a valid Pakistani mobile number (e.g. 03001234567)' });
    }
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const user = await User.create({ name, email, phone, password });
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login user
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`🔐 Login attempt: email=${email}, isAdmin=${email === 'admin@gmail.com'}`);
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`❌ User not found: ${email}`);
      return res.status(401).json({ message: "Invalid email or password" });
    }
    
    console.log(`✓ User found: ${email}, role=${user.role}`);
    
    // Restrict admin login to admin@gmail.com:password123 only
    if (user.role === 'admin') {
      console.log(`🔒 Admin login attempt: email match=${email === 'admin@gmail.com'}, password match=${password === 'password123'}`);
      if (email !== 'admin@gmail.com' || password !== 'password123') {
        console.log(`❌ Admin credentials invalid`);
        return res.status(401).json({ message: "Invalid credentials for admin account" });
      }
      // Admin login successful with hardcoded credentials
      console.log(`✅ Admin login successful`);
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      // Regular user: validate password with bcrypt
      const passwordMatch = await user.matchPassword(password);
      console.log(`Regular user password match: ${passwordMatch}`);
      if (passwordMatch) {
        console.log(`✅ User login successful: ${email}`);
        res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user._id)
        });
      } else {
        console.log(`❌ User password invalid: ${email}`);
        res.status(401).json({ message: "Invalid email or password" });
      }
    }
  } catch (error) {
    console.error(`❌ Login error: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};
