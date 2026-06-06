import React, { useState, useEffect } from "react";
import api from "../services/api";
import { useToast } from "../context/ToastContext";

/**
 * Executive Dashboard Analytics Page.
 * Renders statistical cards (Placed, Pending, Rejected, Selection Ratio) and lists company success tallies with CSV downloads.
 */
const Dashboard = () => {
  const { showToast } = useToast();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardMetrics = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/applications/dashboard");
      setMetrics(response.data);
    } catch (err) {
      setError("Failed to retrieve system placement metrics.");
      showToast("Failed to fetch dashboard data.", "error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardMetrics();
  }, []);

  // Export company placements data to CSV
  const exportToCSV = () => {
    const placements = metrics?.companyPlacements || [];
    if (placements.length === 0) {
      showToast("No placement records available to export.", "error");
      return;
    }

    const totalPlaced = metrics?.totalPlaced || 0;
    const headers = ["Company Name", "Successful Placements", "Placement Share (%)"];
    const rows = placements.map((p) => {
      const share = totalPlaced > 0 ? ((p.placementCount / totalPlaced) * 100).toFixed(1) : "0.0";
      return [
        `"${p.companyName.replace(/"/g, '""')}"`,
        p.placementCount,
        `"${share}%"`,
      ];
    });

    const csvContent = [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `placement_report_${Date.now()}.csv`);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("Downloaded placement analytics report!", "success");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24 text-slate-400 text-sm space-x-2">
        <div className="w-6 h-6 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin"></div>
        <span>Compiling analytics data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-xl text-sm flex items-center space-x-2">
        <span>⚠️</span>
        <span className="font-semibold">{error}</span>
      </div>
    );
  }

  // Calculate Selection Ratio: Placed / (Placed + Rejected)
  const placed = metrics?.totalPlaced || 0;
  const rejected = metrics?.totalRejected || 0;
  const pending = metrics?.totalPending || 0;
  const totalConcluded = placed + rejected;
  const selectionRatio = totalConcluded > 0 ? (placed / totalConcluded) * 100 : 0;

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-800">Executive Placement Dashboard</h2>
        <p className="text-slate-500 text-sm mt-0.5">
          Real-time metrics, pipeline summaries, and company-wise placement statistics.
        </p>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Placed */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="space-y-1.5">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Placed Candidates</p>
            <p className="text-3xl font-extrabold text-slate-800">{placed}</p>
          </div>
          <div className="p-4 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl text-2xl">
            🎓
          </div>
        </div>

        {/* Ongoing candidates */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="space-y-1.5">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Ongoing Candidates</p>
            <p className="text-3xl font-extrabold text-slate-800">{pending}</p>
          </div>
          <div className="p-4 bg-amber-50 text-amber-600 border border-amber-100 rounded-xl text-2xl">
            ⚡
          </div>
        </div>

        {/* Total Rejections */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="space-y-1.5">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Failed / Rejected</p>
            <p className="text-3xl font-extrabold text-slate-800">{rejected}</p>
          </div>
          <div className="p-4 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-2xl">
            ❌
          </div>
        </div>

        {/* Selection Ratio */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="space-y-1.5">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Selection Ratio</p>
            <p className="text-3xl font-extrabold text-slate-800">
              {selectionRatio.toFixed(1)}%
            </p>
          </div>
          <div className="p-4 bg-sky-50 text-sky-600 border border-sky-100 rounded-xl text-2xl">
            📈
          </div>
        </div>
      </div>

      {/* Company Wise Statistics Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden max-w-4xl">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Company Placement Analytics</h3>
            <p className="text-xs text-slate-400 mt-0.5">Successful recruitments categorized by company.</p>
          </div>
          <button
            onClick={exportToCSV}
            className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors shadow-sm inline-flex items-center space-x-1.5"
          >
            <span>📥</span>
            <span>Export Report (CSV)</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                <th className="px-6 py-4">Company Name</th>
                <th className="px-6 py-4 text-center">Successful Placements</th>
                <th className="px-6 py-4 text-right">Placement Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              {metrics?.companyPlacements?.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-8 text-center text-slate-400 text-sm">
                    No placements recorded yet. Set status to "Offered" in the drive pipeline.
                  </td>
                </tr>
              ) : (
                metrics?.companyPlacements?.map((placement, index) => {
                  const share = placed > 0 ? (placement.placementCount / placed) * 100 : 0;
                  return (
                    <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                        {placement.companyName}
                      </td>
                      <td className="px-6 py-4 text-sm text-center font-bold text-emerald-600">
                        {placement.placementCount}
                      </td>
                      <td className="px-6 py-4 text-sm text-right font-medium text-slate-500">
                        {share.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
