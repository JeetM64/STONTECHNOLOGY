const Company = require("../models/Company");

/**
 * @desc    Create a new company with recruitment workflow rounds
 * @route   POST /api/companies
 * @access  Protected
 */
const createCompany = async (req, res, next) => {
  try {
    const { name, rounds } = req.body;

    // Validate inputs
    if (!name || !rounds || !Array.isArray(rounds) || rounds.length === 0) {
      res.status(400);
      throw new Error("Please provide a company name and a non-empty array of recruitment rounds");
    }

    // Check if company with name already exists
    const companyExists = await Company.findOne({ name });
    if (companyExists) {
      res.status(400);
      throw new Error("Company with this name already exists");
    }

    // Create the company
    const company = await Company.create({
      name,
      rounds,
    });

    res.status(201).json(company);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all companies
 * @route   GET /api/companies
 * @access  Protected
 */
const getCompanies = async (req, res, next) => {
  try {
    const companies = await Company.find({});
    res.json(companies);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCompany,
  getCompanies,
};
