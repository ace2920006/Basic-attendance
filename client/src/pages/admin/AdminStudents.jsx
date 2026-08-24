import React, { useEffect, useState } from 'react';
import { FiUsers, FiPlus, FiSearch, FiCheckCircle, FiTrash2, FiBook } from 'react-icons/fi';
import { getUsersApi, createUserApi, assignSubjectsToUserApi, deleteUserApi, getSubjectsApi, getDepartmentsApi } from '../../services/api';
import { mockStudentsList } from '../../data/mockData';
import Modal from '../../components/common/Modal';

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Add Student Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({ 
    name: '', 
    rollNo: '', 
    email: '', 
    password: '', 
    department: 'Computer Science',
    semester: 'Sem 1'
  });
  const [submitted, setSubmitted] = useState(false);

  // Assign Subjects Modal State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState([]);
  const [assignSubmitted, setAssignSubmitted] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [stRes, subRes, dRes] = await Promise.all([
        getUsersApi({ role: 'student' }),
        getSubjectsApi(),
        getDepartmentsApi()
      ]);

      if (stRes?.success && Array.isArray(stRes.data) && stRes.data.length > 0) {
        setStudents(stRes.data);
      } else {
        setStudents(mockStudentsList);
      }

      if (subRes?.success && Array.isArray(subRes.data)) {
        setSubjects(subRes.data);
      }

      if (dRes?.success && Array.isArray(dRes.data)) {
        setDepartments(dRes.data);
      }
    } catch (err) {
      console.warn('API error, using initial mock students', err);
      setStudents(mockStudentsList);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      const res = await createUserApi({
        ...newStudent,
        role: 'student',
        password: newStudent.password || 'student123'
      });
      if (res?.success) {
        setStudents([res.data, ...students]);
      } else {
        throw new Error('API creation failed');
      }
    } catch (err) {
      const fallback = {
        _id: `STU-${Date.now()}`,
        rollNo: newStudent.rollNo,
        name: newStudent.name,
        email: newStudent.email,
        department: newStudent.department,
        semester: newStudent.semester || 'Sem 1',
        attendanceRate: 100.0,
        status: 'Active',
        assignedSubjects: []
      };
      setStudents([fallback, ...students]);
    } finally {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setIsModalOpen(false);
        setNewStudent({ name: '', rollNo: '', email: '', password: '', department: 'Computer Science', semester: 'Sem 1' });
      }, 1200);
    }
  };

  const openAssignSubjectsModal = (stu) => {
    setSelectedStudent(stu);
    const existing = (stu.assignedSubjects || []).map(s => typeof s === 'object' ? s._id || s.id : s);
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
    if (!selectedStudent) return;
    const stuId = selectedStudent._id || selectedStudent.id;

    try {
      const res = await assignSubjectsToUserApi(stuId, selectedSubjectIds);
      if (res?.success) {
        fetchData();
      }
    } catch (err) {
      setStudents(students.map(s => {
        if ((s._id || s.id) === stuId) {
          const matchedSubs = subjects.filter(sub => selectedSubjectIds.includes(sub._id || sub.id));
          return { ...s, assignedSubjects: matchedSubs };
        }
        return s;
      }));
    } finally {
      setAssignSubmitted(true);
      setTimeout(() => {
        setAssignSubmitted(false);
        setIsAssignModalOpen(false);
        setSelectedStudent(null);
      }, 1200);
    }
  };

  const handleDeleteStudent = async (id) => {
    if (!window.confirm('Are you sure you want to remove this student entry?')) return;
    try {
      await deleteUserApi(id);
    } catch (err) {}
    setStudents(students.filter(s => (s._id || s.id) !== id));
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.rollNo && s.rollNo.toLowerCase().includes(search.toLowerCase())) ||
    (s.email && s.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      
      <div className="glass-panel p-6 border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FiUsers className="w-5 h-5 text-indigo-400" />
            Master Student Directory
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Enrolled student roster, subject assignments, and status tracking</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
            <input 
              type="text"
              placeholder="Search roll no or name..."
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
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs">Loading student roster...</div>
      ) : (
        <div className="overflow-x-auto glass-panel p-6 border-slate-800">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Roll Number</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Department & Term</th>
                <th className="py-3 px-4">Enrolled Subjects</th>
                <th className="py-3 px-4">Email Address</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredStudents.map((stu) => {
                const stuId = stu._id || stu.id;
                const assignedSubs = Array.isArray(stu.assignedSubjects) ? stu.assignedSubjects : [];

                return (
                  <tr key={stuId} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-300">{stu.rollNo || 'N/A'}</td>
                    <td className="py-3.5 px-4 font-semibold text-white">{stu.name}</td>
                    <td className="py-3.5 px-4 text-slate-400">{stu.department} ({stu.semester || 'Sem 1'})</td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 items-center">
                        {assignedSubs.length > 0 ? (
                          assignedSubs.map((sub, idx) => {
                            const subLabel = typeof sub === 'object' ? `${sub.code || ''}` : sub;
                            return (
                              <span key={idx} className="px-2 py-0.5 bg-slate-800 text-indigo-300 rounded text-[10px] font-semibold border border-indigo-500/20">
                                {subLabel}
                              </span>
                            );
                          })
                        ) : (
                          <span className="text-[10px] text-slate-500 italic">None</span>
                        )}
                        <button 
                          onClick={() => openAssignSubjectsModal(stu)}
                          className="ml-1 text-[10px] text-indigo-400 hover:text-indigo-300 underline font-medium"
                        >
                          + Assign
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-mono text-[11px]">{stu.email}</td>
                    <td className="py-3.5 px-4">
                      <span className={`badge ${stu.status === 'Active' || !stu.status ? 'badge-present' : 'badge-absent'} text-[10px]`}>
                        {stu.status || 'Active'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button 
                        onClick={() => handleDeleteStudent(stuId)}
                        title="Delete Student"
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

      {/* Add Student Modal */}
      <Modal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Student Profile"
      >
        {submitted ? (
          <div className="py-6 text-center space-y-2">
            <FiCheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
            <h4 className="text-base font-bold text-white">Student Registered Successfully!</h4>
          </div>
        ) : (
          <form onSubmit={handleAddStudent} className="space-y-4">
            <div className="input-group mb-0">
              <label className="input-label">Student Full Name</label>
              <input 
                type="text" 
                required
                placeholder="Carlos Gomez"
                value={newStudent.name}
                onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                className="input-field text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="input-group mb-0">
                <label className="input-label">Roll Number</label>
                <input 
                  type="text" 
                  required
                  placeholder="CS-2024-099"
                  value={newStudent.rollNo}
                  onChange={(e) => setNewStudent({ ...newStudent, rollNo: e.target.value })}
                  className="input-field text-xs uppercase"
                />
              </div>

              <div className="input-group mb-0">
                <label className="input-label">Department</label>
                <select 
                  value={newStudent.department}
                  onChange={(e) => setNewStudent({ ...newStudent, department: e.target.value })}
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
                <label className="input-label">University Email</label>
                <input 
                  type="email" 
                  required
                  placeholder="carlos@univ.edu"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                  className="input-field text-xs"
                />
              </div>

              <div className="input-group mb-0">
                <label className="input-label">Semester / Term</label>
                <input 
                  type="text" 
                  placeholder="Sem 1"
                  value={newStudent.semester}
                  onChange={(e) => setNewStudent({ ...newStudent, semester: e.target.value })}
                  className="input-field text-xs"
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full py-2.5 text-xs font-semibold">
              Create Student Entry
            </button>
          </form>
        )}
      </Modal>

      {/* Assign Subjects Modal */}
      <Modal 
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title={`Assign Enrolled Subjects to ${selectedStudent?.name || 'Student'}`}
      >
        {assignSubmitted ? (
          <div className="py-6 text-center space-y-2">
            <FiCheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
            <h4 className="text-base font-bold text-white">Student Subjects Enrolled!</h4>
          </div>
        ) : (
          <form onSubmit={handleAssignSubjects} className="space-y-4">
            <p className="text-xs text-slate-300">
              Select the subjects <strong className="text-indigo-400">{selectedStudent?.name} ({selectedStudent?.rollNo})</strong> is taking this semester:
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
                        {s.instructor ? `By ${s.instructor}` : 'Unassigned'}
                      </span>
                    </label>
                  );
                })
              ) : (
                <div className="text-xs text-slate-400 text-center py-4">No subjects available</div>
              )}
            </div>

            <button type="submit" className="btn btn-primary w-full py-2.5 text-xs font-semibold">
              Save Student Subject Enrollment
            </button>
          </form>
        )}
      </Modal>

    </div>
  );
}
