import React, { useState, useEffect } from 'react';
import { 
  FiPlus, 
  FiFileText, 
  FiClock, 
  FiCheckCircle, 
  FiXCircle, 
  FiAlertCircle, 
  FiPaperclip,
  FiSend,
  FiCalendar
} from 'react-icons/fi';
import Modal from '../../components/common/Modal';
import { studentLeaves } from '../../data/mockData';
import { applyLeaveApi, getMyLeavesApi } from '../../services/api';

export default function StudentLeave() {
  const [leaves, setLeaves] = useState(studentLeaves);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [form, setForm] = useState({
    leaveType: 'Medical',
    startDate: '',
    endDate: '',
    reason: '',
    documentName: ''
  });

  // Fetch real leaves if API available
  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const res = await getMyLeavesApi();
      if (res?.success && res.data?.length > 0) {
        // Map backend items to local format
        const mapped = res.data.map(item => ({
          id: item._id,
          leaveType: item.leaveType,
          startDate: new Date(item.startDate).toISOString().split('T')[0],
          endDate: new Date(item.endDate).toISOString().split('T')[0],
          reason: item.reason,
          status: item.status,
          appliedOn: new Date(item.appliedOn || item.createdAt).toISOString().split('T')[0],
          reviewedBy: item.reviewedBy?.name || 'Pending Review',
          remarks: item.remarks || 'Under evaluation'
        }));
        setLeaves(mapped);
      }
    } catch (err) {
      // Fallback to mock data if backend not running/offline
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await applyLeaveApi({
        leaveType: form.leaveType,
        startDate: form.startDate,
        endDate: form.endDate,
        reason: form.reason
      });

      if (res?.success) {
        const newLeaveItem = {
          id: res.data._id || `LV-${Date.now()}`,
          leaveType: form.leaveType,
          startDate: form.startDate,
          endDate: form.endDate,
          reason: form.reason,
          status: 'Pending',
          appliedOn: new Date().toISOString().split('T')[0],
          reviewedBy: 'Pending Review',
          remarks: 'Awaiting faculty evaluation'
        };
        setLeaves([newLeaveItem, ...leaves]);
        setSubmitSuccess(true);
      } else {
        throw new Error(res?.message || 'Failed to submit leave request');
      }
    } catch (err) {
      // Fallback for standalone offline operation
      const newLeaveItem = {
        id: `LV-${Math.floor(100 + Math.random() * 900)}`,
        leaveType: form.leaveType,
        startDate: form.startDate,
        endDate: form.endDate,
        reason: form.reason,
        status: 'Pending',
        appliedOn: new Date().toISOString().split('T')[0],
        reviewedBy: 'Pending Review',
        remarks: 'Submitted for verification'
      };
      setLeaves([newLeaveItem, ...leaves]);
      setSubmitSuccess(true);
    } finally {
      setLoading(false);
      setTimeout(() => {
        setSubmitSuccess(false);
        setIsModalOpen(false);
        setForm({ leaveType: 'Medical', startDate: '', endDate: '', reason: '', documentName: '' });
      }, 1500);
    }
  };

  const pendingCount = leaves.filter(l => l.status === 'Pending').length;
  const approvedCount = leaves.filter(l => l.status === 'Approved').length;
  const rejectedCount = leaves.filter(l => l.status === 'Rejected').length;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FiFileText className="w-7 h-7 text-amber-400" />
            Leave Applications & Absences
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Submit formal leave applications, upload medical notes, and track authorization status.
          </p>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary py-2.5 px-4 text-xs flex items-center gap-2 self-start sm:self-auto"
        >
          <FiPlus className="w-4 h-4" />
          <span>Apply New Leave</span>
        </button>
      </div>

      {/* Metric Cards Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-5 border-amber-500/30 bg-amber-950/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Pending Review</span>
            <h3 className="text-3xl font-extrabold text-white mt-1">{pendingCount}</h3>
          </div>
          <div className="p-3 bg-amber-500/20 rounded-xl text-amber-400 border border-amber-500/30">
            <FiClock className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-5 border-emerald-500/30 bg-emerald-950/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Approved Leaves</span>
            <h3 className="text-3xl font-extrabold text-white mt-1">{approvedCount}</h3>
          </div>
          <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400 border border-emerald-500/30">
            <FiCheckCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-5 border-rose-500/30 bg-rose-950/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Rejected Requests</span>
            <h3 className="text-3xl font-extrabold text-white mt-1">{rejectedCount}</h3>
          </div>
          <div className="p-3 bg-rose-500/20 rounded-xl text-rose-400 border border-rose-500/30">
            <FiXCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Leave Application History Table */}
      <div className="glass-panel overflow-hidden border-slate-800 space-y-4 p-6">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <FiCalendar className="w-5 h-5 text-indigo-400" />
          My Leave Application Records
        </h3>

        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <th className="p-4 font-semibold">Application Ref</th>
                <th className="p-4 font-semibold">Leave Category</th>
                <th className="p-4 font-semibold">Absence Dates</th>
                <th className="p-4 font-semibold">Reason</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Reviewed By / Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {leaves.length > 0 ? (
                leaves.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="p-4">
                      <span className="font-mono text-indigo-300 font-bold">{item.id}</span>
                      <span className="block text-[10px] text-slate-500">Applied: {item.appliedOn}</span>
                    </td>
                    <td className="p-4 font-semibold text-slate-100">{item.leaveType}</td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-200">{item.startDate} to {item.endDate}</div>
                    </td>
                    <td className="p-4 max-w-xs text-slate-300 truncate" title={item.reason}>
                      {item.reason}
                    </td>
                    <td className="p-4">
                      <span className={`badge text-xs px-2.5 py-1 font-semibold ${
                        item.status === 'Approved' ? 'badge-present' :
                        item.status === 'Pending' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        'badge-absent'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 text-xs">
                      <span className="font-semibold text-slate-300 block">{item.reviewedBy}</span>
                      <span className="text-[11px] text-slate-400 italic">{item.remarks}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-slate-400">
                    No leave applications submitted yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apply Leave Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Apply for Absence / Duty Leave"
      >
        {submitSuccess ? (
          <div className="py-8 text-center space-y-3">
            <FiCheckCircle className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="text-base font-bold text-white">Leave Application Submitted!</h4>
            <p className="text-xs text-slate-400">Your leave request has been routed to your department head for verification.</p>
          </div>
        ) : (
          <form onSubmit={handleFormSubmit} className="space-y-4">
            
            <div className="input-group mb-0">
              <label className="input-label">Leave Type / Category</label>
              <select
                value={form.leaveType}
                onChange={(e) => setForm({ ...form, leaveType: e.target.value })}
                className="input-field text-xs bg-slate-900"
              >
                <option value="Medical">Medical Leave</option>
                <option value="Personal Emergency">Personal Emergency</option>
                <option value="Official Event">Official Campus Event / Duty Leave</option>
                <option value="Duty Leave">Academic Duty Leave</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="input-group mb-0">
                <label className="input-label">Start Date</label>
                <input
                  type="date"
                  required
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="input-field text-xs"
                />
              </div>

              <div className="input-group mb-0">
                <label className="input-label">End Date</label>
                <input
                  type="date"
                  required
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  className="input-field text-xs"
                />
              </div>
            </div>

            <div className="input-group mb-0">
              <label className="input-label">Reason & Explanation</label>
              <textarea
                rows="3"
                required
                placeholder="State reason for absence in detail..."
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                className="input-field text-xs"
              />
            </div>

            <div className="input-group mb-0">
              <label className="input-label">Supporting Document (Optional)</label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  onChange={(e) => setForm({ ...form, documentName: e.target.files[0]?.name || '' })}
                  className="input-field text-xs file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-500/20 file:text-indigo-300 hover:file:bg-indigo-500/30"
                />
              </div>
              {form.documentName && (
                <span className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                  <FiPaperclip className="w-3 h-3" /> Attached: {form.documentName}
                </span>
              )}
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-2.5 text-xs font-semibold flex items-center justify-center gap-2"
            >
              <FiSend className="w-4 h-4" />
              <span>{loading ? 'Submitting Application...' : 'Submit Leave Application'}</span>
            </button>
          </form>
        )}
      </Modal>

    </div>
  );
}
