import React, { useState } from 'react';
import { FiAward, FiStar, FiCheckCircle, FiSend, FiSearch, FiFilter } from 'react-icons/fi';

export default function BestAttendance({ students = [], onCommendStudent }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [commendedIds, setCommendedIds] = useState([]);

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.rollNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === 'All' || s.departmentCode === selectedDept || s.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const top3 = filteredStudents.slice(0, 3);
  const remaining = filteredStudents.slice(3);

  const handleCommend = (student) => {
    if (!commendedIds.includes(student.id)) {
      setCommendedIds(prev => [...prev, student.id]);
    }
    if (onCommendStudent) {
      onCommendStudent(student);
    }
  };

  return (
    <div className="glass-panel p-6 border-slate-800 space-y-6">
      
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <FiAward className="w-5 h-5 text-amber-400" />
            Best Attendance Leaderboard &amp; Honor Roll (<span className="text-emerald-400">&ge; 90%</span>)
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Celebrate high-performing students with exemplary attendance records and 100% perfect badges
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search star student..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-950/80 border border-slate-800 text-xs text-white rounded-xl pl-9 pr-3 py-2 w-48 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div className="relative flex items-center">
            <FiFilter className="absolute left-3 text-slate-400 w-3.5 h-3.5" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-slate-950/80 border border-slate-800 text-xs text-white rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:border-amber-500/50"
            >
              <option value="All">All Departments</option>
              <option value="CSE">CSE</option>
              <option value="ECE">ECE</option>
              <option value="ME">ME</option>
              <option value="CE">CE</option>
              <option value="IT">IT</option>
            </select>
          </div>
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      {top3.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          
          {/* Gold #1 */}
          {top3[0] && (
            <div className="relative p-5 bg-gradient-to-b from-amber-500/10 via-slate-900/60 to-slate-950 border border-amber-500/30 rounded-2xl flex flex-col items-center text-center shadow-lg shadow-amber-500/5">
              <div className="absolute -top-3 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-extrabold text-xs px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                <FiStar className="w-3.5 h-3.5 fill-slate-950" /> Rank #1 • Gold Medal
              </div>
              <div className="mt-3 w-14 h-14 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-400 font-extrabold text-xl mb-3">
                🥇
              </div>
              <div className="font-bold text-white text-base">{top3[0].name}</div>
              <div className="text-xs text-slate-400 font-mono mt-0.5">{top3[0].rollNo}</div>
              <span className="mt-2 text-[11px] font-semibold text-amber-300 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                {top3[0].departmentCode || top3[0].department}
              </span>
              <div className="mt-4 font-extrabold text-2xl text-emerald-400 font-mono">
                {top3[0].attendanceRate}%
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {top3[0].presentCount} / {top3[0].totalClasses} Sessions Attended
              </div>

              <button
                onClick={() => handleCommend(top3[0])}
                disabled={commendedIds.includes(top3[0].id)}
                className={`mt-4 btn text-xs px-4 py-1.5 rounded-xl w-full flex items-center justify-center gap-1.5 transition-all ${
                  commendedIds.includes(top3[0].id)
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-default'
                    : 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold hover:brightness-110'
                }`}
              >
                {commendedIds.includes(top3[0].id) ? (
                  <>
                    <FiCheckCircle className="w-4 h-4" /> Commended
                  </>
                ) : (
                  <>
                    <FiSend className="w-3.5 h-3.5" /> Send Honor Certificate
                  </>
                )}
              </button>
            </div>
          )}

          {/* Silver #2 */}
          {top3[1] && (
            <div className="relative p-5 bg-gradient-to-b from-slate-400/10 via-slate-900/60 to-slate-950 border border-slate-700/60 rounded-2xl flex flex-col items-center text-center">
              <div className="absolute -top-3 bg-gradient-to-r from-slate-300 to-slate-400 text-slate-950 font-extrabold text-xs px-3 py-1 rounded-full flex items-center gap-1">
                Rank #2 • Silver Medal
              </div>
              <div className="mt-3 w-14 h-14 rounded-full bg-slate-400/20 border-2 border-slate-300 flex items-center justify-center text-slate-300 font-extrabold text-xl mb-3">
                🥈
              </div>
              <div className="font-bold text-white text-base">{top3[1].name}</div>
              <div className="text-xs text-slate-400 font-mono mt-0.5">{top3[1].rollNo}</div>
              <span className="mt-2 text-[11px] font-semibold text-slate-300 bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-700">
                {top3[1].departmentCode || top3[1].department}
              </span>
              <div className="mt-4 font-extrabold text-2xl text-emerald-400 font-mono">
                {top3[1].attendanceRate}%
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {top3[1].presentCount} / {top3[1].totalClasses} Sessions Attended
              </div>

              <button
                onClick={() => handleCommend(top3[1])}
                disabled={commendedIds.includes(top3[1].id)}
                className={`mt-4 btn text-xs px-4 py-1.5 rounded-xl w-full flex items-center justify-center gap-1.5 transition-all ${
                  commendedIds.includes(top3[1].id)
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-default'
                    : 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-700'
                }`}
              >
                {commendedIds.includes(top3[1].id) ? (
                  <>
                    <FiCheckCircle className="w-4 h-4 text-emerald-400" /> Commended
                  </>
                ) : (
                  <>
                    <FiSend className="w-3.5 h-3.5 text-cyan-400" /> Send Commendation
                  </>
                )}
              </button>
            </div>
          )}

          {/* Bronze #3 */}
          {top3[2] && (
            <div className="relative p-5 bg-gradient-to-b from-amber-700/10 via-slate-900/60 to-slate-950 border border-amber-800/40 rounded-2xl flex flex-col items-center text-center">
              <div className="absolute -top-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-extrabold text-xs px-3 py-1 rounded-full flex items-center gap-1">
                Rank #3 • Bronze Medal
              </div>
              <div className="mt-3 w-14 h-14 rounded-full bg-amber-700/20 border-2 border-amber-600 flex items-center justify-center text-amber-500 font-extrabold text-xl mb-3">
                🥉
              </div>
              <div className="font-bold text-white text-base">{top3[2].name}</div>
              <div className="text-xs text-slate-400 font-mono mt-0.5">{top3[2].rollNo}</div>
              <span className="mt-2 text-[11px] font-semibold text-amber-400/90 bg-amber-900/30 px-2.5 py-0.5 rounded-full border border-amber-800/50">
                {top3[2].departmentCode || top3[2].department}
              </span>
              <div className="mt-4 font-extrabold text-2xl text-emerald-400 font-mono">
                {top3[2].attendanceRate}%
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {top3[2].presentCount} / {top3[2].totalClasses} Sessions Attended
              </div>

              <button
                onClick={() => handleCommend(top3[2])}
                disabled={commendedIds.includes(top3[2].id)}
                className={`mt-4 btn text-xs px-4 py-1.5 rounded-xl w-full flex items-center justify-center gap-1.5 transition-all ${
                  commendedIds.includes(top3[2].id)
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-default'
                    : 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-700'
                }`}
              >
                {commendedIds.includes(top3[2].id) ? (
                  <>
                    <FiCheckCircle className="w-4 h-4 text-emerald-400" /> Commended
                  </>
                ) : (
                  <>
                    <FiSend className="w-3.5 h-3.5 text-cyan-400" /> Send Commendation
                  </>
                )}
              </button>
            </div>
          )}

        </div>
      )}

      {/* Leaderboard Table (Remaining Ranks) */}
      <div className="overflow-x-auto pt-2">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <th className="py-3 px-4 text-center">Rank</th>
              <th className="py-3 px-4">Student Details</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4 text-center">Sessions Attended</th>
              <th className="py-3 px-4 text-center">Attendance Rate</th>
              <th className="py-3 px-4 text-center">Honor Tag</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {filteredStudents.length > 0 ? (
              filteredStudents.map((st, idx) => {
                const isCommended = commendedIds.includes(st.id);
                return (
                  <tr key={st.id} className="hover:bg-slate-800/40 transition-colors">
                    
                    {/* Rank */}
                    <td className="py-3 px-4 text-center">
                      <span className="font-extrabold text-sm font-mono text-amber-400">
                        #{st.rank || idx + 1}
                      </span>
                    </td>

                    {/* Student Details */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white flex items-center gap-2">
                        {st.name}
                        {st.isPerfect && (
                          <span className="text-[10px] font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 px-2 py-0.5 rounded-full shadow">
                            100% Perfect
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">{st.rollNo}</div>
                    </td>

                    {/* Department */}
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-300">
                        {st.departmentCode || st.department}
                      </span>
                    </td>

                    {/* Sessions */}
                    <td className="py-3 px-4 text-center font-mono">
                      <span className="text-emerald-400 font-bold">{st.presentCount}</span> / {st.totalClasses}
                    </td>

                    {/* Attendance % */}
                    <td className="py-3 px-4 text-center font-mono text-sm font-bold text-emerald-400">
                      {st.attendanceRate}%
                    </td>

                    {/* Honor Tag */}
                    <td className="py-3 px-4 text-center">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        {st.awardTag || st.badge || 'Star Student'}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleCommend(st)}
                        disabled={isCommended}
                        className={`btn text-[11px] px-3 py-1.5 rounded-lg flex items-center gap-1.5 ml-auto transition-all ${
                          isCommended
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default'
                            : 'btn-secondary hover:border-amber-500/50 hover:text-amber-300'
                        }`}
                      >
                        {isCommended ? (
                          <>
                            <FiCheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Commended</span>
                          </>
                        ) : (
                          <>
                            <FiSend className="w-3.5 h-3.5 text-amber-400" />
                            <span>Commend</span>
                          </>
                        )}
                      </button>
                    </td>

                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="py-8 text-center text-slate-400">
                  No high-attendance students found matching search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
