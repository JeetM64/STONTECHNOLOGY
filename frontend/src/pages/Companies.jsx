import React, { useState, useEffect } from "react";
import api from "../services/api";

/**
 * Company Directory view containing workflow constructor forms and active sequences lists.
 */
const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Creation Form State
  const [companyName, setCompanyName] = useState("");
  const [rounds, setRounds] = useState([]);
  const [newRound, setNewRound] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch registered companies
  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/companies");
      setCompanies(response.data);
    } catch (err) {
      setError("Failed to fetch registered company workflows.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  // Add round to temporary local array
  const handleAddRound = (e) => {
    e.preventDefault();
    const roundName = newRound.trim();
    if (!roundName) return;

    if (rounds.includes(roundName)) {
      setFormError("A round with this name has already been added to the sequence.");
      return;
    }

    setRounds([...rounds, roundName]);
    setNewRound("");
    setFormError("");
  };

  // Remove round from temporary local array
  const handleRemoveRound = (indexToRemove) => {
    setRounds(rounds.filter((_, idx) => idx !== indexToRemove));
  };

  // Submit company workflow
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!companyName.trim()) {
      setFormError("Please enter a company name.");
      return;
    }

    if (rounds.length === 0) {
      setFormError("Please define at least one recruitment round.");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/companies", {
        name: companyName,
        rounds,
      });

      // Reset form fields
      setCompanyName("");
      setRounds([]);
      setNewRound("");
      setFormError("");
      fetchCompanies();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to register company. Ensure name is unique.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-800">Recruitment Workflows</h2>
        <p className="text-slate-500 text-sm mt-0.5">
          Configure corporate interview workflows by sequencing custom rounds.
        </p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-xl text-sm flex items-center space-x-2">
          <span>⚠️</span>
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* Main Grid split into dynamic builder and active list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Dynamic Workflow Builder Form */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 h-fit">
          <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3">
            Workflow Constructor
          </h3>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            {formError && (
              <div className="bg-rose-50 border border-rose-100 text-rose-600 p-3 rounded-lg text-xs font-semibold">
                ⚠️ {formError}
              </div>
            )}

            {/* Company Name */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Company Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Google, Microsoft"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3.5 py-2 text-sm outline-none focus:border-sky-500"
                required
              />
            </div>

            {/* Rounds Dynamic Tags builder */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Add Recruitment Rounds *
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="e.g. Aptitude, Technical"
                  value={newRound}
                  onChange={(e) => setNewRound(e.target.value)}
                  className="flex-1 border border-slate-200 rounded-lg px-3.5 py-2 text-sm outline-none focus:border-sky-500"
                />
                <button
                  type="button"
                  onClick={handleAddRound}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  Add
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Sequence rounds in order of execution.
              </p>
            </div>

            {/* Configured rounds display */}
            {rounds.length > 0 && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Configured Sequence ({rounds.length})
                </label>
                <div className="flex flex-wrap gap-2 p-3 bg-slate-50 border border-slate-100 rounded-lg">
                  {rounds.map((round, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-1.5 px-2.5 py-1 bg-white border border-slate-200 text-slate-700 text-xs font-medium rounded-full shadow-sm"
                    >
                      <span className="text-slate-400 font-bold">{index + 1}.</span>
                      <span>{round}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveRound(index)}
                        className="text-slate-400 hover:text-slate-600 font-bold ml-1 text-[10px]"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-md shadow-sky-600/10 active:scale-[0.98] disabled:opacity-50"
            >
              {isSubmitting ? "Saving Workflow..." : "Save Workflow"}
            </button>
          </form>
        </div>

        {/* Right Side: Active Workflows List */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3">
            Registered Companies
          </h3>

          {loading ? (
            <div className="flex justify-center items-center py-12 text-slate-400 text-sm space-x-2">
              <div className="w-5 h-5 border-2 border-slate-300 border-t-sky-600 rounded-full animate-spin"></div>
              <span>Syncing workflows...</span>
            </div>
          ) : companies.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              No registered companies found. Define one using the constructor.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {companies.map((company) => (
                <div key={company._id} className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-slate-800">{company.name}</h4>
                    <p className="text-xs text-slate-400 font-medium">
                      Registered: {new Date(company.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Stepper display of company rounds */}
                  <div className="flex flex-wrap items-center gap-1.5 max-w-md">
                    {company.rounds.map((round, idx) => (
                      <React.Fragment key={idx}>
                        <span className="px-2.5 py-1 bg-sky-50 border border-sky-100 text-sky-700 text-xs font-semibold rounded-md">
                          {round}
                        </span>
                        {idx < company.rounds.length - 1 && (
                          <span className="text-slate-300 text-xs font-bold">➜</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Companies;
