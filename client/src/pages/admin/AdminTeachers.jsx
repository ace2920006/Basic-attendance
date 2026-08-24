import React, { useEffect, useState } from 'react';
import { FiUserCheck, FiPlus, FiSearch, FiMail, FiCheckCircle, FiTrash2, FiBook } from 'react-icons/fi';
import { getUsersApi, createUserApi, assignSubjectsToUserApi, deleteUserApi, getSubjectsApi, getDepartmentsApi } from '../../services/api';
import { mockTeachersList } from '../../data/mockData';
import Modal from '../../components/common/Modal';

export default function AdminTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Add Teacher Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTeacher, setNewTeacher] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    department: 'Computer Science', 
    designation: 'Assistant Professor' 
  });
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Assign Subjects Modal State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState([]);
  const [assignSubmitted, setAssignSubmitted] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tRes, sRes, dRes] = await Promise.all([
        getUsersApi({ role: 'teacher' }),
        getSubjectsApi(),
        getDepartmentsApi()
      ]);

      if (tRes?.success && Array.isArray(tRes.data) && tRes.data.length > 0) {
        setTeachers(tRes.data);
      } else {
        setTeachers(mockTeachersList);
      }

      if (sRes?.success && Array.isArray(sRes.data)) {
        setSubjects(sRes.data);
      }

      if (dRes?.success && Array.isArray(dRes.data)) {
        setDepartments(dRes.data);
      }
    } catch (err) {
      console.warn('API error, using initial mock teachers', err);
      setTeachers(mockTeachersList);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const res = await createUserApi({
        ...newTeacher,
        role: 'teacher',
        password: newTeacher.password || 'teacher123'
      });
      if (res?.success) {
        setTeachers([res.data, ...teachers]);
        setSubmitted(true);
        setTimeout(() => {
          setSubmitted(false);
          setIsModalOpen(false);
          setNewTeacher({ name: '', email: '', password: '', department: 'Computer Science', designation: 'Assistant Professor' });
        }, 1200);
      }
    } catch (err) {
      const fallback = {
        _id: `TCH-${Date.now()}`,
        name: newTeacher.name,
        email: newTeacher.email,
        department: newTeacher.department,
        designation: newTeacher.designation,
        assignedSubjects: []
      };
      setTeachers([fallback, ...teachers]);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setIsModalOpen(false);
        setNewTeacher({ name: '', email: '', password: '', department: 'Computer Science', designation: 'Assistant Professor' });
      }, 1200);
    }
  };

  const openAssignSubjectsModal = (tch) => {
    setSelectedTeacher(tch);
    const existing = (tch.assignedSubjects || []).map(s => typeof s === 'object' ? s._id || s.id : s);
    setSelectedSubjectIds(existing);
    setIsAssignModalOpen(true);
  };

  const toggleSubjectSelection = (subId) => {
    if (selectedSubjectIds.includes(subId)) {
      setSelectedSubjectIds(selectedSubjectIds.filter(id => id !== subId));
    } else {
      setSelectedSubjectIds([...selectedSubjectIds, subId]);
    }
  };

  const handleAssignSubjects = async (e) => {
    e.preventDefault();
    if (!selectedTeacher) return;
    const tchId = selectedTeacher._id || selectedTeacher.id;

    try {
      const res = await assignSubjectsToUserApi(tchId, selectedSubjectIds);
      if (res?.success) {
        fetchData();
      }
    } catch (err) {
      setTeachers(teachers.map(t => {
        if ((t._id || t.id) === tchId) {
          const matchedSubs = subjects.filter(s => selectedSubjectIds.includes(s._id || s.id));
          return { ...t, assignedSubjects: matchedSubs };
        }
        return t;
      }));
    } finally {
      setAssignSubmitted(true);
      setTimeout(() => {
        setAssignSubmitted(false);
        setIsAssignModalOpen(false);
        setSelectedTeacher(null);
      }, 1200);
    }
  };

  const handleDeleteTeacher = async (id) => {
    if (!window.confirm('Are you sure you want to remove this faculty member profile?')) return;
    try {
      await deleteUserApi(id);
    } catch (err) {}
    setTeachers(teachers.filter(t => (t._id || t.id) !== id));
  };

  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    (t.department && t.department.toLowerCase().includes(search.toLowerCase())) ||
    (t.email && t.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      
      <div className="glass-panel p-6 border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FiUserCheck className="w-5 h-5 text-cyan-400" />
            Faculty & Teacher Directory
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Manage faculty profiles and assigned subject courses</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
            <input 
              type="text"
              placeholder="Search faculty name/dept..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-8 text-xs py-1.5 bg-slate-900 w-52"
            />
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary px-4 py-2 text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5"
          >
            <FiPlus className="w-4 h-4" />
            <span>Add Teacher</span>
          </button>
        </div>
      </div>

      {/* Teachers Table */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs">Loading faculty list...</div>
      ) : (
        <div className="overflow-x-auto glass-panel p-6 border-slate-800">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Instructor Name</th>
                <th className="py-3 px-4">Department & Role</th>
                <th className="py-3 px-4">Assigned Subjects</th>
                <th className="py-3 px-4">Contact Email</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredTeachers.map((tch) => {
                const tchId = tch._id || tch.id;
                const assignedSubsList = Array.isArray(tch.assignedSubjects) ? tch.assignedSubjects : (tch.subjects || []);

                return (
                  <tr key={tchId} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {tch.name}
                      <span className="block text-[10px] text-slate-500 font-mono">{tchId}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {tch.designation || 'Faculty Instructor'}
                      <span className="block text-[10px] text-indigo-400">{tch.department}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 items-center">
                        {assignedSubsList.length > 0 ? (
                          assignedSubsList.map((sub, i) => {
                            const subName = typeof sub === 'object' ? `${sub.code || ''} ${sub.name}` : sub;
                            return (
                              <span key={i} className="px-2 py-0.5 bg-slate-800 text-cyan-300 rounded text-[10px] font-semibold border border-cyan-500/20">
                                {subName}
                              </span>
                            );
                          })
                        ) : (
                          <span className="text-[10px] text-slate-500 italic">No Subjects Assigned</span>
                        )}
                        <button 
                          onClick={() => openAssignSubjectsModal(tch)}
                          className="ml-1 text-[10px] text-indigo-400 hover:text-indigo-300 underline font-medium"
                        >
                          + Manage
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-mono text-[11px]">
                      {tch.email}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button 
                        onClick={() => handleDeleteTeacher(tchId)}
                        title="Remove Teacher"
                        className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Teacher Modal */}
      <Modal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Faculty Member"
      >
        {submitted ? (
          <div className="py-6 text-center space-y-2">
            <FiCheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
            <h4 className="text-base font-bold text-white">Teacher Profile Created!</h4>
          </div>
        ) : (
          <form onSubmit={handleAddTeacher} className="space-y-4">
            <div className="input-group mb-0">
              <label className="input-label">Full Name & Title</label>
              <input 
                type="text" 
                required
                placeholder="Dr. Eleanor Vance"
                value={newTeacher.name}
                onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
                className="input-field text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="input-group mb-0">
                <label className="input-label">University Email</label>
                <input 
                  type="email" 
                  required
                  placeholder="eleanor@university.edu"
                  value={newTeacher.email}
                  onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })}
                  className="input-field text-xs"
                />
              </div>

              <div className="input-group mb-0">
                <label className="input-label">Account Password</label>
                <input 
                  type="password" 
                  placeholder="Default: teacher123"
                  value={newTeacher.password}
                  onChange={(e) => setNewTeacher({ ...newTeacher, password: e.target.value })}
                  className="input-field text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="input-group mb-0">
                <label className="input-label">Department</label>
                <select 
                  value={newTeacher.department}
                  onChange={(e) => setNewTeacher({ ...newTeacher, department: e.target.value })}
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

              <div className="input-group mb-0">
                <label className="input-label">Designation</label>
                <select 
                  value={newTeacher.designation}
                  onChange={(e) => setNewTeacher({ ...newTeacher, designation: e.target.value })}
                  className="input-field text-xs bg-slate-900"
                >
                  <option value="Assistant Professor">Assistant Professor</option>
                  <option value="Associate Professor">Associate Professor</option>
                  <option value="Professor">Professor</option>
                  <option value="Lecturer">Lecturer</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full py-2.5 text-xs font-semibold">
              Register Teacher Profile
            </button>
          </form>
        )}
      </Modal>

      {/* Assign Subjects Modal */}
      <Modal 
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title={`Assign Subjects to ${selectedTeacher?.name || 'Teacher'}`}
      >
        {assignSubmitted ? (
          <div className="py-6 text-center space-y-2">
            <FiCheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
            <h4 className="text-base font-bold text-white">Assigned Subjects Updated!</h4>
          </div>
        ) : (
          <form onSubmit={handleAssignSubjects} className="space-y-4">
            <p className="text-xs text-slate-300">
              Select the subjects taught by <strong className="text-indigo-400">{selectedTeacher?.name}</strong>:
            </p>

            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {subjects.length > 0 ? (
                subjects.map(s => {
                  const sId = s._id || s.id;
                  const isChecked = selectedSubjectIds.includes(sId);
                  return (
                    <label 
                      key={sId}
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                        isChecked 
                          ? 'bg-indigo-600/15 border-indigo-500/50 text-white' 
                          : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input 
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSubjectSelection(sId)}
                          className="rounded text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-700"
                        />
                        <div>
                          <span className="font-bold text-white block">{s.code} - {s.name}</span>
                          <span className="text-[10px] text-slate-400">{s.department}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-indigo-300">
                        {s.color || '#6366f1'}
                      </span>
                    </label>
                  );
                })
              ) : (
                <div className="text-xs text-slate-400 text-center py-4">No subjects available to assign</div>
              )}
            </div>

            <button type="submit" className="btn btn-primary w-full py-2.5 text-xs font-semibold">
              Save Assigned Subjects
            </button>
          </form>
        )}
      </Modal>

    </div>
  );
}
