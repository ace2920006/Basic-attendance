import React, { useState } from 'react';
import { FiUsers, FiPlus, FiSearch, FiCheckCircle } from 'react-icons/fi';
import { mockStudentsList } from '../../data/mockData';
import Modal from '../../components/common/Modal';

export default function AdminStudents() {
  const [students, setStudents] = useState(mockStudentsList);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', rollNo: '', email: '', department: 'Computer Science' });
  const [submitted, setSubmitted] = useState(false);

  const handleAddStudent = (e) => {
    e.preventDefault();
    const created = {
      id: `STU-${Date.now()}`,
      rollNo: newStudent.rollNo,
      name: newStudent.name,
      email: newStudent.email,
      department: newStudent.department,
      semester: 'Sem 1',
      attendanceRate: 100.0,
      status: 'Active'
    };
    setStudents([created, ...students]);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setIsModalOpen(false);
      setNewStudent({ name: '', rollNo: '', email: '', department: 'Computer Science' });
    }, 1500);
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.rollNo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      <div className="glass-panel p-6 border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FiUsers className="w-5 h-5 text-indigo-400" />
            Master Student Directory
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Enrolled student roster, status tracking, and profile creation</p>
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
            className="btn btn-primary px-4 py-2 text-xs font-semibold shadow-lg shadow-indigo-600/30"
          >
            <FiPlus className="w-4 h-4" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto glass-panel p-6 border-slate-800">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <th className="py-3 px-4">Roll Number</th>
              <th className="py-3 px-4">Student Name</th>
              <th className="py-3 px-4">Department & Term</th>
              <th className="py-3 px-4">Email Address</th>
              <th className="py-3 px-4">Overall Score</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredStudents.map((stu) => (
              <tr key={stu.id} className="hover:bg-slate-900/40 transition-colors">
                <td className="py-3.5 px-4 font-mono font-bold text-slate-300">{stu.rollNo}</td>
                <td className="py-3.5 px-4 font-semibold text-white">{stu.name}</td>
                <td className="py-3.5 px-4 text-slate-400">{stu.department} ({stu.semester})</td>
                <td className="py-3.5 px-4 text-slate-300">{stu.email}</td>
                <td className="py-3.5 px-4 font-bold">
                  <span className={stu.attendanceRate >= 75 ? 'text-emerald-400' : 'text-rose-400'}>
                    {stu.attendanceRate}%
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <span className={`badge ${stu.status === 'Active' ? 'badge-present' : 'badge-absent'} text-[10px]`}>
                    {stu.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
                  className="input-field text-xs"
                />
              </div>

              <div className="input-group mb-0">
                <label className="input-label">Department</label>
                <select 
                  value={newStudent.department}
                  onChange={(e) => setNewStudent({ ...newStudent, department: e.target.value })}
                  className="input-field text-xs bg-slate-900"
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Electrical Eng.">Electrical Eng.</option>
                  <option value="Mechanical Eng.">Mechanical Eng.</option>
                </select>
              </div>
            </div>

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

            <button type="submit" className="btn btn-primary w-full py-2.5 text-xs font-semibold">
              Create Student Entry
            </button>
          </form>
        )}
      </Modal>

    </div>
  );
}
