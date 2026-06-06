import React, { useState, useEffect } from "react";
import api from "../services/api";
import { useToast } from "../context/ToastContext";

/**
 * Student Directory component providing full profile management, search, and CSV reporting.
 */
const Students = () => {
  const { showToast } = useToast();
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // 'add' or 'edit'
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  // Form Fields
  const [rollNumber, setRollNumber] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [branch, setBranch] = useState("");
  const [cgpa, setCgpa] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [formError, setFormError] = useState("");

  // Fetch student records
  const fetchStudents = async (query = "") => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get(`/students${query ? `?search=${query}` : ""}`);
      setStudents(response.data);
    } catch (err) {
      setError("Failed to retrieve student records.");
      showToast("Failed to fetch students from the database.", "error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Trigger search on query text change
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchStudents(search);
    }, 300); // Debounce request by 300ms

    return () => clearTimeout(handler);
  }, [search]);

  // Open modal in creation mode
  const openAddModal = () => {
    setModalMode("add");
    setRollNumber("");
    setName("");
    setEmail("");
    setBranch("");
    setCgpa("");
    setResumeUrl("");
    setFormError("");
    setShowModal(true);
  };

  // Open modal in edit mode with student details prefilled
  const openEditModal = (student) => {
    setModalMode("edit");
    setSelectedStudentId(student._id);
    setRollNumber(student.rollNumber);
    setName(student.name);
    setEmail(student.email);
    setBranch(student.branch);
    setCgpa(student.cgpa.toString());
    setResumeUrl(student.resumeUrl || "");
    setFormError("");
    setShowModal(true);
  };

  // Handle student creation/update form submission
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    // Front-end validations
    const cgpaVal = parseFloat(cgpa);
    if (isNaN(cgpaVal) || cgpaVal < 0 || cgpaVal > 10) {
      setFormError("CGPA must be a valid number between 0 and 10.");
      showToast("Validation failed: CGPA must be between 0 and 10.", "error");
      return;
    }

    const payload = {
      rollNumber,
      name,
      email,
      branch,
      cgpa: cgpaVal,
      resumeUrl,
    };

    try {
      if (modalMode === "add") {
        await api.post("/students", payload);
        showToast(`Registered student profile for "${name}"!`, "success");
      } else {
        await api.put(`/students/${selectedStudentId}`, payload);
        showToast(`Updated student profile for "${name}"!`, "success");
      }
      setShowModal(false);
      fetchStudents(search);
    } catch (err) {
      const message = err.response?.data?.message || "Operation failed.";
      setFormError(message);
      showToast(message, "error");
      console.error(err);
    }
  };

  // Delete student record
  const handleDeleteStudent = async (id, studentName) => {
    if (window.confirm(`Are you sure you want to delete the student profile for "${studentName}"?`)) {
      try {
        setError("");
        await api.delete(`/students/${id}`);
        showToast(`Successfully deleted student record for "${studentName}"`, "success");
        fetchStudents(search);
      } catch (err) {
        showToast("Failed to delete student record.", "error");
        console.error(err);
      }
    }
  };

  // Export active student list to CSV
  const exportToCSV = () => {
    if (students.length === 0) {
      showToast("No student records available to export.", "error");
      return;
    }

    const headers = ["Roll Number", "Name", "Email", "Branch", "CGPA", "Resume URL"];
    const rows = students.map((s) => [
      `"${s.rollNumber.replace(/"/g, '""')}"`,
      `"${s.name.replace(/"/g, '""')}"`,
      `"${s.email.replace(/"/g, '""')}"`,
      `"${s.branch.replace(/"/g, '""')}"`,
      s.cgpa,
      `"${(s.resumeUrl || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `students_report_${Date.now()}.csv`);
    link.style.visibility = "hidden";
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("Downloaded student directory report!", "success");
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Student Directory</h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Register new candidates, modify profiles, and manage active profiles.
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={exportToCSV}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center space-x-2"
          >
            <span>📥</span>
            <span>Export CSV</span>
          </button>
          <button
            onClick={openAddModal}
            className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-semibold transition-colors duration-150 shadow-md shadow-sky-600/10 flex items-center justify-center space-x-2"
          >
            <span>➕</span>
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center">
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">🔍</span>
          <input
            type="text"
            placeholder="Search by student name or roll number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none transition-all"
          />
        </div>
      </div>

      {/* General Error alert */}
      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-xl text-sm flex items-center space-x-2">
          <span>⚠️</span>
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                <th className="px-6 py-4">Roll Number</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Branch</th>
                <th className="px-6 py-4 text-center">CGPA</th>
                <th className="px-6 py-4">Resume</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-400 text-sm">
                    <div className="flex justify-center items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-slate-300 border-t-sky-600 rounded-full animate-spin"></div>
                      <span>Syncing student directory...</span>
                    </div>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-400 text-sm">
                    No student records found matching the criteria.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-slate-700 font-mono">{student.rollNumber}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-800">{student.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{student.email}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{student.branch}</td>
                    <td className="px-6 py-4 text-sm text-center">
                      <span className="px-2.5 py-1 bg-sky-50 text-sky-700 font-bold rounded-full text-xs">
                        {student.cgpa.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {student.resumeUrl ? (
                        <a
                          href={student.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sky-600 hover:text-sky-800 font-medium inline-flex items-center space-x-1"
                        >
                          <span>📄</span>
                          <span>View Resume</span>
                        </a>
                      ) : (
                        <span className="text-slate-400 text-xs">Not Uploaded</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-right space-x-3">
                      <button
                        onClick={() => openEditModal(student)}
                        className="text-amber-600 hover:text-amber-800 font-semibold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteStudent(student._id, student.name)}
                        className="text-rose-600 hover:text-rose-800 font-semibold"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-100">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">
                {modalMode === "add" ? "Register New Student" : "Modify Student Profile"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit}>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {formError && (
                  <div className="bg-rose-50 border border-rose-100 text-rose-600 p-3 rounded-lg text-xs font-semibold">
                    ⚠️ {formError}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Roll Number *
                    </label>
                    <input
                      type="text"
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value)}
                      placeholder="e.g. CS101"
                      className="w-full border border-slate-200 rounded-lg px-3.5 py-2 text-sm outline-none focus:border-sky-500"
                      required
                      disabled={modalMode === "edit"} // Roll number is unique and immutable
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full border border-slate-200 rounded-lg px-3.5 py-2 text-sm outline-none focus:border-sky-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. john.doe@university.edu"
                    className="w-full border border-slate-200 rounded-lg px-3.5 py-2 text-sm outline-none focus:border-sky-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Branch / Program *
                    </label>
                    <input
                      type="text"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      placeholder="e.g. Computer Science"
                      className="w-full border border-slate-200 rounded-lg px-3.5 py-2 text-sm outline-none focus:border-sky-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      CGPA * (Scale 0-10)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={cgpa}
                      onChange={(e) => setCgpa(e.target.value)}
                      placeholder="e.g. 9.15"
                      className="w-full border border-slate-200 rounded-lg px-3.5 py-2 text-sm outline-none focus:border-sky-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Resume Document URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={resumeUrl}
                    onChange={(e) => setResumeUrl(e.target.value)}
                    placeholder="e.g. https://drive.google.com/resume"
                    className="w-full border border-slate-200 rounded-lg px-3.5 py-2 text-sm outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Form Footer */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-md shadow-sky-600/10"
                >
                  {modalMode === "add" ? "Save Student" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
