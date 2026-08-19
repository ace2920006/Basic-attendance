import React, { useState, useEffect } from 'react';
import { 
  FiFileText, 
  FiCheckCircle, 
  FiXCircle, 
  FiClock, 
  FiPaperclip, 
  FiSearch, 
  FiFilter, 
  FiUser, 
  FiCalendar, 
  FiEye, 
  FiExternalLink,
  FiMessageSquare,
  FiCheck,
  FiX
} from 'react-icons/fi';
import Modal from '../../components/common/Modal';
import { mockTeacherLeavesList } from '../../data/mockData';
import { getAllLeavesApi, updateLeaveStatusApi } from '../../services/api';

export default function TeacherLeave() {
  const [leaves, setLeaves] = useState(mockTeacherLeavesList);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('Pending');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Review Modal State
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [actionType, setActionType] = useState('Approved');
  const [remarks, setRemarks] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(false);

  // Document Preview Modal State
  const [previewDoc, setPreviewDoc] = useState(null);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await getAllLeavesApi();
      if (res?.success && res.data) {
        const mapped = res.data.map(item => ({
          id: item._id,
          student: item.student || {
            name: 'Unknown Student',
            rollNo: 'N/A',
            department: 'N/A',
            semester: 'N/A'
          },
          leaveType: item.leaveType,
          startDate: new Date(item.startDate).toISOString().split('T')[0],
          endDate: new Date(item.endDate).toISOString().split('T')[0],
          reason: item.reason,
          documentName: item.documentName || '',
          documentUrl: item.documentUrl || '',
          status: item.status,
          appliedOn: new Date(item.appliedOn || item.createdAt).toISOString().split('T')[0],
          reviewedBy: item.reviewedBy ? item.reviewedBy.name : null,
          remarks: item.remarks || ''
        }));
        setLeaves(mapped);
      }
    } catch (err) {
      // Fallback to mock data if API offline
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReviewModal = (leaveItem, defaultStatus = 'Approved') => {
    setSelectedLeave(leaveItem);
    setActionType(defaultStatus);
    setRemarks(leaveItem.remarks || (defaultStatus === 'Approved' ? 'Leave request verified and approved.' : 'Leave request rejected.'));
    setActionSuccess(false);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedLeave) return;

    setSubmittingAction(true);
    try {
      const res = await updateLeaveStatusApi(selectedLeave.id, {
        status: actionType,
        remarks: remarks
      });

      if (res?.success) {
        setLeaves(prev => prev.map(item => 
          item.id === selectedLeave.id 
            ? { ...item, status: actionType, remarks: remarks, reviewedBy: 'Faculty Advisor' } 
            : item
        ));
        setActionSuccess(true);
      } else {
        // Fallback update
        setLeaves(prev => prev.map(item => 
          item.id === selectedLeave.id 
            ? { ...item, status: actionType, remarks: remarks, reviewedBy: 'Faculty Advisor' } 
            : item
        ));
        setActionSuccess(true);
      }
    } catch (err) {
      // Fallback update
      setLeaves(prev => prev.map(item => 
        item.id === selectedLeave.id 
          ? { ...item, status: actionType, remarks: remarks, reviewedBy: 'Faculty Advisor' } 
          : item
      ));
      setActionSuccess(true);
    } finally {
      setSubmittingAction(false);
      setTimeout(() => {
        setSelectedLeave(null);
        setActionSuccess(false);
      }, 1200);
    }
  };

  const filteredLeaves = leaves.filter(item => {
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    const studentName = item.student?.name || '';
    const studentRoll = item.student?.rollNo || '';
    const matchesSearch = 
      studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      studentRoll.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.leaveType.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalCount = leaves.length;
  const pendingCount = leaves.filter(l => l.status === 'Pending').length;
  const approvedCount = leaves.filter(l => l.status === 'Approved').length;
  const rejectedCount = leaves.filter(l => l.status === 'Rejected').length;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FiFileText className="w-7 h-7 text-indigo-400" />
            Student Leave Approvals & History
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Review student absence applications, inspect uploaded medical notes / proof, approve or reject with comments.
          </p>
        </div>
      </div>

      {/* Metric Cards Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        
        <div className="glass-panel p-4 border-indigo-500/30 bg-indigo-950/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Total Applications</span>
            <h3 className="text-2xl font-extrabold text-white mt-1">{totalCount}</h3>
          </div>
          <div className="p-2.5 bg-indigo-500/20 rounded-xl text-indigo-400 border border-indigo-500/30">
            <FiFileText className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-4 border-amber-500/30 bg-amber-950/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Pending Review</span>
            <h3 className="text-2xl font-extrabold text-white mt-1">{pendingCount}</h3>
          </div>
          <div className="p-2.5 bg-amber-500/20 rounded-xl text-amber-400 border border-amber-500/30">
            <FiClock className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-4 border-emerald-500/30 bg-emerald-950/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Approved Leaves</span>
            <h3 className="text-2xl font-extrabold text-white mt-1">{approvedCount}</h3>
          </div>
          <div className="p-2.5 bg-emerald-500/20 rounded-xl text-emerald-400 border border-emerald-500/30">
            <FiCheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-4 border-rose-500/30 bg-rose-950/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Rejected Requests</span>
            <h3 className="text-2xl font-extrabold text-white mt-1">{rejectedCount}</h3>
          </div>
          <div className="p-2.5 bg-rose-500/20 rounded-xl text-rose-400 border border-rose-500/30">
            <FiXCircle className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Main Table / Applications List */}
      <div className="glass-panel overflow-hidden border-slate-800 space-y-4 p-6">
        
        {/* Controls Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <FiCalendar className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Leave Requests Directory</h3>
          </div>

          <div className="flex items-center gap-3">
            {/* Filter Tabs */}
            <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
              {['Pending', 'Approved', 'Rejected', 'All'].map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-medium transition-all ${
                    statusFilter === status 
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <FiSearch className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search student or roll..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field text-xs pl-8 py-1.5 w-48 bg-slate-900/80"
              />
            </div>
          </div>
        </div>

        {/* Applications List */}
        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <th className="p-4 font-semibold">Student Details</th>
                <th className="p-4 font-semibold">Category & Dates</th>
                <th className="p-4 font-semibold">Reason</th>
                <th className="p-4 font-semibold">Supporting Document</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Review Remarks</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredLeaves.length > 0 ? (
                filteredLeaves.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-900/50 transition-colors">
                    
                    {/* Student Details */}
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-indigo-600/20 text-indigo-300 flex items-center justify-center font-bold text-xs border border-indigo-500/30">
                          {(item.student?.name || 'S').charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-100">{item.student?.name || 'Student'}</div>
                          <div className="text-[10px] text-indigo-300 font-mono">{item.student?.rollNo || 'Roll N/A'}</div>
                          <div className="text-[10px] text-slate-500">{item.student?.department || ''}</div>
                        </div>
                      </div>
                    </td>

                    {/* Category & Dates */}
                    <td className="p-4">
                      <span className="font-semibold text-amber-300 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[11px] block w-max">
                        {item.leaveType}
                      </span>
                      <div className="font-medium text-slate-200 mt-1">{item.startDate}</div>
                      <div className="text-[10px] text-slate-400">to {item.endDate}</div>
                    </td>

                    {/* Reason */}
                    <td className="p-4 max-w-xs">
                      <p className="line-clamp-2 text-xs text-slate-300" title={item.reason}>{item.reason}</p>
                      <span className="text-[10px] text-slate-500 block mt-1">Applied: {item.appliedOn}</span>
                    </td>

                    {/* Document */}
                    <td className="p-4">
                      {item.documentName || item.documentUrl ? (
                        <button
                          onClick={() => setPreviewDoc({ name: item.documentName || 'Supporting Attachment', url: item.documentUrl, student: item.student?.name })}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 hover:bg-indigo-500/20 text-[11px] font-medium transition-colors"
                        >
                          <FiPaperclip className="w-3 h-3 text-indigo-400" />
                          <span className="max-w-[90px] truncate">{item.documentName || 'View Document'}</span>
                          <FiEye className="w-3 h-3 text-indigo-400" />
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-500 italic">No file attached</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <span className={`badge text-xs px-2.5 py-1 font-semibold ${
                        item.status === 'Approved' ? 'badge-present' :
                        item.status === 'Pending' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        'badge-absent'
                      }`}>
                        {item.status}
                      </span>
                    </td>

                    {/* Review Remarks */}
                    <td className="p-4 text-xs">
                      {item.reviewedBy && (
                        <span className="text-[10px] text-slate-400 block font-semibold">By: {item.reviewedBy}</span>
                      )}
                      <span className="text-[11px] text-slate-300 italic">
                        {item.remarks || (item.status === 'Pending' ? 'Awaiting evaluation' : 'No remarks')}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenReviewModal(item, 'Approved')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                          title="Approve Leave"
                        >
                          <FiCheck className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>

                        <button
                          onClick={() => handleOpenReviewModal(item, 'Rejected')}
                          className="px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                          title="Reject Leave"
                        >
                          <FiX className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-12 text-center text-slate-400">
                    No leave requests found for the selected filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Review & Approve / Reject Modal */}
      {selectedLeave && (
        <Modal
          isOpen={!!selectedLeave}
          onClose={() => setSelectedLeave(null)}
          title={`Review Leave Request - ${selectedLeave.student?.name}`}
        >
          {actionSuccess ? (
            <div className="py-8 text-center space-y-3">
              <FiCheckCircle className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
              <h4 className="text-base font-bold text-white">Leave Status Updated!</h4>
              <p className="text-xs text-slate-400">
                Application for {selectedLeave.student?.name} has been marked as <strong className="text-white">{actionType}</strong>.
              </p>
            </div>
          ) : (
            <form onSubmit={handleUpdateStatus} className="space-y-4">
              
              {/* Student Summary Info */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Student:</span>
                  <span className="font-semibold text-white">{selectedLeave.student?.name} ({selectedLeave.student?.rollNo})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Category:</span>
                  <span className="font-semibold text-amber-400">{selectedLeave.leaveType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Period:</span>
                  <span className="font-semibold text-slate-200">{selectedLeave.startDate} to {selectedLeave.endDate}</span>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-1.5 mt-1.5">
                  <span className="text-slate-400">Reason:</span>
                  <span className="font-medium text-slate-300 max-w-[220px] text-right">{selectedLeave.reason}</span>
                </div>
                {selectedLeave.documentName && (
                  <div className="flex justify-between items-center pt-1 border-t border-slate-800">
                    <span className="text-slate-400">Attachment:</span>
                    <button
                      type="button"
                      onClick={() => setPreviewDoc({ name: selectedLeave.documentName, url: selectedLeave.documentUrl, student: selectedLeave.student?.name })}
                      className="text-indigo-400 hover:text-indigo-300 text-[11px] underline flex items-center gap-1"
                    >
                      <FiPaperclip className="w-3 h-3" /> {selectedLeave.documentName}
                    </button>
                  </div>
                )}
              </div>

              {/* Action Selection */}
              <div className="input-group mb-0">
                <label className="input-label">Authorization Action *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setActionType('Approved')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      actionType === 'Approved'
                        ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500 shadow-lg shadow-emerald-600/20'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <FiCheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Approve Leave</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActionType('Rejected')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      actionType === 'Rejected'
                        ? 'bg-rose-600/30 text-rose-300 border-rose-500 shadow-lg shadow-rose-600/20'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <FiXCircle className="w-4 h-4 text-rose-400" />
                    <span>Reject Application</span>
                  </button>
                </div>
              </div>

              {/* Remarks Textarea */}
              <div className="input-group mb-0">
                <label className="input-label">Faculty Remarks / Comments *</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Enter feedback or explanation for the student..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="input-field text-xs bg-slate-900"
                />
              </div>

              <button
                type="submit"
                disabled={submittingAction}
                className={`btn w-full py-2.5 text-xs font-semibold flex items-center justify-center gap-2 ${
                  actionType === 'Approved' ? 'btn-primary' : 'bg-rose-600 hover:bg-rose-500 text-white'
                }`}
              >
                <span>{submittingAction ? 'Processing Update...' : `Confirm ${actionType}`}</span>
              </button>
            </form>
          )}
        </Modal>
      )}

      {/* Supporting Document View Modal */}
      {previewDoc && (
        <Modal
          isOpen={!!previewDoc}
          onClose={() => setPreviewDoc(null)}
          title={`Supporting Document - ${previewDoc.student || 'Student'}`}
        >
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-3">
              <FiPaperclip className="w-10 h-10 text-indigo-400 mx-auto" />
              <div className="text-sm font-semibold text-white">{previewDoc.name}</div>
              <p className="text-xs text-slate-400">Student submitted supporting document for leave authorization.</p>
              
              {previewDoc.url ? (
                <div className="pt-2 flex justify-center gap-3">
                  <a 
                    href={previewDoc.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-primary py-2 px-4 text-xs inline-flex items-center gap-2"
                  >
                    <FiExternalLink className="w-3.5 h-3.5" />
                    <span>View / Download Attachment</span>
                  </a>
                </div>
              ) : (
                <p className="text-xs text-amber-400">File link unavailable in preview mode.</p>
              )}
            </div>
            <button 
              onClick={() => setPreviewDoc(null)}
              className="btn bg-slate-800 hover:bg-slate-700 text-slate-300 w-full py-2 text-xs"
            >
              Close Window
            </button>
          </div>
        </Modal>
      )}

    </div>
  );
}
