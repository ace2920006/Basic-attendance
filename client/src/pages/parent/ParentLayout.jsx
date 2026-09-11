import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { FiUsers, FiLock, FiPlus, FiCheck, FiShield, FiAlertTriangle } from 'react-icons/fi';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import { currentUser } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { getParentWardsApi, linkParentWardApi } from '../../services/api';

export default function ParentLayout() {
  const { user: authUser } = useAuth();
  const user = authUser || currentUser.parent;

  const [wards, setWards] = useState([]);
  const [selectedWardId, setSelectedWardId] = useState(null);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [newRollNo, setNewRollNo] = useState('');
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkMsg, setLinkMsg] = useState('');
  const [linkError, setLinkError] = useState('');

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    getParentWardsApi()
      .then((res) => {
        if (res?.success && res.data && res.data.length > 0) {
          setWards(res.data);
          setSelectedWardId(res.data[0]._id);
        } else {
          // Default fallback ward from mock data
          const mockWard = {
            _id: currentUser.student.id,
            name: currentUser.student.name,
            rollNo: currentUser.student.rollNo,
            department: currentUser.student.department,
            semester: currentUser.student.semester,
            avatar: currentUser.student.avatar
          };
          setWards([mockWard]);
          setSelectedWardId(mockWard._id);
        }
      })
      .catch(() => {
        const mockWard = {
          _id: currentUser.student.id,
          name: currentUser.student.name,
          rollNo: currentUser.student.rollNo,
          department: currentUser.student.department,
          semester: currentUser.student.semester,
          avatar: currentUser.student.avatar
        };
        setWards([mockWard]);
        setSelectedWardId(mockWard._id);
      });
  }, []);

  const activeWard = wards.find((w) => w._id === selectedWardId) || wards[0] || null;

  const handleLinkWard = async (e) => {
    e.preventDefault();
    if (!newRollNo.trim()) return;
    setLinkLoading(true);
    setLinkError('');
    setLinkMsg('');

    try {
      const res = await linkParentWardApi({ rollNo: newRollNo.trim() });
      if (res?.success && res.data) {
        setLinkMsg(res.message || 'Ward successfully linked!');
        setWards((prev) => [...prev, res.data]);
        setSelectedWardId(res.data._id);
        setTimeout(() => {
          setIsLinkModalOpen(false);
          setNewRollNo('');
          setLinkMsg('');
        }, 1500);
      }
    } catch (err) {
      setLinkError(err.message || 'Failed to link ward. Please verify the roll number.');
    } finally {
      setLinkLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Sidebar 
        role="parent" 
        user={user} 
        isOpenMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header 
          title="Parent / Guardian Portal" 
          subtitle="Real-time academic monitoring, subject attendance & warning advisories" 
          user={user} 
          onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)}
        />

        {/* Top Ward Selection & Read-Only Notice Bar */}
        <div className="bg-gradient-to-r from-slate-900/95 via-rose-950/20 to-slate-900/95 border-b border-slate-800 px-6 py-3">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
            
            {/* Ward Selector Pill */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 px-3 py-1.5 rounded-xl shadow-inner">
                <FiUsers className="w-4 h-4 text-rose-400" />
                <span className="text-xs font-semibold text-slate-300">Active Ward:</span>
                {wards.length > 1 ? (
                  <select
                    value={selectedWardId || ''}
                    onChange={(e) => setSelectedWardId(e.target.value)}
                    className="bg-slate-950 text-white text-xs font-bold rounded-lg px-2.5 py-1 border border-slate-700 focus:outline-none focus:border-rose-500 cursor-pointer"
                  >
                    {wards.map((w) => (
                      <option key={w._id} value={w._id}>
                        {w.name} ({w.rollNo || 'Ward'})
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="text-xs font-bold text-white bg-slate-800/80 px-2.5 py-0.5 rounded-lg border border-slate-700">
                    {activeWard?.name || 'Alex Rivera'} &bull; {activeWard?.rollNo || 'CS-2024-089'}
                  </span>
                )}
              </div>

              {/* Link Additional Ward Button */}
              <button
                onClick={() => setIsLinkModalOpen(true)}
                className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1 bg-slate-900 hover:bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-800 transition"
                title="Link another student/child by roll number"
              >
                <FiPlus className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">Link Ward</span>
              </button>
            </div>

            {/* Read-Only Regulatory Disclaimer */}
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 font-medium">
                <FiLock className="w-3 h-3 text-amber-400" />
                <span>Strictly Read-Only Access &bull; Attendance cannot be altered</span>
              </span>
            </div>

          </div>
        </div>

        {/* Main Content View with Ward Context */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          <Outlet context={{ activeWard, wards, selectedWardId, setSelectedWardId }} />
        </main>
      </div>

      {/* Link Student Modal */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md p-6 rounded-2xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2 text-rose-400">
                <FiUsers className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Link Student / Child</h3>
              </div>
              <button
                onClick={() => setIsLinkModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Enter your child's official University Student Roll Number to associate their academic records with your parent portal.
            </p>

            {linkError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <FiAlertTriangle className="w-4 h-4 shrink-0" />
                <span>{linkError}</span>
              </div>
            )}

            {linkMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <FiCheck className="w-4 h-4 shrink-0" />
                <span>{linkMsg}</span>
              </div>
            )}

            <form onSubmit={handleLinkWard} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Student Roll Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. CS-2024-089"
                  value={newRollNo}
                  onChange={(e) => setNewRollNo(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsLinkModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={linkLoading}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 shadow-lg shadow-rose-600/20 disabled:opacity-50"
                >
                  {linkLoading ? 'Linking...' : 'Verify & Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
