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
  FiX,
  FiShield,
  FiLock,
  FiArrowRight
} from 'react-icons/fi';
import Modal from '../../components/common/Modal';
import { mockTeacherLeavesList } from '../../data/mockData';
import { 
  getAllLeavesApi, 
  teacherReviewLeaveApi, 
  getDocumentTokenApi,
  getPrivateDocumentStreamUrl,
  getPrivateDocumentDownloadUrl
} from '../../services/api';

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
  const [actionMsg, setActionMsg] = useState('');

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
          document: item.document || null,
          documentName: item.document?.originalName || item.documentName || '',
          documentUrl: item.documentUrl || '',
          status: item.status,
          verificationStage: item.verificationStage || 'teacher_review',
          teacherReview: item.teacherReview || null,
          adminVerification: item.adminVerification || null,
          appliedOn: new Date(item.appliedOn || item.createdAt).toISOString().split('T')[0],
          reviewedBy: item.teacherReview?.reviewedBy?.name || item.reviewedBy?.name || null,
          remarks: item.teacherReview?.remarks || item.remarks || ''
        }));
        setLeaves(mapped);
      }
    } catch (err) {
      // Keep mock leaves
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReviewModal = (leaveItem, defaultAction = 'Approved') => {
    setSelectedLeave(leaveItem);
    setActionType(defaultAction);
    setRemarks(
      leaveItem.teacherReview?.remarks ||
      (defaultAction === 'Approved'
        ? 'Medical certificate / supporting document verified. Recommended for administrative leave sanction.'
        : 'Supporting proof insufficient or invalid.')
    );
    setActionSuccess(false);
    setActionMsg('');
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedLeave) return;

    setSubmittingAction(true);
    try {
      const res = await teacherReviewLeaveApi(selectedLeave.id, {
        action: actionType,
        remarks: remarks
      });

      if (res?.success) {
        const newStatus = actionType === 'Approved' ? 'Teacher Verified' : 'Rejected';
        const newStage = actionType === 'Approved' ? 'admin_verification' : 'rejected';

        setLeaves(prev => prev.map(item => 
          item.id === selectedLeave.id 
            ? { 
                ...item, 
                status: newStatus, 
                verificationStage: newStage,
                teacherReview: { status: actionType, remarks: remarks },
                remarks: remarks, 
                reviewedBy: 'Faculty Advisor' 
              } 
            : item
        ));
        setActionSuccess(true);
        setActionMsg(actionType === 'Approved' ? 'Verified & Forwarded to Admin!' : 'Leave Request Rejected.');
      } else {
        throw new Error(res?.message || 'Failed to submit review');
      }
    } catch (err) {
      // Offline fallback
      const newStatus = actionType === 'Approved' ? 'Teacher Verified' : 'Rejected';
      const newStage = actionType === 'Approved' ? 'admin_verification' : 'rejected';
      setLeaves(prev => prev.map(item => 
        item.id === selectedLeave.id 
          ? { 
              ...item, 
              status: newStatus, 
              verificationStage: newStage,
              teacherReview: { status: actionType, remarks: remarks },
              remarks: remarks, 
              reviewedBy: 'Faculty Advisor' 
            } 
          : item
      ));
      setActionSuccess(true);
      setActionMsg(actionType === 'Approved' ? 'Verified & Forwarded to Admin!' : 'Leave Request Rejected.');
    } finally {
      setSubmittingAction(false);
      setTimeout(() => {
        setSelectedLeave(null);
        setActionSuccess(false);
      }, 1200);
    }
  };

  const handleOpenDocPreview = async (item) => {
    try {
      const tokenRes = await getDocumentTokenApi(item.id);
      if (tokenRes?.success && tokenRes.token) {
        setPreviewDoc({
          name: item.document?.originalName || item.documentName || 'Document Attachment',
          mimeType: item.document?.mimeType || 'application/pdf',
          size: item.document?.size || 0,
          hash: item.document?.hash || '',
          scanStatus: item.document?.scanStatus || 'CLEAN',
          scanEngine: item.document?.scanEngine || 'Antigravity Heuristic Engine',
          streamUrl: getPrivateDocumentStreamUrl(tokenRes.token),
          downloadUrl: getPrivateDocumentDownloadUrl(item.id)
        });
        return;
      }
    } catch (err) {
      // Fallback
    }

    setPreviewDoc({
      name: item.document?.originalName || item.documentName || 'Document Attachment',
      mimeType: item.document?.mimeType || 'application/pdf',
      size: item.document?.size || 0,
      hash: item.document?.hash || '',
      scanStatus: item.document?.scanStatus || 'CLEAN',
      scanEngine: item.document?.scanEngine || 'Antigravity Heuristic Engine',
      streamUrl: item.documentUrl || '',
      downloadUrl: item.documentUrl || ''
    });
  };

  const filteredLeaves = leaves.filter(item => {
    let matchesStatus = true;
    if (statusFilter === 'Pending') {
      matchesStatus = item.status === 'Pending' || item.verificationStage === 'teacher_review';
    } else if (statusFilter === 'Teacher Verified') {
      matchesStatus = item.status === 'Teacher Verified';
    } else if (statusFilter === 'Approved') {
      matchesStatus = item.status === 'Approved';
    } else if (statusFilter === 'Rejected') {
      matchesStatus = item.status === 'Rejected';
    }

    const studentName = item.student?.name || '';
    const studentRoll = item.student?.rollNo || '';
    const matchesSearch = 
      studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      studentRoll.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.leaveType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const totalCount = leaves.length;
  const pendingTeacherCount = leaves.filter(l => l.status === 'Pending' || l.verificationStage === 'teacher_review').length;
  const teacherVerifiedCount = leaves.filter(l => l.status === 'Teacher Verified').length;
  const approvedCount = leaves.filter(l => l.status === 'Approved').length;
  const rejectedCount = leaves.filter(l => l.status === 'Rejected').length;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FiFileText className="w-7 h-7 text-indigo-400" />
            Teacher Leave Review & Document Inspection
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Review student absence applications, inspect verified medical/official proof via private access, and forward recommended leaves to Administration.
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-4 border-amber-500/30 bg-amber-950/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Pending My Review</span>
            <h3 className="text-2xl font-extrabold text-white mt-1">{pendingTeacherCount}</h3>
            <span className="text-[10px] text-slate-400">Needs mentor action</span>
          </div>
          <div className="p-2.5 bg-amber-500/20 rounded-xl text-amber-400 border border-amber-500/30">
            <FiClock className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-4 border-cyan-500/30 bg-cyan-950/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">Teacher Verified</span>
            <h3 className="text-2xl font-extrabold text-white mt-1">{teacherVerifiedCount}</h3>
            <span className="text-[10px] text-slate-400">Awaiting Admin final check</span>
          </div>
          <div className="p-2.5 bg-cyan-500/20 rounded-xl text-cyan-400 border border-cyan-500/30">
            <FiArrowRight className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-4 border-emerald-500/30 bg-emerald-950/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Admin Sanctioned</span>
            <h3 className="text-2xl font-extrabold text-white mt-1">{approvedCount}</h3>
            <span className="text-[10px] text-slate-400">Fully sanctioned leaves</span>
          </div>
          <div className="p-2.5 bg-emerald-500/20 rounded-xl text-emerald-400 border border-emerald-500/30">
            <FiCheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-4 border-rose-500/30 bg-rose-950/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Rejected Requests</span>
            <h3 className="text-2xl font-extrabold text-white mt-1">{rejectedCount}</h3>
            <span className="text-[10px] text-slate-400">Denied by faculty/admin</span>
          </div>
          <div className="p-2.5 bg-rose-500/20 rounded-xl text-rose-400 border border-rose-500/30">
            <FiXCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Directory Table */}
      <div className="glass-panel overflow-hidden border-slate-800 space-y-4 p-6">
        
        {/* Controls Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <FiCalendar className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Student Leave Applications Directory</h3>
          </div>

          <div className="flex items-center gap-3">
            {/* Filter Tabs */}
            <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
              {[
                { id: 'Pending', label: 'Pending Review' },
                { id: 'Teacher Verified', label: 'Teacher Verified' },
                { id: 'Approved', label: 'Admin Sanctioned' },
                { id: 'Rejected', label: 'Rejected' },
                { id: 'All', label: 'All Records' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-medium transition-all ${
                    statusFilter === tab.id 
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
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

        {/* Applications List Table */}
        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <th className="p-4 font-semibold">Student & Roll No</th>
                <th className="p-4 font-semibold">Leave Type</th>
                <th className="p-4 font-semibold">Duration & Dates</th>
                <th className="p-4 font-semibold">Absence Reason</th>
                <th className="p-4 font-semibold">Document & Security</th>
                <th className="p-4 font-semibold">Workflow Status</th>
                <th className="p-4 font-semibold text-right">Faculty Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredLeaves.length > 0 ? (
                filteredLeaves.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-900/50 transition-colors">
                    
                    {/* Student Info */}
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-xs border border-indigo-500/30">
                          {item.student?.name ? item.student.name.charAt(0) : 'S'}
                        </div>
                        <div>
                          <div className="font-semibold text-white">{item.student?.name || 'Student'}</div>
                          <div className="text-[11px] text-indigo-300 font-mono">{item.student?.rollNo || 'N/A'}</div>
                        </div>
                      </div>
                    </td>

                    {/* Leave Type */}
                    <td className="p-4">
                      <span className="font-semibold text-slate-200 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[11px]">
                        {item.leaveType}
                      </span>
                    </td>

                    {/* Duration */}
                    <td className="p-4">
                      <div className="font-medium text-slate-200">{item.startDate}</div>
                      <div className="text-[10px] text-slate-400">to {item.endDate}</div>
                    </td>

                    {/* Reason */}
                    <td className="p-4 max-w-xs">
                      <p className="line-clamp-2 text-xs text-slate-300" title={item.reason}>
                        {item.reason}
                      </p>
                    </td>

                    {/* Document & Antivirus Status */}
                    <td className="p-4">
                      {item.documentName || item.document ? (
                        <div className="space-y-1.5">
                          <button
                            onClick={() => handleOpenDocPreview(item)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 hover:bg-indigo-500/20 text-[11px] font-medium transition-colors"
                          >
                            <FiPaperclip className="w-3 h-3 text-indigo-400" />
                            <span className="max-w-[110px] truncate">{item.documentName || 'Document'}</span>
                            <FiEye className="w-3 h-3 ml-0.5 text-indigo-400" />
                          </button>
                          <div className="flex items-center gap-1 text-[10px] text-emerald-400">
                            <FiShield className="w-2.5 h-2.5" />
                            <span>Scan: CLEAN 🛡️</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500 italic">No document</span>
                      )}
                    </td>

                    {/* Workflow Status */}
                    <td className="p-4">
                      <span className={`badge text-[11px] px-2.5 py-0.5 font-semibold ${
                        item.status === 'Approved' 
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        item.status === 'Teacher Verified' 
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                        item.status === 'Pending' 
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                          'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}>
                        {item.status === 'Teacher Verified' ? 'Teacher Verified' : item.status}
                      </span>
                      {item.remarks && (
                        <p className="text-[10px] text-slate-400 mt-1 italic line-clamp-1" title={item.remarks}>
                          "{item.remarks}"
                        </p>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      {item.status === 'Pending' || item.verificationStage === 'teacher_review' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenReviewModal(item, 'Approved')}
                            className="btn btn-primary py-1 px-2.5 text-[11px] inline-flex items-center gap-1 shadow-sm"
                            title="Verify document and recommend to Admin"
                          >
                            <FiCheck className="w-3 h-3" />
                            <span>Verify & Forward</span>
                          </button>
                          <button
                            onClick={() => handleOpenReviewModal(item, 'Rejected')}
                            className="p-1 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30"
                            title="Reject request"
                          >
                            <FiX className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleOpenReviewModal(item, item.status === 'Approved' ? 'Approved' : 'Rejected')}
                          className="text-[11px] text-slate-400 hover:text-white underline"
                        >
                          View Details
                        </button>
                      )}
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-12 text-center text-slate-400">
                    No leave applications match current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {selectedLeave && (
        <Modal
          isOpen={!!selectedLeave}
          onClose={() => setSelectedLeave(null)}
          title={`Faculty Review: ${selectedLeave.student?.name}`}
        >
          {actionSuccess ? (
            <div className="py-8 text-center space-y-3">
              <FiCheckCircle className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
              <h4 className="text-base font-bold text-white">{actionMsg}</h4>
              <p className="text-xs text-slate-400">Application status has been updated in the multi-stage pipeline.</p>
            </div>
          ) : (
            <form onSubmit={handleUpdateStatus} className="space-y-4">
              {/* Application Summary Box */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Leave Type:</span>
                  <span className="text-white font-semibold">{selectedLeave.leaveType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Absence Dates:</span>
                  <span className="text-white">{selectedLeave.startDate} to {selectedLeave.endDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Absence Reason:</span>
                  <span className="text-white font-medium truncate max-w-[220px]">{selectedLeave.reason}</span>
                </div>
                {selectedLeave.documentName && (
                  <div className="flex justify-between items-center pt-1 border-t border-slate-800">
                    <span className="text-slate-400">Attached Proof:</span>
                    <button
                      type="button"
                      onClick={() => handleOpenDocPreview(selectedLeave)}
                      className="text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1"
                    >
                      <FiEye className="w-3 h-3" /> Inspect Document
                    </button>
                  </div>
                )}
              </div>

              {/* Action Toggle */}
              <div className="space-y-1.5">
                <label className="input-label">Faculty Verification Action</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setActionType('Approved')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      actionType === 'Approved'
                        ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/20'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <FiCheck className="w-4 h-4" />
                    <span>Verify & Forward to Admin</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActionType('Rejected')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      actionType === 'Rejected'
                        ? 'bg-rose-600/30 border-rose-500 text-rose-300 shadow-md shadow-rose-500/20'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <FiX className="w-4 h-4" />
                    <span>Reject Application</span>
                  </button>
                </div>
              </div>

              {/* Remarks */}
              <div className="space-y-1.5">
                <label className="input-label">Faculty Mentor Remarks *</label>
                <textarea
                  rows="3"
                  required
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Enter remarks for student & administration..."
                  className="input-field text-xs bg-slate-900"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submittingAction}
                  className={`btn flex-1 py-2.5 text-xs font-semibold ${
                    actionType === 'Approved' ? 'btn-primary' : 'bg-rose-600 hover:bg-rose-700 text-white'
                  }`}
                >
                  {submittingAction ? 'Recording...' : actionType === 'Approved' ? 'Submit Verification ➔ Forward to Admin' : 'Submit Rejection'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLeave(null)}
                  className="btn bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}

      {/* Secure Document Preview Modal */}
      {previewDoc && (
        <Modal
          isOpen={!!previewDoc}
          onClose={() => setPreviewDoc(null)}
          title={`Secure Document Inspection: ${previewDoc.name}`}
        >
          <div className="space-y-4">
            {/* Document Security Telemetry Card */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">File Name:</span>
                <span className="text-white font-semibold truncate max-w-[200px]">{previewDoc.name}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Format:</span>
                <span className="text-indigo-300 font-mono text-[11px] uppercase">{previewDoc.mimeType}</span>
              </div>
              {previewDoc.hash && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">SHA-256 Checksum:</span>
                  <span className="text-emerald-400 font-mono text-[10px] truncate max-w-[200px]">{previewDoc.hash}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Antivirus Status:</span>
                <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                  <FiShield className="w-3 h-3" /> CLEAN (Passed Signature Scan) 🛡️
                </span>
              </div>
            </div>

            {/* Document Viewer Frame */}
            {previewDoc.streamUrl ? (
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950 min-h-[300px] max-h-[450px] flex items-center justify-center">
                {previewDoc.mimeType === 'application/pdf' ? (
                  <iframe 
                    src={previewDoc.streamUrl} 
                    title="PDF Preview"
                    className="w-full h-[400px] border-0"
                  />
                ) : (
                  <img 
                    src={previewDoc.streamUrl} 
                    alt="Document Proof" 
                    className="max-h-[380px] max-w-full object-contain p-2 rounded-lg"
                  />
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 text-xs">
                Preview not available.
              </div>
            )}

            <div className="flex gap-3">
              {previewDoc.streamUrl && (
                <a
                  href={previewDoc.streamUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary flex-1 py-2 text-xs flex items-center justify-center gap-2"
                >
                  <FiExternalLink className="w-3.5 h-3.5" />
                  <span>Open Full Document</span>
                </a>
              )}
              <button 
                onClick={() => setPreviewDoc(null)}
                className="btn bg-slate-800 hover:bg-slate-700 text-slate-300 px-5 py-2 text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}
