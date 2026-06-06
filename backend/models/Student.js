const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    rollNumber: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    branch: { type: String, required: true },
    cgpa: { type: Number, required: true },
    resumeUrl: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);
