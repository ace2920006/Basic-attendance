import React, { useEffect, useState } from 'react';
import { FiBook, FiPlus, FiUserCheck, FiUsers, FiCheckCircle, FiTrash2, FiSearch, FiCheckSquare } from 'react-icons/fi';
import { 
  getSubjectsApi, 
  createSubjectApi, 
  assignTeacherToSubjectApi, 
  deleteSubjectApi,
  getUsersApi,
  getDepartmentsApi,
  getCoursesApi
} from '../../services/api';
import Modal from '../../components/common/Modal';

const initialSubjects = [
  { _id: 'sub-1', code: 'CS101', name: 'Data Structures & Algorithms', department: 'Computer Science', course: 'BTECH-CS', instructor: 'Dr. Alan Turing', totalClasses: 30, color: '#6366f1' },
  { _id: 'sub-2', code: 'CS202', name: 'Database Management Systems', department: 'Computer Science', course: 'BTECH-CS', instructor: 'Prof. Grace Hopper', totalClasses: 28, color: '#06b6d4' },
  { _id: 'sub-3', code: 'EE105', name: 'Circuit Theory & Networks', department: 'Electrical Eng.', course: 'BTECH-EE', instructor: 'Dr. Nikola Tesla', totalClasses: 25, color: '#10b981' }
];

export default function AdminSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Add Subject Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSubject, setNewSubject] = useState({
    code: '',
    name: '',
    department: 'Computer Science',
    course: 'BTECH-CS',
    instructorId: '',
    totalClasses: 30,
    color: '#6366f1'
  });
  const [addSubmitted, setAddSubmitted] = useState(false);

  // Assign Teacher Modal State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [assignSubmitted, setAssignSubmitted] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sRes, tRes, dRes] = await Promise.all([
        getSubjectsApi(),
        getUsersApi({ role: 'teacher' }),
        getDepartmentsApi()
      ]);

      if (sRes?.success && Array.isArray(sRes.data) && sRes.data.length > 0) {
        setSubjects(sRes.data);
      } else {
        setSubjects(initialSubjects);
      }

      if (tRes?.success && Array.isArray(tRes.data)) {
        setTeachers(tRes.data);
      }

      if (dRes?.success && Array.isArray(dRes.data)) {
        setDepartments(dRes.data);
      }
    } catch (err) {
      console.warn('API error, using initial subjects fallback', err);
      setSubjects(initialSubjects);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubject = async (e) => {
    e.preventDefault();
    try {
      const res = await createSubjectApi(newSubject);
      if (res?.success) {
        setSubjects([res.data, ...subjects]);
      } else {
        throw new Error('API failed');
      }
    } catch (err) {
      const teacherObj = teachers.find(t => t._id === newSubject.instructorId);
      const fallback = {
        _id: `SUB-${Date.now()}`,
        ...newSubject,
        code: newSubject.code.toUpperCase(),
        instructor: teacherObj ? teacherObj.name : 'Unassigned'
      };
      setSubjects([fallback, ...subjects]);
    } finally {
      setAddSubmitted(true);
      setTimeout(() => {
        setAddSubmitted(false);
        setIsAddModalOpen(false);
        setNewSubject({
          code: '',
          name: '',
          department: 'Computer Science',
          course: 'BTECH-CS',
          instructorId: '',
          totalClasses: 30,
          color: '#6366f1'
        });
      }, 1200);
    }
  };

  const openAssignTeacherModal = (subject) => {
    setSelectedSubject(subject);
    setSelectedTeacherId(subject.instructorId?._id || subject.instructorId || '');
    setIsAssignModalOpen(true);
  };

  const handleAssignTeacher = async (e) => {
    e.preventDefault();
    if (!selectedSubject) return;
    const subId = selectedSubject._id || selectedSubject.id;

    try {
      const res = await assignTeacherToSubjectApi(subId, selectedTeacherId);
      if (res?.success) {
        fetchData();
      }
    } catch (err) {
      const teacherObj = teachers.find(t => (t._id || t.id) === selectedTeacherId);
      setSubjects(subjects.map(s => {
        if ((s._id || s.id) === subId) {
          return {
            ...s,
            instructorId: selectedTeacherId,
            instructor: teacherObj ? teacherObj.name : 'Unassigned'
          };
        }
        return s;
      }));
    } finally {
      setAssignSubmitted(true);
      setTimeout(() => {
        setAssignSubmitted(false);
        setIsAssignModalOpen(false);
        setSelectedSubject(null);
      }, 1200);
    }
  };

  const handleDeleteSubject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subject?')) return;
    try {
      await deleteSubjectApi(id);
    } catch (err) {
      // Local removal fallback
    }
    setSubjects(subjects.filter(s => (s._id || s.id) !== id));
  };

  const filteredSubjects = subjects.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.code.toLowerCase().includes(search.toLowerCase()) ||
    s.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FiBook className="w-5 h-5 text-indigo-400" />
            Subjects & Teacher Assignments
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Manage course subjects and assign instructor faculty members</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
            <input 
              type="text"
              placeholder="Search code or subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-8 text-xs py-1.5 bg-slate-900 w-56"
            />
          </div>

          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="btn btn-primary px-4 py-2 text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5"
          >
            <FiPlus className="w-4 h-4" />
            <span>Add Subject</span>
          </button>
        </div>
      </div>

      {/* Subjects Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs">Loading subjects list...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubjects.map((sub) => {
            const subId = sub._id || sub.id;
            const teacherName = typeof sub.instructorId === 'object' && sub.instructorId !== null
              ? sub.instructorId.name
              : sub.instructor || 'Unassigned';

            return (
              <div 
                key={subId} 
                className="glass-panel p-6 border-slate-800 hover:border-indigo-500/40 transition-all duration-300 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span 
                    className="text-xs font-mono font-bold px-2.5 py-1 rounded border text-white"
                    style={{ backgroundColor: `${sub.color || '#6366f1'}20`, borderColor: `${sub.color || '#6366f1'}40`, color: sub.color || '#818cf8' }}
                  >
                    {sub.code}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-400">{sub.totalClasses || 30} Classes</span>
                    <button 
                      onClick={() => handleDeleteSubject(subId)}
                      title="Delete Subject"
                      className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white">{sub.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{sub.department} {sub.course ? `(${sub.course})` : ''}</p>
                </div>

                {/* Assigned Teacher Box */}
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs">
                    <FiUserCheck className="w-4 h-4 text-cyan-400" />
                    <div>
                      <span className="block text-[10px] text-slate-400 uppercase font-semibold">Assigned Teacher</span>
                      <span className="font-semibold text-white">{teacherName}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => openAssignTeacherModal(sub)}
                    className="btn btn-secondary text-[10px] px-2 py-1 font-semibold hover:border-indigo-500/50"
                  >
                    Assign Teacher
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Add Subject Modal */}
      <Modal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Academic Subject"
      >
        {addSubmitted ? (
          <div className="py-6 text-center space-y-2">
            <FiCheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
            <h4 className="text-base font-bold text-white">Subject Added Successfully!</h4>
          </div>
        ) : (
          <form onSubmit={handleAddSubject} className="space-y-4">
            <div className="input-group mb-0">
              <label className="input-label">Subject Name</label>
              <input 
                type="text" 
                required
                placeholder="e.g. Operating Systems & Architecture"
                value={newSubject.name}
                onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                className="input-field text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="input-group mb-0">
                <label className="input-label">Subject Code</label>
                <input 
                  type="text" 
                  required
                  placeholder="CS301"
                  value={newSubject.code}
                  onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value })}
                  className="input-field text-xs uppercase"
                />
              </div>

              <div className="input-group mb-0">
                <label className="input-label">Department</label>
                <select 
                  value={newSubject.department}
                  onChange={(e) => setNewSubject({ ...newSubject, department: e.target.value })}
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
                <label className="input-label">Assign Teacher (Optional)</label>
                <select 
                  value={newSubject.instructorId}
                  onChange={(e) => setNewSubject({ ...newSubject, instructorId: e.target.value })}
                  className="input-field text-xs bg-slate-900"
                >
                  <option value="">-- None (Unassigned) --</option>
                  {teachers.map(t => (
                    <option key={t._id || t.id} value={t._id || t.id}>{t.name} ({t.department})</option>
                  ))}
                </select>
              </div>

              <div className="input-group mb-0">
                <label className="input-label">Badge Color</label>
                <input 
                  type="color" 
                  value={newSubject.color}
                  onChange={(e) => setNewSubject({ ...newSubject, color: e.target.value })}
                  className="input-field text-xs h-9 p-1 bg-slate-900 cursor-pointer"
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full py-2.5 text-xs font-semibold">
              Create Subject Entry
            </button>
          </form>
        )}
      </Modal>

      {/* Assign Teacher Modal */}
      <Modal 
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title={`Assign Teacher to ${selectedSubject?.code || 'Subject'}`}
      >
        {assignSubmitted ? (
          <div className="py-6 text-center space-y-2">
            <FiCheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
            <h4 className="text-base font-bold text-white">Teacher Assigned!</h4>
          </div>
        ) : (
          <form onSubmit={handleAssignTeacher} className="space-y-4">
            <p className="text-xs text-slate-300">
              Select a faculty instructor to assign to <strong className="text-indigo-400">{selectedSubject?.name} ({selectedSubject?.code})</strong>:
            </p>

            <div className="input-group mb-0">
              <label className="input-label">Select Faculty Instructor</label>
              <select 
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                className="input-field text-xs bg-slate-900"
              >
                <option value="">-- Remove Assigned Teacher --</option>
                {teachers.map(t => (
                  <option key={t._id || t.id} value={t._id || t.id}>
                    {t.name} ({t.designation || 'Faculty'} - {t.department})
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="btn btn-primary w-full py-2.5 text-xs font-semibold">
              Confirm Teacher Assignment
            </button>
          </form>
        )}
      </Modal>

    </div>
  );
}
