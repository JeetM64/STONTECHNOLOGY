const mongoose = require("mongoose");
const Application = require("../models/Application");
const Student = require("../models/Student");
const Company = require("../models/Company");

/**
 * @desc    Enroll a student into a company's recruitment drive
 * @route   POST /api/applications/register
 * @access  Protected
 */
const registerApplication = async (req, res, next) => {
  try {
    const studentId = req.body.student || req.body.studentId;
    const companyId = req.body.company || req.body.companyId;

    // Validate request inputs
    if (!studentId || !companyId) {
      res.status(400);
      throw new Error("Please provide student and company IDs");
    }

    if (!mongoose.Types.ObjectId.isValid(studentId) || !mongoose.Types.ObjectId.isValid(companyId)) {
      res.status(400);
      throw new Error("Invalid student or company ID format");
    }

    // Verify student exists
    const student = await Student.findById(studentId);
    if (!student) {
      res.status(404);
      throw new Error("Student not found");
    }

    // Verify company exists
    const company = await Company.findById(companyId);
    if (!company) {
      res.status(404);
      throw new Error("Company not found");
    }

    // Check if the student is already registered for this company
    const alreadyRegistered = await Application.findOne({
      student: studentId,
      company: companyId,
    });
    if (alreadyRegistered) {
      res.status(400);
      throw new Error("Student is already registered for this company's drive");
    }

    // Ensure company has rounds defined
    if (!company.rounds || company.rounds.length === 0) {
      res.status(400);
      throw new Error("The company does not have any recruitment rounds configured");
    }

    // Register application with currentRoundIndex = 0, status = 'Pending', and initial round in history
    const application = await Application.create({
      student: studentId,
      company: companyId,
      currentRoundIndex: 0,
      status: "Pending",
      history: [
        {
          roundName: company.rounds[0],
          attendanceStatus: "Pending",
          roundStatus: "Pending",
        },
      ],
    });

    const populatedApp = await Application.findById(application._id)
      .populate("student")
      .populate("company");

    res.status(201).json(populatedApp);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update status of a specific round in student recruitment workflow
 * @route   POST /api/applications/update-round
 * @access  Protected
 */
const updateRound = async (req, res, next) => {
  try {
    const { applicationId, attendanceStatus, roundStatus, marks, remarks } = req.body;

    // Validation
    if (!applicationId || !attendanceStatus || !roundStatus) {
      res.status(400);
      throw new Error("Please provide applicationId, attendanceStatus, and roundStatus");
    }

    if (!["Present", "Absent"].includes(attendanceStatus)) {
      res.status(400);
      throw new Error("attendanceStatus must be 'Present' or 'Absent'");
    }

    if (!["Passed", "Failed"].includes(roundStatus)) {
      res.status(400);
      throw new Error("roundStatus must be 'Passed' or 'Failed'");
    }

    // Retrieve the application and populate company details
    const application = await Application.findById(applicationId).populate("company");
    if (!application) {
      res.status(404);
      throw new Error("Application not found");
    }

    // Verify application is not already in terminal status
    if (application.status === "Offered" || application.status === "Failed") {
      res.status(400);
      throw new Error(`Application is already in a terminal state: ${application.status}`);
    }

    const currentRoundIndex = application.currentRoundIndex;
    const companyRounds = application.company.rounds;

    if (currentRoundIndex >= companyRounds.length) {
      res.status(400);
      throw new Error("Current round index exceeds the available rounds for the company workflow");
    }

    // Get the current round subdocument from history
    let currentRound = application.history[currentRoundIndex];
    if (!currentRound) {
      currentRound = {
        roundName: companyRounds[currentRoundIndex],
        attendanceStatus: "Pending",
        roundStatus: "Pending",
      };
      application.history[currentRoundIndex] = currentRound;
    }

    // Update round subdocument details
    currentRound.attendanceStatus = attendanceStatus;
    currentRound.roundStatus = roundStatus;
    if (marks !== undefined) currentRound.marks = marks;
    if (remarks !== undefined) currentRound.remarks = remarks;

    // Rule A: If attendanceStatus is 'Absent' or roundStatus is 'Failed'
    if (attendanceStatus === "Absent" || roundStatus === "Failed") {
      // Force round status to Failed if absent
      if (attendanceStatus === "Absent") {
        currentRound.roundStatus = "Failed";
      }
      application.status = "Failed";
    }
    // Rule B: If roundStatus is 'Passed'
    else if (roundStatus === "Passed") {
      const isFinalRound = currentRoundIndex === companyRounds.length - 1;
      if (isFinalRound) {
        application.status = "Offered";
      } else {
        // Advance to next round index and push next round as Pending
        application.currentRoundIndex += 1;
        const nextRoundName = companyRounds[application.currentRoundIndex];
        application.history.push({
          roundName: nextRoundName,
          attendanceStatus: "Pending",
          roundStatus: "Pending",
        });
      }
    }

    application.markModified("history");
    await application.save();

    // Fetch the updated application with populated models
    const updatedApp = await Application.findById(application._id)
      .populate("student")
      .populate("company");

    res.json(updatedApp);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get dashboard placement stats and company-wise placement metrics
 * @route   GET /api/applications/dashboard
 * @access  Protected
 */
const getDashboardMetrics = async (req, res, next) => {
  try {
    const stats = await Application.aggregate([
      {
        $facet: {
          statusCounts: [
            {
              $group: {
                _id: "$status",
                count: { $sum: 1 },
              },
            },
          ],
          companyPlacements: [
            {
              $match: { status: "Offered" },
            },
            {
              $group: {
                _id: "$company",
                placementCount: { $sum: 1 },
              },
            },
            {
              $lookup: {
                from: "companies",
                localField: "_id",
                foreignField: "_id",
                as: "companyInfo",
              },
            },
            {
              $unwind: "$companyInfo",
            },
            {
              $project: {
                _id: 0,
                companyId: "$_id",
                companyName: "$companyInfo.name",
                placementCount: 1,
              },
            },
          ],
        },
      },
    ]);

    const statusCounts = stats[0]?.statusCounts || [];
    const companyPlacements = stats[0]?.companyPlacements || [];

    const metrics = {
      totalPlaced: 0,
      totalPending: 0,
      totalRejected: 0,
      companyPlacements: companyPlacements,
    };

    statusCounts.forEach((item) => {
      if (item._id === "Offered") metrics.totalPlaced = item.count;
      if (item._id === "Pending") metrics.totalPending = item.count;
      if (item._id === "Failed") metrics.totalRejected = item.count;
    });

    res.json(metrics);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all placement applications
 * @route   GET /api/applications
 * @access  Protected
 */
const getApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({})
      .populate("student")
      .populate("company")
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerApplication,
  updateRound,
  getDashboardMetrics,
  getApplications,
};
