const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  registerApplication,
  updateRound,
  getDashboardMetrics,
  getApplications,
} = require("../controllers/applicationController");

const router = express.Router();

// Route for getting all applications
router.get("/", protect, getApplications);

// Route for application registration
router.post("/register", protect, registerApplication);

// Route for advancing or updating rounds (state machine)
router.post("/update-round", protect, updateRound);

// Route for fetching dashboard placement statistics
router.get("/dashboard", protect, getDashboardMetrics);

module.exports = router;
