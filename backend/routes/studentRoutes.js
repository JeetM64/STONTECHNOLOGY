const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  addStudent,
  getStudents,
  updateStudent,
  deleteStudent,
} = require("../controllers/studentController");

const router = express.Router();

// Routes for adding and getting student records
router.route("/")
  .post(protect, addStudent)
  .get(protect, getStudents);

// Routes for modifying and deleting specific student profiles
router.route("/:id")
  .put(protect, updateStudent)
  .delete(protect, deleteStudent);

module.exports = router;
