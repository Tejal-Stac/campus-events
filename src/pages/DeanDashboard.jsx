import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
// import api from "../api/axiosConfig";
import { eventService } from "../api/eventService";
import axios from 'axios';

// 1. Paste your raw Render link right here (Make sure it ends with /api)
const PRODUCTION_BACKEND_URL = 'https://campus-events-ebwx.onrender.com/api';

// 2. Create a completely isolated instance inside this file only
const isolatedApi = axios.create({
  baseURL: PRODUCTION_BACKEND_URL,
  headers: { 'Content-Type': 'application/json' }
});

// 3. Attach the token directly
isolatedApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const DEPT_COLORS = [
  "#6366f1", "#10b981", "#f59e0b", "#ef4444",
  "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6",
  "#f97316", "#84cc16"
];

export default function DeanDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();


  const [activeTab, setActiveTab] = useState("overview");
  const [analytics, setAnalytics] = useState(null);
  const [students, setStudents] = useState([]);
  const [deptFilter, setDeptFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [faculties, setFaculties] = useState([]);
  const [usedCategories, setUsedCategories] = useState({});
  const [updatingFacultyId, setUpdatingFacultyId] = useState(null);

  // Bulk Import state
  const [studentFile, setStudentFile] = useState(null);
  const [facultyFile, setFacultyFile] = useState(null);
  const [studentImporting, setStudentImporting] = useState(false);
  const [facultyImporting, setFacultyImporting] = useState(false);
  const [importResult, setImportResult] = useState(null); // { type:'success'|'error', message, errors:[] }



  const showAlert = (msg, type = "success") => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 4000);
  };

  useEffect(() => {
    if (user && user.role !== "dean" && user.role !== "admin") {
      navigate(`/${user.role}-dashboard`, { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  useEffect(() => {
    if (activeTab === "faculty") {
      fetchFaculties();
    }
  }, [activeTab]);

  useEffect(() => {
    fetchStudents();
  }, [deptFilter]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      // Use the completely isolated api instance here
      const res = await isolatedApi.get('/dean/analytics');
      setAnalytics(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingEvents = async () => {
    try {
      const data = await eventService.fetchPendingEvents();
      setPendingEvents(data);
    } catch (err) {
      showAlert("Failed to load pending events", "error");
    }
  };

  const handleApproveEvent = async (eventId) => {
    setApprovingId(eventId);
    try {
      await eventService.approveEvent(eventId);
      showAlert("Event approved and published!", "success");
      fetchPendingEvents();
    } catch (err) {
      showAlert(err.response?.data?.message || "Failed to approve event", "error");
    } finally {
      setApprovingId(null);
    }
  };

  const handleRejectEvent = async (eventId) => {
    setApprovingId(eventId);
    try {
      await eventService.rejectEvent(eventId);
      showAlert("Event rejected", "success");
      fetchPendingEvents();
    } catch (err) {
      showAlert(err.response?.data?.message || "Failed to reject event", "error");
    } finally {
      setApprovingId(null);
    }
  };

  const fetchStudents = async () => {
    try {
      const url = deptFilter === "all"
        ? '/dean/students'
        : `/dean/students?department=${deptFilter}`;
      const res = await isolatedApi.get('/dean/students');
      setStudents(res.data.data || []);
    } catch (err) {
      console.error("Students fetch failed:", err.message);
    }
  };

  const fetchFaculties = async () => {
    try {
      const res = await isolatedApi.get('/dean/faculties');
      setFaculties(res.data.data || []);
      setUsedCategories(res.data.usedCategories || {});
    } catch (err) {
      showAlert(err.response?.data?.message || "Failed to load faculties", "error");
    }
  };

  const updateFacultyCoordinator = async (facultyId, newType) => {
    setUpdatingFacultyId(facultyId);
    try {
      const res = await api.put(
        `/dean/faculties/${facultyId}/coordinator`,
        { coordinatorType: newType }
      );
      showAlert(res.data.message, "success");
      fetchFaculties();
    } catch (err) {
      showAlert(err.response?.data?.message || "Failed to update coordinator", "error");
    } finally {
      setUpdatingFacultyId(null);
    }
  };

  // ── Bulk Import helpers ───────────────────────────────────────────────────
  const downloadTemplate = (type) => {
    const templates = {
      student: {
        content: "name,email,roll_no,department,year_of_study\nJohn Doe,john.doe@college.edu,21BCE001,Computer Engineering,2\nPriya Sharma,priya.sharma@college.edu,21ECE042,Electronics,3",
        filename: "student_import_template.csv"
      },
      faculty: {
        content: "name,email,department,designation,employee_id\nDr. Jane Smith,jane.smith@college.edu,Computer Engineering,Assistant Professor,FAC001\nProf. Rahul Mehta,rahul.mehta@college.edu,Mechanical Engineering,Associate Professor,FAC002",
        filename: "faculty_import_template.csv"
      }
    };
    const { content, filename } = templates[type];
    const blob = new Blob([content], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (type) => {
    const file = type === "student" ? studentFile : facultyFile;
    if (!file) { showAlert("Please select a CSV file first", "error"); return; }
    if (!file.name.endsWith(".csv")) { showAlert("Only .csv files are supported", "error"); return; }

    const setLoading = type === "student" ? setStudentImporting : setFacultyImporting;
    const endpoint = `/dean/import/${type === "student" ? "students" : "faculty"}`;
    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setImportResult(null);
    try {
      const res = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const data = res.data;
      if (data.success) {
        setImportResult({ type: "success", message: data.message, errors: [] });
        showAlert(data.message, "success");
        if (type === "student") setStudentFile(null);
        else setFacultyFile(null);
      } else {
        setImportResult({ type: "error", message: data.message || "Import failed", errors: data.errors || [] });
      }
    } catch (err) {
      setImportResult({ type: "error", message: "Network error — could not reach server", errors: [err.message] });
    } finally {
      setLoading(false);
    }
  };
  // ─────────────────────────────────────────────────────────────────────────

  const tabs = [
    { id: "overview", label: "📊 Overview" },
    { id: "departments", label: "🏛️ Departments" },
    { id: "events", label: "📅 Event Analytics" },
    { id: "faculty", label: "👨‍🏫 Faculty Management" },
    { id: "students", label: "👥 All Students" },
    { id: "bulkImport", label: "📥 Bulk Import" },
  ];

  const summary = analytics?.summary || {};
  const departments = analytics?.departments || [];
  const eventStats = analytics?.recentEventStats || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {alert && (
        <div className={`fixed top-20 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-white font-medium ${alert.type === "error" ? "bg-red-500" : "bg-green-500"
          }`}>
          {alert.msg}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Dean Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Institution-wide analytics & department performance
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 font-semibold border-b-2 transition-colors ${activeTab === tab.id
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
                }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
          </div>
        ) : (
          <>
            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div>
                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {[
                    { label: "Total Students", value: summary.totalStudents || 0, icon: "👥", color: "bg-blue-50 border-blue-200" },
                    { label: "Departments", value: summary.totalDepartments || 0, icon: "🏛️", color: "bg-indigo-50 border-indigo-200" },
                    { label: "Total Events", value: summary.totalEvents || 0, icon: "📅", color: "bg-green-50 border-green-200" },
                    { label: "Total Registrations", value: summary.totalRegistrations || 0, icon: "✅", color: "bg-purple-50 border-purple-200" },
                  ].map(({ label, value, icon, color }) => (
                    <div key={label} className={`rounded-xl border p-4 ${color}`}>
                      <div className="text-2xl mb-1">{icon}</div>
                      <div className="text-2xl font-bold text-gray-800">{value}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
                    </div>
                  ))}
                </div>

                {/* Department Participation Bar Chart */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
                  <h2 className="text-lg font-bold text-gray-700 mb-6">
                    🏆 Department-wise Participation Rate
                  </h2>
                  <div className="space-y-4">
                    {departments.slice(0, 8).map((dept, i) => (
                      <div key={dept.department}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-semibold text-gray-700">
                            {dept.department}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-400">
                              {dept.registrationCount} registrations / {dept.studentCount} students
                            </span>
                            <span className="text-sm font-bold"
                              style={{ color: DEPT_COLORS[i % DEPT_COLORS.length] }}>
                              {dept.participationRate}%
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-3">
                          <div
                            className="h-3 rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(dept.participationRate, 100)}%`,
                              backgroundColor: DEPT_COLORS[i % DEPT_COLORS.length]
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top 3 Departments */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {departments.slice(0, 3).map((dept, i) => (
                    <div key={dept.department}
                      className="bg-white rounded-2xl border border-gray-100 p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">
                          {i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}
                        </span>
                        <div>
                          <p className="font-bold text-gray-800">{dept.department}</p>
                          <p className="text-xs text-gray-400">#{i + 1} most active</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Students</span>
                          <span className="font-semibold">{dept.studentCount}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Registrations</span>
                          <span className="font-semibold">{dept.registrationCount}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Participation</span>
                          <span className="font-bold"
                            style={{ color: DEPT_COLORS[i] }}>
                            {dept.participationRate}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* DEPARTMENTS TAB */}
            {activeTab === "departments" && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Department-wise Performance Analysis
                </h2>
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                          {["Rank", "Department", "Students", "Registrations",
                            "Participation %", "Performance"].map(h => (
                              <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                {h}
                              </th>
                            ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {departments.map((dept, i) => (
                          <tr key={dept.department} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-4 text-sm font-bold text-gray-400">
                              #{i + 1}
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: DEPT_COLORS[i % DEPT_COLORS.length] }} />
                                <span className="font-semibold text-gray-800">
                                  {dept.department}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-600">
                              {dept.studentCount}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-600">
                              {dept.registrationCount}
                            </td>
                            <td className="px-4 py-4">
                              <span className="font-bold text-sm"
                                style={{ color: DEPT_COLORS[i % DEPT_COLORS.length] }}>
                                {dept.participationRate}%
                              </span>
                            </td>
                            <td className="px-4 py-4 w-40">
                              <div className="w-full bg-gray-100 rounded-full h-2">
                                <div className="h-2 rounded-full"
                                  style={{
                                    width: `${Math.min(dept.participationRate, 100)}%`,
                                    backgroundColor: DEPT_COLORS[i % DEPT_COLORS.length]
                                  }} />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Comparison Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="bg-green-50 border border-green-100 rounded-2xl p-5">
                    <h3 className="font-bold text-green-700 mb-3">🏆 Highest Participation</h3>
                    {departments[0] && (
                      <>
                        <p className="text-2xl font-bold text-green-800">
                          {departments[0].department}
                        </p>
                        <p className="text-green-600 text-sm mt-1">
                          {departments[0].participationRate}% participation rate
                        </p>
                        <p className="text-green-500 text-xs mt-1">
                          {departments[0].registrationCount} registrations from {departments[0].studentCount} students
                        </p>
                      </>
                    )}
                  </div>
                  <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
                    <h3 className="font-bold text-blue-700 mb-3">📊 Average Participation</h3>
                    <p className="text-2xl font-bold text-blue-800">
                      {departments.length > 0
                        ? Math.round(departments.reduce((s, d) => s + d.participationRate, 0) / departments.length)
                        : 0}%
                    </p>
                    <p className="text-blue-600 text-sm mt-1">Across all departments</p>
                    <p className="text-blue-500 text-xs mt-1">
                      {summary.totalRegistrations} total registrations
                    </p>
                  </div>
                  <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
                    <h3 className="font-bold text-red-700 mb-3">⚠️ Needs Attention</h3>
                    {departments[departments.length - 1] && (
                      <>
                        <p className="text-2xl font-bold text-red-800">
                          {departments[departments.length - 1].department}
                        </p>
                        <p className="text-red-600 text-sm mt-1">
                          {departments[departments.length - 1].participationRate}% participation rate
                        </p>
                        <p className="text-red-500 text-xs mt-1">Lowest among all departments</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* EVENTS TAB */}
            {activeTab === "events" && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Event-wise Department Participation
                </h2>
                {eventStats.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                    <div className="text-4xl mb-3">📅</div>
                    <p className="text-gray-500">No event data available yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {eventStats.map(ev => (
                      <div key={ev.id}
                        className="bg-white rounded-2xl border border-gray-100 p-5">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-bold text-gray-800">{ev.title}</h3>
                            <p className="text-xs text-gray-400 mt-1">
                              {ev.category} · {new Date(ev.date).toLocaleDateString()} ·
                              Total: {ev.totalRegistrations} registered
                            </p>
                          </div>
                          <span className="bg-indigo-100 text-indigo-700 text-xs px-3 py-1 rounded-full font-semibold">
                            {ev.totalRegistrations} total
                          </span>
                        </div>

                        {/* Department breakdown for this event */}
                        {ev.deptBreakdown?.length > 0 && (
                          <div className="space-y-2">
                            {ev.deptBreakdown.map((d, i) => (
                              <div key={d.department}>
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-xs font-medium text-gray-600">
                                    {d.department}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-400">
                                      {d.count} students
                                    </span>
                                    <span className="text-xs font-bold"
                                      style={{ color: DEPT_COLORS[i % DEPT_COLORS.length] }}>
                                      {d.percentage}%
                                    </span>
                                  </div>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2">
                                  <div className="h-2 rounded-full"
                                    style={{
                                      width: `${d.percentage}%`,
                                      backgroundColor: DEPT_COLORS[i % DEPT_COLORS.length]
                                    }} />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* FACULTY MANAGEMENT TAB */}
            {activeTab === "faculty" && (
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <h2 className="text-xl font-bold text-gray-800">
                    Faculty Coordination
                    <span className="ml-2 text-sm font-normal text-gray-400">
                      ({faculties.length} faculty members)
                    </span>
                  </h2>
                </div>

                {faculties.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                    <div className="text-4xl mb-3">👨‍🏫</div>
                    <p className="text-gray-500">No faculty members found</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-100">
                            {["#", "Name", "Email", "Department", "Designation", "Coordinator Role"].map(h => (
                              <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {faculties.map((fac, i) => (
                            <tr key={fac.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-3 text-sm text-gray-400">{i + 1}</td>
                              <td className="px-4 py-3 text-sm font-medium text-gray-800">
                                {fac.name}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500">{fac.email}</td>
                              <td className="px-4 py-3 text-sm">
                                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
                                  {fac.department || "—"}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">{fac.designation || "—"}</td>
                              <td className="px-4 py-3">
                                <select
                                  value={fac.coordinatorType}
                                  onChange={(e) => updateFacultyCoordinator(fac.id, e.target.value)}
                                  disabled={updatingFacultyId !== null}
                                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white disabled:bg-gray-100 disabled:cursor-not-allowed">
                                  <option value="none">No Role (none)</option>
                                  <option value="Technical" disabled={usedCategories['Technical'] && usedCategories['Technical'] !== fac.id}>
                                    Technical
                                  </option>
                                  <option value="Sports" disabled={usedCategories['Sports'] && usedCategories['Sports'] !== fac.id}>
                                    Sports
                                  </option>
                                  <option value="Cultural" disabled={usedCategories['Cultural'] && usedCategories['Cultural'] !== fac.id}>
                                    Cultural
                                  </option>
                                  <option value="Other" disabled={usedCategories['Other'] && usedCategories['Other'] !== fac.id}>
                                    Other
                                  </option>
                                </select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Legend */}
                    <div className="border-t border-gray-100 p-4 bg-gray-50">
                      <p className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wide">Coordinator Categories</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {["Technical", "Sports", "Cultural", "Other"].map(cat => {
                          const assignedTo = usedCategories[cat];
                          const assignedFaculty = faculties.find(f => f.id === assignedTo);
                          return (
                            <div key={cat} className="text-xs">
                              <p className="font-semibold text-gray-700">{cat}</p>
                              <p className="text-gray-500 mt-0.5">
                                {assignedFaculty ? `📌 ${assignedFaculty.name}` : "Unassigned"}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STUDENTS TAB */}
            {activeTab === "students" && (
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <h2 className="text-xl font-bold text-gray-800">
                    All Students
                    <span className="ml-2 text-sm font-normal text-gray-400">
                      ({students.length} shown)
                    </span>
                  </h2>

                  {/* Department Filter */}
                  <select
                    value={deptFilter}
                    onChange={e => setDeptFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white">
                    <option value="all">All Departments</option>
                    {departments.map(d => (
                      <option key={d.department} value={d.department}>
                        {d.department}
                      </option>
                    ))}
                  </select>
                </div>

                {students.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                    <div className="text-4xl mb-3">👥</div>
                    <p className="text-gray-500">No students found</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-100">
                            {["#", "Name", "Email", "Department",
                              "Year", "Division", "GR Number"].map(h => (
                                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                  {h}
                                </th>
                              ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {students.map((s, i) => (
                            <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-3 text-sm text-gray-400">{i + 1}</td>
                              <td className="px-4 py-3 text-sm font-medium text-gray-800">
                                {s.name}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500">{s.email}</td>
                              <td className="px-4 py-3 text-sm">
                                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
                                  {s.department || "—"}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500">
                                {s.year || "—"}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500">
                                {s.division || "—"}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500">
                                {s.grNumber || "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* BULK IMPORT TAB */}
            {activeTab === "bulkImport" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Bulk Import</h2>
                  <p className="text-sm text-gray-500 mt-1">Upload CSV files to add students or faculty in one batch. The entire import rolls back if any row fails.</p>
                </div>

                {/* Import Result Banner */}
                {importResult && (
                  <div className={`rounded-xl border p-4 ${importResult.type === "success"
                    ? "bg-green-50 border-green-200"
                    : "bg-red-50 border-red-200"
                    }`}>
                    <div className="flex items-start gap-3">
                      <span className="text-xl">{importResult.type === "success" ? "✅" : "❌"}</span>
                      <div className="flex-1">
                        <p className={`font-semibold text-sm ${importResult.type === "success" ? "text-green-800" : "text-red-800"
                          }`}>{importResult.message}</p>
                        {importResult.errors?.length > 0 && (
                          <ul className="mt-2 space-y-1">
                            {importResult.errors.map((e, i) => (
                              <li key={i} className="text-xs text-red-700 font-mono bg-red-100 rounded px-2 py-1">{e}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <button onClick={() => setImportResult(null)}
                        className="text-gray-400 hover:text-gray-600 text-lg leading-none">&times;</button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                  {/* Student Import Card */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl"></span>
                        <div>
                          <h3 className="font-bold text-white text-lg">Student Bulk Import</h3>
                          <p className="text-blue-100 text-xs mt-0.5">CSV columns: name, email, roll_no, department, year_of_study</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="border-2 border-dashed border-gray-200 rounded-xl p-5 text-center hover:border-indigo-300 transition-colors">
                        <div className="text-3xl mb-2">📂</div>
                        <label className="cursor-pointer">
                          <span className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">
                            {studentFile ? studentFile.name : "Click to choose a CSV file"}
                          </span>
                          <input type="file" accept=".csv" className="hidden"
                            onChange={e => { setStudentFile(e.target.files[0]); setImportResult(null); }} />
                        </label>
                        {studentFile && (
                          <p className="text-xs text-gray-400 mt-1">
                            {(studentFile.size / 1024).toFixed(1)} KB selected
                          </p>
                        )}
                        {!studentFile && <p className="text-xs text-gray-400 mt-1">Supports .csv up to 5 MB</p>}
                      </div>

                      <div className="flex gap-3">
                        <button onClick={() => downloadTemplate("student")}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-indigo-300 text-indigo-700 rounded-xl text-sm font-semibold hover:bg-indigo-50 transition-colors">
                          Download Template
                        </button>
                        <button
                          onClick={() => handleImport("student")}
                          disabled={studentImporting || !studentFile}
                          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${studentImporting || !studentFile
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-indigo-600 hover:bg-indigo-700 text-white"
                            }`}>
                          {studentImporting ? "🔄 Processing Data..." : " Import Students"}
                        </button>
                      </div>

                      <div className="bg-blue-50 rounded-xl p-3">
                        <p className="text-xs font-semibold text-blue-700 mb-1"> Required Columns</p>
                        <div className="flex flex-wrap gap-1">
                          {["name", "email", "roll_no", "department", "year_of_study"].map(col => (
                            <span key={col} className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-mono">{col}</span>
                          ))}
                        </div>
                        <p className="text-xs text-blue-600 mt-2">Default password set to <span className="font-mono font-semibold">Student@123</span></p>
                      </div>
                    </div>
                  </div>

                  {/* Faculty Import Card */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl"></span>
                        <div>
                          <h3 className="font-bold text-white text-lg">Faculty Bulk Import</h3>
                          <p className="text-emerald-100 text-xs mt-0.5">CSV columns: name, email, department, designation, employee_id</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="border-2 border-dashed border-gray-200 rounded-xl p-5 text-center hover:border-emerald-300 transition-colors">
                        <div className="text-3xl mb-2">📂</div>
                        <label className="cursor-pointer">
                          <span className="text-sm font-semibold text-emerald-600 hover:text-emerald-800">
                            {facultyFile ? facultyFile.name : "Click to choose a CSV file"}
                          </span>
                          <input type="file" accept=".csv" className="hidden"
                            onChange={e => { setFacultyFile(e.target.files[0]); setImportResult(null); }} />
                        </label>
                        {facultyFile && (
                          <p className="text-xs text-gray-400 mt-1">
                            {(facultyFile.size / 1024).toFixed(1)} KB selected
                          </p>
                        )}
                        {!facultyFile && <p className="text-xs text-gray-400 mt-1">Supports .csv up to 5 MB</p>}
                      </div>

                      <div className="flex gap-3">
                        <button onClick={() => downloadTemplate("faculty")}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-emerald-300 text-emerald-700 rounded-xl text-sm font-semibold hover:bg-emerald-50 transition-colors">
                          Download Template
                        </button>
                        <button
                          onClick={() => handleImport("faculty")}
                          disabled={facultyImporting || !facultyFile}
                          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${facultyImporting || !facultyFile
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-emerald-600 hover:bg-emerald-700 text-white"
                            }`}>
                          {facultyImporting ? "🔄 Processing Data..." : " Import Faculty"}
                        </button>
                      </div>

                      <div className="bg-emerald-50 rounded-xl p-3">
                        <p className="text-xs font-semibold text-emerald-700 mb-1"> Required Columns</p>
                        <div className="flex flex-wrap gap-1">
                          {["name", "email", "department", "designation", "employee_id"].map(col => (
                            <span key={col} className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-xs font-mono">{col}</span>
                          ))}
                        </div>
                        <p className="text-xs text-emerald-600 mt-2">Default password set to <span className="font-mono font-semibold">Faculty@123</span></p>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Info Banner */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
                  <span className="text-xl">⚠️</span>
                  <div className="text-xs text-amber-800 space-y-1">
                    <p className="font-semibold">Transaction Safety</p>
                    <p>If <strong>any row</strong> in your CSV contains a duplicate email or roll number, the <strong>entire batch is rolled back</strong> — no partial records are inserted. Fix the highlighted error and re-upload.</p>
                    <p>Ensure your CSV uses <strong>UTF-8 encoding</strong> and the first row is the exact header row from the template.</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}