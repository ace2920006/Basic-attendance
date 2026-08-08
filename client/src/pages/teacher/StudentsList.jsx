import React, { useState } from 'react';
import { FiUsers, FiSearch, FiMail, FiFilter, FiUserCheck } from 'react-icons/fi';
import { mockStudentsList } from '../../data/mockData';
import Modal from '../../components/common/Modal';

export default function StudentsList() {
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  const filteredStudents = mockStudentsList.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.rollNo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      <div className="glass-panel p-6 border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FiUsers className="w-5 h-5 text-indigo-400" />
              Enrolled Course Students Roster
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Search and review individual student attendance performance</p>
          </div>

          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
            <input 
              type="text"
              placeholder="Search by student name or roll no..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-8 text-xs py-1.5 bg-slate-900 w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Roll Number</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Department & Semester</th>
                <th className="py-3 px-4">Attendance Rate</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredStudents.map((stu) => (
                <tr key={stu.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-300">{stu.rollNo}</td>
                  <td className="py-3.5 px-4 font-semibold text-white">{stu.name}</td>
                  <td className="py-3.5 px-4 text-slate-400">{stu.department} ({stu.semester})</td>
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
                  <td className="py-3.5 px-4 text-right">
                    <button 
                      onClick={() => setSelectedStudent(stu)}
                      className="px-2.5 py-1 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-lg text-[11px] font-medium transition-colors"
                    >
                      View Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Profile Modal */}
      <Modal 
        isOpen={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
        title="Student Profile & Attendance Record"
      >
        {selectedStudent && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
              <h4 className="text-lg font-bold text-white">{selectedStudent.name}</h4>
              <p className="text-xs text-slate-400">{selectedStudent.rollNo} • {selectedStudent.email}</p>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  {selectedStudent.department}
                </span>
                <span className="text-xs font-semibold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                  {selectedStudent.semester}
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Current Attendance Rating</span>
                <span className={`text-base font-bold ${selectedStudent.attendanceRate >= 75 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {selectedStudent.attendanceRate}%
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-full rounded-full ${selectedStudent.attendanceRate >= 75 ? 'bg-emerald-400' : 'bg-rose-500'}`}
                  style={{ width: `${selectedStudent.attendanceRate}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400">
                {selectedStudent.attendanceRate >= 75 
                  ? 'Student meets the 75% minimum threshold requirement for end-term examination.' 
                  : 'Warning: Student is currently flagged for low attendance. Advisory warning recommended.'}
              </p>
            </div>

            <button 
              onClick={() => alert(`Warning email sent to ${selectedStudent.email}`)}
              className="btn btn-secondary w-full py-2 text-xs font-semibold"
            >
              <FiMail className="w-4 h-4 text-indigo-400" />
              <span>Send Attendance Advisory Email</span>
            </button>
          </div>
        )}
      </Modal>

    </div>
  );
}
