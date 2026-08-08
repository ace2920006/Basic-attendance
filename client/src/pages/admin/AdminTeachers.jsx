import React, { useState } from 'react';
import { FiUserCheck, FiPlus, FiSearch, FiMail, FiPhone, FiCheckCircle } from 'react-icons/fi';
import { mockTeachersList } from '../../data/mockData';
import Modal from '../../components/common/Modal';

export default function AdminTeachers() {
  const [teachers, setTeachers] = useState(mockTeachersList);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTeacher, setNewTeacher] = useState({ name: '', email: '', department: 'Computer Science', designation: 'Assistant Professor' });
  const [submitted, setSubmitted] = useState(false);

  const handleAddTeacher = (e) => {
    e.preventDefault();
    const created = {
      id: `TCH-${Date.now()}`,
      name: newTeacher.name,
      department: newTeacher.department,
      designation: newTeacher.designation,
      subjects: ['CS101'],
      email: newTeacher.email,
      phone: '+1 555-0100'
    };
    setTeachers([...teachers, created]);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setIsModalOpen(false);
      setNewTeacher({ name: '', email: '', department: 'Computer Science', designation: 'Assistant Professor' });
    }, 1500);
  };

  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      <div className="glass-panel p-6 border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FiUserCheck className="w-5 h-5 text-cyan-400" />
            Faculty & Teacher Directory
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Manage teaching staff accounts and assigned courses</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
            <input 
              type="text"
              placeholder="Search faculty..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-8 text-xs py-1.5 bg-slate-900 w-52"
            />
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary px-4 py-2 text-xs font-semibold shadow-lg shadow-indigo-600/30"
          >
            <FiPlus className="w-4 h-4" />
            <span>Add Teacher</span>
          </button>
        </div>
      </div>

      {/* Teachers List */}
      <div className="overflow-x-auto glass-panel p-6 border-slate-800">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <th className="py-3 px-4">Faculty ID</th>
              <th className="py-3 px-4">Instructor Name</th>
              <th className="py-3 px-4">Department & Role</th>
              <th className="py-3 px-4">Assigned Subjects</th>
              <th className="py-3 px-4">Contact Info</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredTeachers.map((tch) => (
              <tr key={tch.id} className="hover:bg-slate-900/40 transition-colors">
                <td className="py-3.5 px-4 font-mono font-bold text-indigo-300">{tch.id}</td>
                <td className="py-3.5 px-4 font-semibold text-white">{tch.name}</td>
                <td className="py-3.5 px-4 text-slate-300">{tch.designation} ({tch.department})</td>
                <td className="py-3.5 px-4">
                  <div className="flex flex-wrap gap-1">
                    {tch.subjects.map((sub, i) => (
                      <span key={i} className="px-2 py-0.5 bg-slate-800 text-cyan-300 rounded text-[10px] font-semibold">
                        {sub}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-3.5 px-4 text-slate-400">
                  <span className="block text-slate-300">{tch.email}</span>
                  <span className="block text-[10px] text-slate-500">{tch.phone}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Teacher Modal */}
      <Modal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Faculty Member"
      >
        {submitted ? (
          <div className="py-6 text-center space-y-2">
            <FiCheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
            <h4 className="text-base font-bold text-white">Faculty Profile Created!</h4>
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

            <div className="grid grid-cols-2 gap-3">
              <div className="input-group mb-0">
                <label className="input-label">Department</label>
                <select 
                  value={newTeacher.department}
                  onChange={(e) => setNewTeacher({ ...newTeacher, department: e.target.value })}
                  className="input-field text-xs bg-slate-900"
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Electrical Eng.">Electrical Eng.</option>
                  <option value="Mechanical Eng.">Mechanical Eng.</option>
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
                </select>
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full py-2.5 text-xs font-semibold">
              Register Teacher Profile
            </button>
          </form>
        )}
      </Modal>

    </div>
  );
}
