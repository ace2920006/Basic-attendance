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
  FiCalendar,
  FiExternalLink,
  FiDownload,
  FiEye,
  FiSearch
} from 'react-icons/fi';
import Modal from '../../components/common/Modal';
import { studentLeaves } from '../../data/mockData';
import { applyLeaveApi, getMyLeavesApi, uploadFileApi } from '../../services/api';

export default function StudentLeave() {
  const [leaves, setLeaves] = useState(studentLeaves);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const [form, setForm] = useState({
    leaveType: 'Medical',
    startDate: '',
    endDate: '',
    reason: '',
    documentName: '',
    documentUrl: ''
  });

  const [selectedFile, setSelectedFile] = useState(null);

  // Fetch real leaves if API available
  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const res = await getMyLeavesApi();
      if (res?.success && res.data?.length > 0) {
        const mapped = res.data.map(item => ({
          id: item._id,
          leaveType: item.leaveType,
          startDate: new Date(item.startDate).toISOString().split('T')[0],
          endDate: new Date(item.endDate).toISOString().split('T')[0],
          reason: item.reason,
          documentName: item.documentName || '',
          documentUrl: item.documentUrl || '',
          status: item.status,
          appliedOn: new Date(item.appliedOn || item.createdAt).toISOString().split('T')[0],
          reviewedBy: item.reviewedBy?.name || 'Pending Review',
          remarks: item.remarks || 'Under evaluation'
        }));
        setLeaves(mapped);
      }
    } catch (err) {
      // Fallback to mock data
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setForm(prev => ({ ...prev, documentName: file.name }));
    setUploadingFile(true);
    setErrorMsg('');

    try {
      // Upload file to server
      const res = await uploadFileApi(file);
      if (res?.success && res.data?.url) {
        setForm(prev => ({ 
          ...prev, 
          documentUrl: res.data.url,
          documentName: file.name 
        }));
      } else {
        // Fallback local preview URL
        const localUrl = URL.createObjectURL(file);
        setForm(prev => ({ ...prev, documentUrl: localUrl }));
      }
    } catch (err) {
      // Create object URL for client preview if upload endpoint offline
      const localUrl = URL.createObjectURL(file);
      setForm(prev => ({ ...prev, documentUrl: localUrl }));
    } finally {
      setUploadingFile(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!form.startDate || !form.endDate || !form.reason) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const payload = {
        leaveType: form.leaveType,
        startDate: form.startDate,
        endDate: form.endDate,
        reason: form.reason,
        documentUrl: form.documentUrl,
        documentName: form.documentName
      };

      const res = await applyLeaveApi(payload);

      if (res?.success) {
        const newLeaveItem = {
          id: res.data._id || `LV-${Date.now()}`,
          leaveType: form.leaveType,
          startDate: form.startDate,
          endDate: form.endDate,
          reason: form.reason,
          documentName: form.documentName,
          documentUrl: form.documentUrl,
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
      // Offline fallback
      const newLeaveItem = {
        id: `LV-${Math.floor(100 + Math.random() * 900)}`,
        leaveType: form.leaveType,
        startDate: form.startDate,
        endDate: form.endDate,
        reason: form.reason,
        documentName: form.documentName,
        documentUrl: form.documentUrl,
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
        setForm({ leaveType: 'Medical', startDate: '', endDate: '', reason: '', documentName: '', documentUrl: '' });
        setSelectedFile(null);
      }, 1500);
    }
  };

  const filteredLeaves = leaves.filter(item => {
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    const matchesSearch = 
      item.leaveType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const pendingCount = leaves.filter(l => l.status === 'Pending').length;
  const approvedCount = leaves.filter(l => l.status === 'Approved').length;
  const rejectedCount = leaves.filter(l => l.status === 'Rejected').length;

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FiFileText className="w-7 h-7 text-amber-400" />
            Leave Applications & Absences
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Submit formal leave requests, upload medical certificates / official proof, and track approval status.
          </p>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary py-2.5 px-4 text-xs flex items-center gap-2 self-start sm:self-auto shadow-lg shadow-indigo-600/30"
        >
          <FiPlus className="w-4 h-4" />
          <span>Apply New Leave</span>
        </button>
      </div>

      {/* Overview Cards */}
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

      {/* Leave Application History Table Panel */}
      <div className="glass-panel overflow-hidden border-slate-800 space-y-4 p-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FiCalendar className="w-5 h-5 text-indigo-400" />
            My Leave Records History
          </h3>

          <div className="flex items-center gap-3">
            {/* Filter Tabs */}
            <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs">
              {['All', 'Pending', 'Approved', 'Rejected'].map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-medium transition-all ${
                    statusFilter === status 
                      ? 'bg-indigo-600 text-white shadow' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative">
              <FiSearch className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search reason or ref..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field text-xs pl-8 py-1.5 w-44 bg-slate-900/80"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <th className="p-4 font-semibold">Ref ID & Date</th>
                <th className="p-4 font-semibold">Category</th>
                <th className="p-4 font-semibold">Absence Period</th>
                <th className="p-4 font-semibold">Reason</th>
                <th className="p-4 font-semibold">Attachment Document</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Reviewer & Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredLeaves.length > 0 ? (
                filteredLeaves.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-900/50 transition-colors">
                    
                    <td className="p-4">
                      <span className="font-mono text-indigo-300 font-bold block">{item.id}</span>
                      <span className="text-[10px] text-slate-500">Applied: {item.appliedOn}</span>
                    </td>

                    <td className="p-4">
                      <span className="font-semibold text-slate-100 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[11px]">
                        {item.leaveType}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="font-medium text-slate-200">{item.startDate}</div>
                      <div className="text-[10px] text-slate-400">to {item.endDate}</div>
                    </td>

                    <td className="p-4 max-w-xs text-slate-300">
                      <p className="line-clamp-2 text-xs" title={item.reason}>{item.reason}</p>
                    </td>

                    <td className="p-4">
                      {item.documentName || item.documentUrl ? (
                        <button
                          onClick={() => setPreviewDoc({ name: item.documentName || 'Document Attachment', url: item.documentUrl })}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 hover:bg-indigo-500/20 text-[11px] font-medium transition-colors"
                        >
                          <FiPaperclip className="w-3 h-3 text-indigo-400" />
                          <span className="max-w-[100px] truncate">{item.documentName || 'View Document'}</span>
                          <FiEye className="w-3 h-3 ml-0.5 text-indigo-400" />
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-500 italic">No document</span>
                      )}
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
                      <span className="font-semibold text-slate-200 block">
                        {typeof item.reviewedBy === 'object' ? item.reviewedBy.name : item.reviewedBy}
                      </span>
                      <span className="text-[11px] text-slate-400 italic block mt-0.5">
                        {item.remarks || 'No remarks provided'}
                      </span>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-12 text-center text-slate-400">
                    No leave applications found matching current criteria.
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
        title="Apply for Student Leave / Absence"
      >
        {submitSuccess ? (
          <div className="py-8 text-center space-y-3">
            <FiCheckCircle className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="text-base font-bold text-white">Leave Application Submitted!</h4>
            <p className="text-xs text-slate-400">Your leave request has been submitted and sent to your faculty advisor for review.</p>
          </div>
        ) : (
          <form onSubmit={handleFormSubmit} className="space-y-4">
            
            {/* Category */}
            <div className="input-group mb-0">
              <label className="input-label">Leave Category / Reason Type *</label>
              <select
                value={form.leaveType}
                onChange={(e) => setForm({ ...form, leaveType: e.target.value })}
                className="input-field text-xs bg-slate-900"
              >
                <option value="Medical">Medical Leave (Sick / Hospitalized)</option>
                <option value="Personal Emergency">Personal / Family Emergency</option>
                <option value="Official Event">Official Event / University Representation</option>
                <option value="Duty Leave">Academic Duty Leave</option>
              </select>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-3">
              <div className="input-group mb-0">
                <label className="input-label">Start Date *</label>
                <input
                  type="date"
                  required
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="input-field text-xs bg-slate-900"
                />
              </div>

              <div className="input-group mb-0">
                <label className="input-label">End Date *</label>
                <input
                  type="date"
                  required
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  className="input-field text-xs bg-slate-900"
                />
              </div>
            </div>

            {/* Reason */}
            <div className="input-group mb-0">
              <label className="input-label">Reason & Details *</label>
              <textarea
                rows="3"
                required
                placeholder="State the detailed reason for your absence..."
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                className="input-field text-xs bg-slate-900"
              />
            </div>

            {/* Upload Document */}
            <div className="input-group mb-0">
              <label className="input-label flex items-center justify-between">
                <span>Upload Supporting Document (Optional)</span>
                <span className="text-[10px] text-slate-400">PDF, JPG, PNG, DOCX</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                  onChange={handleFileChange}
                  className="input-field text-xs file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600/30 file:text-indigo-200 hover:file:bg-indigo-600/50 bg-slate-900"
                />
              </div>
              {uploadingFile && (
                <div className="text-[11px] text-amber-400 mt-1 flex items-center gap-1.5">
                  <FiClock className="w-3 h-3 animate-spin" /> Uploading document file to server...
                </div>
              )}
              {form.documentName && !uploadingFile && (
                <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1.5 font-medium">
                  <FiCheckCircle className="w-3 h-3 text-emerald-400" /> Attached: {form.documentName}
                </div>
              )}
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || uploadingFile}
              className="btn btn-primary w-full py-2.5 text-xs font-semibold flex items-center justify-center gap-2"
            >
              <FiSend className="w-4 h-4" />
              <span>{loading ? 'Submitting Leave Application...' : 'Submit Leave Application'}</span>
            </button>
          </form>
        )}
      </Modal>

      {/* Preview Document Modal */}
      {previewDoc && (
        <Modal
          isOpen={!!previewDoc}
          onClose={() => setPreviewDoc(null)}
          title={`Document Attachment: ${previewDoc.name}`}
        >
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-3">
              <FiPaperclip className="w-10 h-10 text-indigo-400 mx-auto" />
              <div className="text-sm font-semibold text-white">{previewDoc.name}</div>
              <p className="text-xs text-slate-400">Attached supporting document for leave verification.</p>
              
              {previewDoc.url && (
                <div className="pt-2 flex justify-center gap-3">
                  <a 
                    href={previewDoc.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-primary py-2 px-4 text-xs inline-flex items-center gap-2"
                  >
                    <FiExternalLink className="w-3.5 h-3.5" />
                    <span>Open / Download Document</span>
                  </a>
                </div>
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
