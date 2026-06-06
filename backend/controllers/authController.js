const jwt = require("jsonwebtoken");
const User = require("../models/User");

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    // Create new user
    const user = await User.create({ name, email, password });

    if (user) {
      // Generate JWT token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
      });

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Hardcoded fallback credentials for testing and direct initialization
    if (email === "admin@placement.com" && password === "password123") {
      const token = jwt.sign({ id: "admin_mock_id" }, process.env.JWT_SECRET || "supersecretplacementkey123", {
        expiresIn: "30d",
      });
      return res.json({
        _id: "admin_mock_id",
        name: "Placement Officer",
        email: "admin@placement.com",
        token,
      });
    }

    // Check for user email
    const user = await User.findOne({ email });

    // Check password
    if (user && (await user.matchPassword(password))) {
      // Generate JWT token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "supersecretplacementkey123", {
        expiresIn: "30d",
      });

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token,
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { registerUser, loginUser };
