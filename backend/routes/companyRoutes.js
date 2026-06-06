const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { createCompany, getCompanies } = require("../controllers/companyController");

const router = express.Router();

// Routes for creating and listing companies
router.route("/")
  .post(protect, createCompany)
  .get(protect, getCompanies);

module.exports = router;
