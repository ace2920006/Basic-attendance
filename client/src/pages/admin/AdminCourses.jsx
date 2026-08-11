import React, { useEffect, useState } from 'react';
import { FiBookOpen, FiPlus, FiGrid, FiCheckCircle, FiTrash2, FiClock, FiSearch } from 'react-icons/fi';
import { getCoursesApi, createCourseApi, deleteCourseApi, getDepartmentsApi } from '../../services/api';
import Modal from '../../components/common/Modal';

const initialCourses = [
  { _id: '1', code: 'BTECH-CS', name: 'B.Tech Computer Science & Engineering', department: 'Computer Science', durationYears: 4, totalSemesters: 8, description: '4-Year Undergraduate Program in Computer Science' },
  { _id: '2', code: 'BS-AI', name: 'B.S. Artificial Intelligence & ML', department: 'Computer Science', durationYears: 4, totalSemesters: 8, description: 'Specialized program in AI and Data Intelligence' },
  { _id: '3', code: 'BTECH-EE', name: 'B.Tech Electrical & Electronics Eng.', department: 'Electrical Eng.', durationYears: 4, totalSemesters: 8, description: 'Core Electrical Engineering degree' },
  { _id: '4', code: 'BTECH-ME', name: 'B.Tech Mechanical Engineering', department: 'Mechanical Eng.', durationYears: 4, totalSemesters: 8, description: 'Mechanical and Systems engineering curriculum' }
];

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCourse, setNewCourse] = useState({
    code: '',
    name: '',
    department: 'Computer Science',
    durationYears: 4,
    totalSemesters: 8,
    description: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cRes, dRes] = await Promise.all([getCoursesApi(), getDepartmentsApi()]);
      if (cRes?.success && Array.isArray(cRes.data) && cRes.data.length > 0) {
        setCourses(cRes.data);
      } else {
        setCourses(initialCourses);
      }

      if (dRes?.success && Array.isArray(dRes.data)) {
        setDepartments(dRes.data);
        if (dRes.data.length > 0) {
          setNewCourse(prev => ({ ...prev, department: dRes.data[0].name }));
        }
      }
    } catch (err) {
      console.warn('API error, using initial course fallbacks', err);
      setCourses(initialCourses);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const res = await createCourseApi(newCourse);
      if (res?.success) {
        setCourses([res.data, ...courses]);
        setSubmitted(true);
        setTimeout(() => {
          setSubmitted(false);
          setIsModalOpen(false);
          setNewCourse({
            code: '',
            name: '',
            department: departments[0]?.name || 'Computer Science',
            durationYears: 4,
            totalSemesters: 8,
            description: ''
          });
        }, 1200);
      }
    } catch (err) {
      // Local fallback creation
      const created = {
        _id: `CRS-${Date.now()}`,
        ...newCourse,
        code: newCourse.code.toUpperCase()
      };
      setCourses([created, ...courses]);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setIsModalOpen(false);
        setNewCourse({
          code: '',
          name: '',
          department: departments[0]?.name || 'Computer Science',
          durationYears: 4,
          totalSemesters: 8,
          description: ''
        });
      }, 1200);
    }
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course program?')) return;
    try {
      await deleteCourseApi(id);
    } catch (err) {
      // Ignore API error
    }
    setCourses(courses.filter(c => (c._id || c.id) !== id));
  };

  const filteredCourses = courses.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase());
    const matchesDept = deptFilter ? c.department === deptFilter : true;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FiBookOpen className="w-5 h-5 text-indigo-400" />
            Degree & Academic Courses Management
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Manage degree programs, curriculums, and department affiliations</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
            <input 
              type="text"
              placeholder="Search course code or title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-8 text-xs py-1.5 bg-slate-900 w-56"
            />
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary px-4 py-2 text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5"
          >
            <FiPlus className="w-4 h-4" />
            <span>Create Course</span>
          </button>
        </div>
      </div>

      {/* Courses List Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs">Loading course records...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCourses.map((c) => {
            const courseId = c._id || c.id;
            return (
              <div key={courseId} className="glass-panel p-6 border-slate-800 hover:border-indigo-500/40 transition-all duration-300 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded border border-indigo-500/20">
                    {c.code}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {c.durationYears} Years ({c.totalSemesters} Semesters)
                    </span>
                    <button 
                      onClick={() => handleDeleteCourse(courseId)}
                      title="Remove Course"
                      className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white">{c.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                    <FiGrid className="w-3.5 h-3.5 text-cyan-400" />
                    Department: <span className="text-slate-200 font-medium">{c.department}</span>
                  </p>
                  {c.description && (
                    <p className="text-xs text-slate-400 mt-2 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
                      {c.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Course Modal */}
      <Modal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Degree Course Program"
      >
        {submitted ? (
          <div className="py-6 text-center space-y-2">
            <FiCheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
            <h4 className="text-base font-bold text-white">Course Created Successfully!</h4>
          </div>
        ) : (
          <form onSubmit={handleCreateCourse} className="space-y-4">
            {errorMsg && (
              <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-xl">
                {errorMsg}
              </div>
            )}
            
            <div className="input-group mb-0">
              <label className="input-label">Course Title</label>
              <input 
                type="text" 
                required
                placeholder="e.g. B.Tech Computer Science & Engineering"
                value={newCourse.name}
                onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                className="input-field text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="input-group mb-0">
                <label className="input-label">Course Code</label>
                <input 
                  type="text" 
                  required
                  placeholder="BTECH-CS"
                  value={newCourse.code}
                  onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value })}
                  className="input-field text-xs uppercase"
                />
              </div>

              <div className="input-group mb-0">
                <label className="input-label">Department</label>
                <select 
                  value={newCourse.department}
                  onChange={(e) => setNewCourse({ ...newCourse, department: e.target.value })}
                  className="input-field text-xs bg-slate-900"
                >
                  {departments.length > 0 ? (
                    departments.map(d => (
                      <option key={d._id || d.id} value={d.name}>{d.name}</option>
                    ))
                  ) : (
                    <>
                      <option value="Computer Science">Computer Science</option>
                      <option value="Electrical Eng.">Electrical Eng.</option>
                      <option value="Mechanical Eng.">Mechanical Eng.</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="input-group mb-0">
                <label className="input-label">Duration (Years)</label>
                <input 
                  type="number" 
                  min="1"
                  max="6"
                  required
                  value={newCourse.durationYears}
                  onChange={(e) => setNewCourse({ ...newCourse, durationYears: Number(e.target.value) })}
                  className="input-field text-xs"
                />
              </div>

              <div className="input-group mb-0">
                <label className="input-label">Total Semesters</label>
                <input 
                  type="number" 
                  min="1"
                  max="12"
                  required
                  value={newCourse.totalSemesters}
                  onChange={(e) => setNewCourse({ ...newCourse, totalSemesters: Number(e.target.value) })}
                  className="input-field text-xs"
                />
              </div>
            </div>

            <div className="input-group mb-0">
              <label className="input-label">Course Description</label>
              <textarea 
                rows="2"
                placeholder="Overview of curriculum and degree objectives..."
                value={newCourse.description}
                onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                className="input-field text-xs"
              />
            </div>

            <button type="submit" className="btn btn-primary w-full py-2.5 text-xs font-semibold">
              Register Course Program
            </button>
          </form>
        )}
      </Modal>

    </div>
  );
}
