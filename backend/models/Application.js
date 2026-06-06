const mongoose = require("mongoose");

const historySchema = new mongoose.Schema({
  roundName: { type: String, required: true },
  attendanceStatus: {
    type: String,
    enum: ["Present", "Absent", "Pending"],
    default: "Pending",
  },
  roundStatus: {
    type: String,
    enum: ["Passed", "Failed", "Pending"],
    default: "Pending",
  },
  marks: { type: Number },
  remarks: { type: String },
});

const applicationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    currentRoundIndex: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Pending", "Passed", "Failed", "Offered"],
      default: "Pending",
    },
    history: { type: [historySchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Application", applicationSchema);
