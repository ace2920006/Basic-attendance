import React, { useState, useEffect } from 'react';
import { 
  FiCalendar, 
  FiLayers, 
  FiGrid, 
  FiTrendingUp, 
  FiPlus, 
  FiTrash2, 
  FiCheckCircle, 
  FiChevronRight, 
  FiChevronDown, 
  FiUsers, 
  FiBookOpen, 
  FiRefreshCw,
  FiStar,
  FiArrowRight,
  FiCheckSquare,
  FiSquare
} from 'react-icons/fi';
import { HiOutlineAcademicCap } from 'react-icons/hi2';
import { useNotification } from '../../context/NotificationContext';
import { 
  getAcademicHierarchyApi, 
  getAcademicYearsApi, 
  createAcademicYearApi, 
  setCurrentAcademicYearApi, 
  deleteAcademicYearApi, 
  getSemestersApi, 
  createSemesterApi, 
  deleteSemesterApi, 
  getDivisionsApi, 
  createDivisionApi, 
  deleteDivisionApi, 
  promoteStudentsApi, 
  allocateSubjectApi 
} from '../../services/api';

export default function AdminAcademicEngine() {
  const { addNotification } = useNotification();

  const [activeTab, setActiveTab] = useState('tree'); // 'tree', 'years', 'divisions', 'promotion', 'subjects'
  const [loading, setLoading] = useState(true);

  // Data states
  const [hierarchy, setHierarchy] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [divisions, setDivisions] = useState([]);
  
  // Expanded tree node IDs
  const [expandedNodes, setExpandedNodes] = useState({});

  // Modals state
  const [showYearModal, setShowYearModal] = useState(false);
  const [showSemModal, setShowSemModal] = useState(false);
  const [showDivModal, setShowDivModal] = useState(false);

  // Form states
  const [yearForm, setYearForm] = useState({
    yearName: '2026-27',
    startDate: '2026-08-01',
    endDate: '2027-05-31',
    isCurrent: true,
    description: 'Academic Session 2026-2027'
  });

  const [semForm, setSemForm] = useState({
    name: 'Semester 5',
    semesterNumber: 5,
    academicYear: '',
    startDate: '2026-08-01',
    endDate: '2026-12-20'
  });

  const [divForm, setDivForm] = useState({
    name: 'IT-A',
    section: 'A',
    department: 'Information Technology',
    academicYear: '',
    semester: '',
    capacity: 60
  });

  // Promotion Engine state
  const [promotionSource, setPromotionSource] = useState({
    academicYear: '',
    semester: '',
    division: ''
  });
  const [promotionTarget, setPromotionTarget] = useState({
    academicYear: '',
    semester: '',
    division: ''
  });
  const [studentsList, setStudentsList] = useState([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [promotionRemarks, setPromotionRemarks] = useState('');

  // Fetch initial data
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [hierarchyRes, yearsRes, semRes, divRes] = await Promise.all([
        getAcademicHierarchyApi().catch(() => ({ data: [] })),
        getAcademicYearsApi().catch(() => ({ data: [] })),
        getSemestersApi().catch(() => ({ data: [] })),
        getDivisionsApi().catch(() => ({ data: [] }))
      ]);

      const hData = hierarchyRes.data || [];
      const yData = yearsRes.data || [];
      const sData = semRes.data || [];
      const dData = divRes.data || [];

      setHierarchy(hData);
      setAcademicYears(yData);
      setSemesters(sData);
      setDivisions(dData);

      // Auto-expand all years in hierarchy
      const initialExpanded = {};
      hData.forEach(y => {
        initialExpanded[y._id] = true;
        (y.semesters || []).forEach(s => {
          initialExpanded[s._id] = true;
        });
      });
      setExpandedNodes(initialExpanded);

      // Set default academic year for forms if available
      const currentY = yData.find(y => y.isCurrent) || yData[0];
      if (currentY) {
        setSemForm(prev => ({ ...prev, academicYear: currentY._id }));
        setDivForm(prev => ({ ...prev, academicYear: currentY._id }));
      }

    } catch (err) {
      addNotification('Failed to load academic engine data: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleNode = (id) => {
    setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Create Academic Year
  const handleCreateYear = async (e) => {
    e.preventDefault();
    try {
      const res = await createAcademicYearApi(yearForm);
      addNotification(res.message || 'Academic Year created!', 'success');
      setShowYearModal(false);
      fetchInitialData();
    } catch (err) {
      addNotification(err.message, 'error');
    }
  };

  // Set Current Academic Year
  const handleSetCurrentYear = async (id) => {
    try {
      const res = await setCurrentAcademicYearApi(id);
      addNotification(res.message, 'success');
      fetchInitialData();
    } catch (err) {
      addNotification(err.message, 'error');
    }
  };

  // Delete Academic Year
  const handleDeleteYear = async (id) => {
    if (!window.confirm('Delete this Academic Year and attached semesters?')) return;
    try {
      const res = await deleteAcademicYearApi(id);
      addNotification(res.message, 'success');
      fetchInitialData();
    } catch (err) {
      addNotification(err.message, 'error');
    }
  };

  // Create Semester
  const handleCreateSemester = async (e) => {
    e.preventDefault();
    try {
      const res = await createSemesterApi(semForm);
      addNotification(res.message || 'Semester created!', 'success');
      setShowSemModal(false);
      fetchInitialData();
    } catch (err) {
      addNotification(err.message, 'error');
    }
  };

  // Delete Semester
  const handleDeleteSemester = async (id) => {
    if (!window.confirm('Delete this Semester?')) return;
    try {
      const res = await deleteSemesterApi(id);
      addNotification(res.message, 'success');
      fetchInitialData();
    } catch (err) {
      addNotification(err.message, 'error');
    }
  };

  // Create Division
  const handleCreateDivision = async (e) => {
    e.preventDefault();
    try {
      const res = await createDivisionApi(divForm);
      addNotification(res.message || 'Division created!', 'success');
      setShowDivModal(false);
      fetchInitialData();
    } catch (err) {
      addNotification(err.message, 'error');
    }
  };

  // Delete Division
  const handleDeleteDivision = async (id) => {
    if (!window.confirm('Delete this Division?')) return;
    try {
      const res = await deleteDivisionApi(id);
      addNotification(res.message, 'success');
      fetchInitialData();
    } catch (err) {
      addNotification(err.message, 'error');
    }
  };

  // Handle Execute Student Promotion
  const handleExecutePromotion = async () => {
    if (!promotionTarget.academicYear || !promotionTarget.semester) {
      addNotification('Please select target Academic Year and Semester for promotion.', 'warning');
      return;
    }
    if (selectedStudentIds.length === 0) {
      addNotification('Please select at least one student to promote.', 'warning');
      return;
    }

    try {
      const res = await promoteStudentsApi({
        studentIds: selectedStudentIds,
        targetAcademicYearId: promotionTarget.academicYear,
        targetSemesterId: promotionTarget.semester,
        targetDivisionId: promotionTarget.division || null,
        remarks: promotionRemarks || 'Bulk Promoted via Academic Engine'
      });

      addNotification(res.message, 'success');
      setSelectedStudentIds([]);
      fetchInitialData();
    } catch (err) {
      addNotification(err.message, 'error');
    }
  };

  const currentYearObj = academicYears.find(y => y.isCurrent) || academicYears[0];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900/60 via-slate-900 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="p-2 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
                <HiOutlineAcademicCap className="w-6 h-6" />
              </span>
              <h1 className="text-2xl font-bold text-white tracking-tight">Academic Year & Semester Engine</h1>
            </div>
            <p className="text-sm text-slate-400">
              Dynamic multi-tier hierarchy engine: Academic Year ➔ Semester ➔ Department ➔ Division ➔ Subjects
            </p>
          </div>

          <div className="flex items-center gap-3">
            {currentYearObj && (
              <div className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/30 rounded-xl flex items-center gap-2">
                <FiStar className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="text-xs text-slate-300 font-medium">Active Session:</span>
                <span className="text-sm font-bold text-indigo-300">{currentYearObj.yearName}</span>
              </div>
            )}
            <button
              onClick={fetchInitialData}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all border border-slate-700"
              title="Refresh Data"
            >
              <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 border-b border-slate-800/80 pb-px overflow-x-auto">
          {[
            { id: 'tree', label: 'Academic Tree Hierarchy', icon: FiLayers },
            { id: 'years', label: 'Academic Years & Semesters', icon: FiCalendar },
            { id: 'divisions', label: 'Divisions & Sections', icon: FiGrid },
            { id: 'promotion', label: 'Student Promotion Engine', icon: FiTrendingUp }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-semibold transition-all border-b-2 whitespace-nowrap ${
                  isActive
                    ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tab Content */}
      {loading ? (
        <div className="flex items-center justify-center p-16">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* TAB 1: ACADEMIC TREE HIERARCHY */}
          {activeTab === 'tree' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">Visual Dynamic Hierarchy Tree</h2>
                  <p className="text-xs text-slate-400">
                    Live structure generated from Academic Years, Semesters, Departments, and Divisions
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowYearModal(true)}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all"
                  >
                    <FiPlus className="w-4 h-4" />
                    <span>New Academic Year</span>
                  </button>
                  <button
                    onClick={() => setShowSemModal(true)}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 flex items-center gap-2 transition-all"
                  >
                    <FiPlus className="w-4 h-4" />
                    <span>New Semester</span>
                  </button>
                </div>
              </div>

              {/* Hierarchy Tree Node Renderer */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
                {hierarchy.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-sm">
                    No academic structure configured yet. Click "New Academic Year" to start!
                  </div>
                ) : (
                  hierarchy.map(year => {
                    const isYearExpanded = expandedNodes[year._id];
                    return (
                      <div key={year._id} className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60">
                        {/* Level 1: Academic Year Header */}
                        <div 
                          onClick={() => toggleNode(year._id)}
                          className="p-4 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 flex items-center justify-between cursor-pointer hover:bg-slate-800/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="p-1 text-slate-400 hover:text-white">
                              {isYearExpanded ? <FiChevronDown className="w-5 h-5" /> : <FiChevronRight className="w-5 h-5" />}
                            </span>
                            <FiCalendar className="w-5 h-5 text-indigo-400" />
                            <span className="text-base font-bold text-white tracking-wide">{year.yearName}</span>
                            {year.isCurrent && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                                Current Active
                              </span>
                            )}
                            <span className="text-xs text-slate-400">
                              ({new Date(year.startDate).toLocaleDateString()} - {new Date(year.endDate).toLocaleDateString()})
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-slate-400 bg-slate-800 px-3 py-1 rounded-lg">
                              {(year.semesters || []).length} Semesters
                            </span>
                          </div>
                        </div>

                        {/* Level 2: Semesters under Academic Year */}
                        {isYearExpanded && (
                          <div className="p-4 pl-8 space-y-4 border-t border-slate-800/80 bg-slate-900/30">
                            {(year.semesters || []).length === 0 ? (
                              <div className="text-xs text-slate-400 italic pl-4">No semesters added to this Academic Year yet.</div>
                            ) : (
                              year.semesters.map(sem => {
                                const isSemExpanded = expandedNodes[sem._id];
                                return (
                                  <div key={sem._id} className="border border-slate-800/70 rounded-xl bg-slate-950/80 overflow-hidden">
                                    <div 
                                      onClick={() => toggleNode(sem._id)}
                                      className="p-3 bg-slate-900/80 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 transition-colors"
                                    >
                                      <div className="flex items-center gap-3">
                                        <span className="text-slate-400">
                                          {isSemExpanded ? <FiChevronDown className="w-4 h-4" /> : <FiChevronRight className="w-4 h-4" />}
                                        </span>
                                        <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50" />
                                        <span className="text-sm font-semibold text-white">{sem.name}</span>
                                        <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                                          Num: {sem.semesterNumber}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-3">
                                        <span className="text-xs text-indigo-300 bg-indigo-500/10 px-2.5 py-0.5 rounded-lg border border-indigo-500/20">
                                          {sem.subjectsCount} Subjects
                                        </span>
                                        <span className="text-xs text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded-lg">
                                          {(sem.departments || []).reduce((acc, d) => acc + d.divisions.length, 0)} Divisions
                                        </span>
                                      </div>
                                    </div>

                                    {/* Level 3 & 4: Departments & Divisions Tree */}
                                    {isSemExpanded && (
                                      <div className="p-3 pl-8 space-y-3 border-t border-slate-800/60 bg-slate-900/20">
                                        {(sem.departments || []).length === 0 ? (
                                          <div className="text-xs text-slate-400 italic">No divisions defined under this semester yet.</div>
                                        ) : (
                                          sem.departments.map((dept, idx) => (
                                            <div key={idx} className="space-y-2">
                                              <div className="text-xs font-bold text-slate-300 flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                                                <span>Department: {dept.name}</span>
                                              </div>
                                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pl-4">
                                                {dept.divisions.map(div => (
                                                  <div 
                                                    key={div._id} 
                                                    className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl flex items-center justify-between hover:border-indigo-500/50 transition-colors"
                                                  >
                                                    <div>
                                                      <div className="text-xs font-bold text-white flex items-center gap-2">
                                                        <span>{div.name}</span>
                                                        <span className="px-1.5 py-0.5 bg-slate-800 text-[10px] text-slate-400 rounded">
                                                          Sec {div.section}
                                                        </span>
                                                      </div>
                                                      <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                                                        <FiUsers className="w-3 h-3 text-cyan-400" />
                                                        <span>{div.studentsCount} / {div.capacity} Enrolled</span>
                                                      </div>
                                                    </div>
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          ))
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ACADEMIC YEARS & SEMESTERS */}
          {activeTab === 'years' && (
            <div className="space-y-6">
              {/* Actions Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">Academic Years & Dynamic Semesters</h2>
                  <p className="text-xs text-slate-400">Configure institutional sessions and term schedules</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowYearModal(true)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
                  >
                    <FiPlus className="w-4 h-4" />
                    <span>Create Academic Year</span>
                  </button>
                  <button
                    onClick={() => setShowSemModal(true)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-2 transition-all"
                  >
                    <FiPlus className="w-4 h-4" />
                    <span>Create Dynamic Semester</span>
                  </button>
                </div>
              </div>

              {/* Grid of Academic Years */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {academicYears.map(year => (
                  <div 
                    key={year._id} 
                    className={`bg-slate-900/90 border rounded-2xl p-5 space-y-4 transition-all ${
                      year.isCurrent ? 'border-indigo-500 shadow-xl shadow-indigo-500/10' : 'border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-xl">
                          <FiCalendar className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">{year.yearName}</h3>
                          <p className="text-xs text-slate-400">{year.description || 'Academic Session'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {year.isCurrent ? (
                          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5">
                            <FiCheckCircle className="w-3.5 h-3.5" />
                            Current Active
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSetCurrentYear(year._id)}
                            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
                          >
                            Set Active
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteYear(year._id)}
                          className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                          title="Delete Academic Year"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                      <div>
                        <span className="text-slate-400 block">Start Date:</span>
                        <span className="text-slate-200 font-semibold">{new Date(year.startDate).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">End Date:</span>
                        <span className="text-slate-200 font-semibold">{new Date(year.endDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Semesters belonging to this year */}
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        Semesters ({semesters.filter(s => (s.academicYear?._id || s.academicYear) === year._id).length})
                      </div>
                      <div className="space-y-1.5">
                        {semesters
                          .filter(s => (s.academicYear?._id || s.academicYear) === year._id)
                          .map(sem => (
                            <div key={sem._id} className="p-2.5 bg-slate-950/40 border border-slate-800/60 rounded-xl flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                                <span className="font-semibold text-white">{sem.name}</span>
                                <span className="text-slate-400">(Num: {sem.semesterNumber})</span>
                              </div>
                              <button
                                onClick={() => handleDeleteSemester(sem._id)}
                                className="text-slate-400 hover:text-rose-400 transition-colors p-1"
                              >
                                <FiTrash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: DIVISIONS & SECTIONS */}
          {activeTab === 'divisions' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">Class Divisions & Sections</h2>
                  <p className="text-xs text-slate-400">Manage class sections (e.g. IT-A, IT-B, CS-A) under academic terms</p>
                </div>
                <button
                  onClick={() => setShowDivModal(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
                >
                  <FiPlus className="w-4 h-4" />
                  <span>Create Division</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {divisions.length === 0 ? (
                  <div className="col-span-3 text-center py-12 text-slate-400 text-sm">
                    No divisions created yet. Click "Create Division" to add sections!
                  </div>
                ) : (
                  divisions.map(div => (
                    <div key={div._id} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3 relative group">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-indigo-600/20 text-indigo-400 rounded-xl font-bold">
                            <FiGrid className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-white">{div.name}</h3>
                            <p className="text-xs text-slate-400">{div.department}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteDivision(div._id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                          <span className="text-slate-400 block">Semester:</span>
                          <span className="text-indigo-300 font-semibold">{div.semester?.name || 'N/A'}</span>
                        </div>
                        <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                          <span className="text-slate-400 block">Enrolled:</span>
                          <span className="text-emerald-400 font-semibold">{div.studentsCount} / {div.capacity}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: STUDENT PROMOTION ENGINE */}
          {activeTab === 'promotion' && (
            <div className="space-y-6">
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <FiTrendingUp className="w-5 h-5 text-indigo-400" />
                    <span>Student Batch Promotion Engine</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Promote student cohorts seamlessly across Academic Years, Semesters, and Class Divisions.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Step 1: Source Cohort */}
                  <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-4">
                    <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">1</span>
                      <span>Select Target Academic Year & Semester</span>
                    </h3>

                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-slate-400 font-medium mb-1 block">Target Academic Year</label>
                        <select
                          value={promotionTarget.academicYear}
                          onChange={(e) => setPromotionTarget({ ...promotionTarget, academicYear: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs font-medium focus:border-indigo-500 outline-none"
                        >
                          <option value="">Select Target Academic Year...</option>
                          {academicYears.map(y => (
                            <option key={y._id} value={y._id}>{y.yearName} {y.isCurrent ? '(Current Active)' : ''}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-xs text-slate-400 font-medium mb-1 block">Target Semester</label>
                        <select
                          value={promotionTarget.semester}
                          onChange={(e) => setPromotionTarget({ ...promotionTarget, semester: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs font-medium focus:border-indigo-500 outline-none"
                        >
                          <option value="">Select Target Semester...</option>
                          {semesters
                            .filter(s => !promotionTarget.academicYear || (s.academicYear?._id || s.academicYear) === promotionTarget.academicYear)
                            .map(s => (
                              <option key={s._id} value={s._id}>{s.name} (Term {s.semesterNumber})</option>
                            ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-xs text-slate-400 font-medium mb-1 block">Target Division (Optional)</label>
                        <select
                          value={promotionTarget.division}
                          onChange={(e) => setPromotionTarget({ ...promotionTarget, division: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs font-medium focus:border-indigo-500 outline-none"
                        >
                          <option value="">Auto-assign or Select Division...</option>
                          {divisions
                            .filter(d => !promotionTarget.semester || (d.semester?._id || d.semester) === promotionTarget.semester)
                            .map(d => (
                              <option key={d._id} value={d._id}>{d.name} ({d.department})</option>
                            ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Confirmation & Execution */}
                  <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col justify-between">
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">2</span>
                        <span>Promotion Execution Remarks</span>
                      </h3>

                      <div>
                        <label className="text-xs text-slate-400 font-medium mb-1 block">Promotion Audit Note</label>
                        <textarea
                          value={promotionRemarks}
                          onChange={(e) => setPromotionRemarks(e.target.value)}
                          placeholder="e.g., Promoted after passing Semester 4 exams with good standing."
                          className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs font-medium focus:border-indigo-500 outline-none h-24 resize-none"
                        />
                      </div>

                      <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs text-indigo-300">
                        ⚡ Promoted students will automatically have their profile active semester, academic year, and enrollment logs updated immediately.
                      </div>
                    </div>

                    <button
                      onClick={handleExecutePromotion}
                      className="w-full py-3 bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
                    >
                      <FiCheckCircle className="w-4 h-4" />
                      <span>Execute Student Batch Promotion</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* CREATE ACADEMIC YEAR MODAL */}
      {showYearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FiCalendar className="w-5 h-5 text-indigo-400" />
              <span>Create Academic Year</span>
            </h3>

            <form onSubmit={handleCreateYear} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Year Title / Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2026-27"
                  value={yearForm.yearName}
                  onChange={e => setYearForm({ ...yearForm, yearName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={yearForm.startDate}
                    onChange={e => setYearForm({ ...yearForm, startDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={yearForm.endDate}
                    onChange={e => setYearForm({ ...yearForm, endDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isCurrentYear"
                  checked={yearForm.isCurrent}
                  onChange={e => setYearForm({ ...yearForm, isCurrent: e.target.checked })}
                  className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-0"
                />
                <label htmlFor="isCurrentYear" className="text-xs text-slate-300 cursor-pointer">
                  Set as Current Active Academic Year
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowYearModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-500 shadow-lg shadow-indigo-600/30"
                >
                  Save Academic Year
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE SEMESTER MODAL */}
      {showSemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FiLayers className="w-5 h-5 text-indigo-400" />
              <span>Create Dynamic Semester</span>
            </h3>

            <form onSubmit={handleCreateSemester} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Academic Year</label>
                <select
                  required
                  value={semForm.academicYear}
                  onChange={e => setSemForm({ ...semForm, academicYear: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500"
                >
                  <option value="">Select Academic Year...</option>
                  {academicYears.map(y => (
                    <option key={y._id} value={y._id}>{y.yearName}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Semester Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Semester 5"
                    value={semForm.name}
                    onChange={e => setSemForm({ ...semForm, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Semester Number</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={semForm.semesterNumber}
                    onChange={e => setSemForm({ ...semForm, semesterNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowSemModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-500 shadow-lg shadow-indigo-600/30"
                >
                  Save Semester
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE DIVISION MODAL */}
      {showDivModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FiGrid className="w-5 h-5 text-indigo-400" />
              <span>Create Class Division / Section</span>
            </h3>

            <form onSubmit={handleCreateDivision} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Academic Year</label>
                <select
                  required
                  value={divForm.academicYear}
                  onChange={e => setDivForm({ ...divForm, academicYear: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500"
                >
                  <option value="">Select Academic Year...</option>
                  {academicYears.map(y => (
                    <option key={y._id} value={y._id}>{y.yearName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Semester</label>
                <select
                  required
                  value={divForm.semester}
                  onChange={e => setDivForm({ ...divForm, semester: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500"
                >
                  <option value="">Select Semester...</option>
                  {semesters
                    .filter(s => !divForm.academicYear || (s.academicYear?._id || s.academicYear) === divForm.academicYear)
                    .map(s => (
                      <option key={s._id} value={s._id}>{s.name}</option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Division Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. IT-A"
                    value={divForm.name}
                    onChange={e => setDivForm({ ...divForm, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Section</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. A"
                    value={divForm.section}
                    onChange={e => setDivForm({ ...divForm, section: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Department</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Information Technology"
                  value={divForm.department}
                  onChange={e => setDivForm({ ...divForm, department: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowDivModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-500 shadow-lg shadow-indigo-600/30"
                >
                  Save Division
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
