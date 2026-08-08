import React, { useState } from 'react';
import { FiGrid, FiPlus, FiUsers, FiUserCheck, FiCheckCircle } from 'react-icons/fi';
import { mockDepartments } from '../../data/mockData';
import Modal from '../../components/common/Modal';

export default function AdminDepartments() {
  const [departments, setDepartments] = useState(mockDepartments);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDep, setNewDep] = useState({ name: '', code: '', head: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleAddDepartment = (e) => {
    e.preventDefault();
    const created = {
      id: `DEP-${newDep.code.toUpperCase()}`,
      name: newDep.name,
      code: newDep.code.toUpperCase(),
      head: newDep.head,
      totalStudents: 150,
      totalTeachers: 8,
      avgAttendance: 88.0
    };
    setDepartments([...departments, created]);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setIsModalOpen(false);
      setNewDep({ name: '', code: '', head: '' });
    }, 1500);
  };

  return (
    <div className="space-y-6">
      
      <div className="glass-panel p-6 border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FiGrid className="w-5 h-5 text-indigo-400" />
            Academic Departments Management
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Directory of university faculties and attendance performance</p>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary px-4 py-2 text-xs font-semibold shadow-lg shadow-indigo-600/30"
        >
          <FiPlus className="w-4 h-4" />
          <span>Add Department</span>
        </button>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dep) => (
          <div key={dep.id} className="glass-panel p-6 border-slate-800 hover:border-indigo-500/40 transition-all duration-300 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded border border-indigo-500/20">{dep.code}</span>
              <span className="text-xs font-bold text-emerald-400">{dep.avgAttendance}% Avg</span>
            </div>

            <div>
              <h3 className="text-base font-bold text-white">{dep.name}</h3>
              <p className="text-xs text-slate-400 mt-1">Head: <span className="text-slate-200">{dep.head}</span></p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800 text-xs">
              <div className="p-2 bg-slate-950/40 rounded-lg flex items-center gap-2">
                <FiUsers className="w-4 h-4 text-cyan-400" />
                <div>
                  <span className="block font-bold text-white">{dep.totalStudents}</span>
                  <span className="text-[10px] text-slate-400">Students</span>
                </div>
              </div>
              <div className="p-2 bg-slate-950/40 rounded-lg flex items-center gap-2">
                <FiUserCheck className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="block font-bold text-white">{dep.totalTeachers}</span>
                  <span className="text-[10px] text-slate-400">Teachers</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Department Modal */}
      <Modal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Academic Department"
      >
        {submitted ? (
          <div className="py-6 text-center space-y-2">
            <FiCheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
            <h4 className="text-base font-bold text-white">Department Created!</h4>
          </div>
        ) : (
          <form onSubmit={handleAddDepartment} className="space-y-4">
            <div className="input-group mb-0">
              <label className="input-label">Department Name</label>
              <input 
                type="text" 
                required
                placeholder="e.g. Data Science & AI"
                value={newDep.name}
                onChange={(e) => setNewDep({ ...newDep, name: e.target.value })}
                className="input-field text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="input-group mb-0">
                <label className="input-label">Short Code</label>
                <input 
                  type="text" 
                  required
                  placeholder="DSAI"
                  value={newDep.code}
                  onChange={(e) => setNewDep({ ...newDep, code: e.target.value })}
                  className="input-field text-xs uppercase"
                />
              </div>
              <div className="input-group mb-0">
                <label className="input-label">Department Head</label>
                <input 
                  type="text" 
                  required
                  placeholder="Dr. Alan Turing"
                  value={newDep.head}
                  onChange={(e) => setNewDep({ ...newDep, head: e.target.value })}
                  className="input-field text-xs"
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full py-2.5 text-xs font-semibold">
              Create Department Profile
            </button>
          </form>
        )}
      </Modal>

    </div>
  );
}
