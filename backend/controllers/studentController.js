const Student = require("../models/Student");

/**
 * @desc    Add a student record
 * @route   POST /api/students
 * @access  Protected
 */
const addStudent = async (req, res, next) => {
  try {
    const { rollNumber, name, email, branch, cgpa, resumeUrl } = req.body;

    // Validate required fields
    if (!rollNumber || !name || !email || !branch || cgpa === undefined) {
      res.status(400);
      throw new Error("Please fill in all required fields (rollNumber, name, email, branch, cgpa)");
    }

    // Check if student with roll number already exists
    const studentExists = await Student.findOne({ rollNumber });
    if (studentExists) {
      res.status(400);
      throw new Error("Student with this roll number already exists");
    }

    // Create student record
    const student = await Student.create({
      rollNumber,
      name,
      email,
      branch,
      cgpa,
      resumeUrl,
    });

    res.status(201).json(student);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all students (with optional regex search on name or rollNumber)
 * @route   GET /api/students
 * @access  Protected
 */
const getStudents = async (req, res, next) => {
  try {
    const search = req.query.search;
    let query = {};

    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { rollNumber: { $regex: search, $options: "i" } },
        ],
      };
    }

    const students = await Student.find(query);
    res.json(students);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a student profile
 * @route   PUT /api/students/:id
 * @access  Protected
 */
const updateStudent = async (req, res, next) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!student) {
      res.status(404);
      throw new Error("Student not found");
    }

    res.json(student);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a student record
 * @route   DELETE /api/students/:id
 * @access  Protected
 */
const deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      res.status(404);
      throw new Error("Student not found");
    }

    res.json({ message: "Student record removed successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addStudent,
  getStudents,
  updateStudent,
  deleteStudent,
};
