import React, { useState, useEffect } from "react";
import api from "../services/api";
import { useToast } from "../context/ToastContext";

/**
 * Drive Pipeline Page providing enrollment controls, progression state tables,
 * visual round trackers, and interview result update forms.
 */
const Pipeline = () => {
  const { showToast } = useToast();
  const [applications, setApplications] = useState([]);
  const [students, setStudents] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Enrollment State
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [enrollError, setEnrollError] = useState("");
  const [isEnrolling, setIsEnrolling] = useState(false);

  // Update Round Modal State
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [attendanceStatus, setAttendanceStatus] = useState("Present");
  const [roundStatus, setRoundStatus] = useState("Passed");
  const [marks, setMarks] = useState("");
  const [remarks, setRemarks] = useState("");
  const [updateError, setUpdateError] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch all pipeline tracking records
  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [appsRes, studsRes, compsRes] = await Promise.all([
        api.get("/applications"),
        api.get("/students"),
        api.get("/companies"),
      ]);

      setApplications(appsRes.data);
      setStudents(studsRes.data);
      setCompanies(compsRes.data);
    } catch (err) {
      setError("Failed to coordinate pipeline database synchronization.");
      showToast("Failed to fetch pipeline databases.", "error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Enroll student into company drive
  const handleEnroll = async (e) => {
    e.preventDefault();
    setEnrollError("");

    if (!selectedStudent || !selectedCompany) {
      setEnrollError("Please select both a student and a company.");
      return;
    }

    const studentName = students.find((s) => s._id === selectedStudent)?.name || "Candidate";
    const companyName = companies.find((c) => c._id === selectedCompany)?.name || "Company";

    setIsEnrolling(true);
    try {
      await api.post("/applications/register", {
        student: selectedStudent,
        company: selectedCompany,
      });

      showToast(`Enrolled "${studentName}" in "${companyName}" recruitment drive!`, "success");
      setSelectedStudent("");
      setSelectedCompany("");
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || "Enrollment failed.";
      setEnrollError(msg);
      showToast(msg, "error");
      console.error(err);
    } finally {
      setIsEnrolling(false);
    }
  };

  // Open round update modal
  const openUpdateModal = (app) => {
    setSelectedApp(app);
    setAttendanceStatus("Present");
    setRoundStatus("Passed");
    setMarks("");
    setRemarks("");
    setUpdateError("");
    setShowUpdateModal(true);
  };

  // Submit round advancement/failure metrics
  const handleUpdateRound = async (e) => {
    e.preventDefault();
    setUpdateError("");

    const marksVal = marks !== "" ? parseFloat(marks) : undefined;
    if (marksVal !== undefined && (isNaN(marksVal) || marksVal < 0)) {
      setUpdateError("Marks must be a non-negative number.");
      showToast("Validation failed: Marks cannot be negative.", "error");
      return;
    }

    setIsUpdating(true);
    const roundName = selectedApp.history?.[selectedApp.currentRoundIndex]?.roundName || "Current Round";
    const studentName = selectedApp.student?.name || "Candidate";

    try {
      const response = await api.post("/applications/update-round", {
        applicationId: selectedApp._id,
        attendanceStatus,
        roundStatus,
        marks: marksVal,
        remarks,
      });

      const updatedApp = response.data;

      // Handle custom professional toasts based on terminal status transitions
      if (updatedApp.status === "Offered") {
        showToast(`🎉 Congratulations! "${studentName}" has been Offered a job!`, "success");
      } else if (updatedApp.status === "Failed") {
        showToast(`"${studentName}" failed the process at "${roundName}".`, "error");
      } else {
        showToast(`"${studentName}" passed "${roundName}" and advanced to next round.`, "success");
      }

      setShowUpdateModal(false);
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update round status.";
      setUpdateError(msg);
      showToast(msg, "error");
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  // Get status color tag classes
  const getStatusBadge = (status) => {
    switch (status) {
      case "Offered":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Failed":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-800">Recruitment Drive Pipeline</h2>
        <p className="text-slate-500 text-sm mt-0.5">
          Enroll candidates into drives and manage their status across interview rounds.
        </p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-xl text-sm flex items-center space-x-2">
          <span>⚠️</span>
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* Top Section: Enrollment Form */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3">
          Candidate Enrollment Control Panel
        </h3>

        <form onSubmit={handleEnroll} className="flex flex-col md:flex-row items-end gap-4">
          {enrollError && (
            <div className="w-full md:w-auto self-center bg-rose-50 border border-rose-100 text-rose-600 p-3 rounded-lg text-xs font-semibold">
              ⚠️ {enrollError}
            </div>
          )}

          {/* Student Dropdown */}
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Select Student *
            </label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:bg-white focus:border-sky-500"
              required
            >
              <option value="">-- Choose Candidate --</option>
              {students.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.rollNumber}) - CGPA: {s.cgpa.toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          {/* Company Dropdown */}
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Select Company Workflow *
            </label>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:bg-white focus:border-sky-500"
              required
            >
              <option value="">-- Choose Company --</option>
              {companies.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.rounds.length} rounds)
                </option>
              ))}
            </select>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isEnrolling}
            className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg text-sm transition-colors shadow-md shadow-sky-600/10 active:scale-[0.98] w-full md:w-auto whitespace-nowrap"
          >
            {isEnrolling ? "Enrolling..." : "Enroll Student"}
          </button>
        </form>
      </div>

      {/* Main Section: Tracking Matrix */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">Placement Tracking Matrix</h3>
          <span className="text-xs bg-slate-200 text-slate-700 font-semibold px-2.5 py-1 rounded-full">
            {applications.length} Candidates Enrolled
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Company</th>
                <th className="px-6 py-4">Overall Status</th>
                <th className="px-6 py-4">Recruitment Progress (Round Stepper)</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400 text-sm">
                    <div className="flex justify-center items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-slate-300 border-t-sky-600 rounded-full animate-spin"></div>
                      <span>Syncing progression matrix...</span>
                    </div>
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400 text-sm">
                    No active student drive registrations. Enroll a candidate above.
                  </td>
                </tr>
              ) : (
                applications.map((app) => {
                  const companyRounds = app.company?.rounds || [];

                  return (
                    <tr key={app._id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Student Info */}
                      <td className="px-6 py-4">
                        {app.student ? (
                          <div className="space-y-0.5">
                            <p className="text-sm font-semibold text-slate-800">{app.student.name}</p>
                            <p className="text-xs text-slate-400 font-mono">
                              {app.student.rollNumber} | {app.student.branch}
                            </p>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">Deleted Student</span>
                        )}
                      </td>

                      {/* Company Info */}
                      <td className="px-6 py-4">
                        {app.company ? (
                          <span className="text-sm font-medium text-slate-700">{app.company.name}</span>
                        ) : (
                          <span className="text-slate-400 text-xs">Deleted Company</span>
                        )}
                      </td>

                      {/* Application Overall Status */}
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 border rounded-full text-xs font-bold ${getStatusBadge(app.status)}`}>
                          {app.status}
                        </span>
                      </td>

                      {/* Progression Stepper */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-1">
                          {companyRounds.map((roundName, idx) => {
                            const roundHistory = app.history?.[idx];
                            let statusColor = "bg-slate-100 border-slate-200 text-slate-400"; // not reached

                            if (roundHistory) {
                              if (roundHistory.attendanceStatus === "Absent" || roundHistory.roundStatus === "Failed") {
                                statusColor = "bg-rose-100 border-rose-300 text-rose-700";
                              } else if (roundHistory.roundStatus === "Passed") {
                                statusColor = "bg-emerald-100 border-emerald-300 text-emerald-700";
                              } else if (roundHistory.roundStatus === "Pending") {
                                statusColor = "bg-sky-100 border-sky-300 text-sky-700 font-semibold animate-pulse";
                              }
                            }

                            return (
                              <React.Fragment key={idx}>
                                <div
                                  className={`flex flex-col items-center justify-center px-2 py-1 border rounded-md text-[10px] min-w-[70px] text-center ${statusColor}`}
                                  title={`Round ${idx + 1}: ${roundName}`}
                                >
                                  <span className="font-semibold truncate max-w-[80px]">{roundName}</span>
                                  {roundHistory?.marks !== undefined && (
                                    <span className="text-[9px] font-bold">({roundHistory.marks}m)</span>
                                  )}
                                </div>
                                {idx < companyRounds.length - 1 && (
                                  <span className="text-slate-300 text-[10px]">➔</span>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </div>
                      </td>

                      {/* Action trigger */}
                      <td className="px-6 py-4 text-sm text-right">
                        {app.status === "Pending" ? (
                          <button
                            onClick={() => openUpdateModal(app)}
                            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg text-xs transition-colors"
                          >
                            Update Round
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">Finished</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Update Round Modal */}
      {showUpdateModal && selectedApp && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-100">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <div className="text-left">
                <h3 className="text-lg font-bold text-slate-800">Update Round Metrics</h3>
                <p className="text-xs text-slate-500">
                  {selectedApp.student?.name} @ {selectedApp.company?.name} (Round: {selectedApp.history?.[selectedApp.currentRoundIndex]?.roundName})
                </p>
              </div>
              <button
                onClick={() => setShowUpdateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleUpdateRound}>
              <div className="p-6 space-y-4 text-left">
                {updateError && (
                  <div className="bg-rose-50 border border-rose-100 text-rose-600 p-3 rounded-lg text-xs font-semibold">
                    ⚠️ {updateError}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {/* Attendance */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Attendance Status *
                    </label>
                    <select
                      value={attendanceStatus}
                      onChange={(e) => setAttendanceStatus(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3.5 py-2 text-sm outline-none focus:border-sky-500"
                      required
                    >
                      <option value="Present">Present</option>
                      <option value="Absent">Absent</option>
                    </select>
                  </div>

                  {/* Round status */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Round Result *
                    </label>
                    <select
                      value={roundStatus}
                      onChange={(e) => setRoundStatus(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3.5 py-2 text-sm outline-none focus:border-sky-500"
                      required
                      disabled={attendanceStatus === "Absent"} // Absent defaults to Failure
                    >
                      <option value="Passed">Passed</option>
                      <option value="Failed">Failed</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {/* Marks */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Round Marks (Optional)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={marks}
                      onChange={(e) => setMarks(e.target.value)}
                      placeholder="e.g. 85"
                      className="w-full border border-slate-200 rounded-lg px-3.5 py-2 text-sm outline-none focus:border-sky-500"
                      disabled={attendanceStatus === "Absent"}
                    />
                  </div>

                  {/* Remarks */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Remarks / Notes (Optional)
                    </label>
                    <textarea
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="e.g. Communication was good, strong problem solving skills."
                      rows="3"
                      className="w-full border border-slate-200 rounded-lg px-3.5 py-2 text-sm outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
              </div>

              {/* Form Footer */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowUpdateModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-md shadow-sky-600/10"
                >
                  {isUpdating ? "Submitting..." : "Save Metrics"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pipeline;
