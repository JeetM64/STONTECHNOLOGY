const express = require("express");
const { registerUser, loginUser } = require("../controllers/authController");

const router = express.Router();

// @route   POST /api/auth/register
// @access  Public
router.post("/register", registerUser);

// @route   POST /api/auth/login
// @access  Public
router.post("/login", loginUser);

module.exports = router;
