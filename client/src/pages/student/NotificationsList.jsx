import React, { useState } from 'react';
import { FiBell, FiAlertTriangle, FiCheckCircle, FiInfo, FiPlus } from 'react-icons/fi';
import { studentNotifications } from '../../data/mockData';
import Modal from '../../components/common/Modal';

export default function NotificationsList() {
  const [notifications, setNotifications] = useState(studentNotifications);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveForm, setLeaveForm] = useState({ date: '', reason: '', type: 'Medical' });
  const [leaveSubmitted, setLeaveSubmitted] = useState(false);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  const handleLeaveSubmit = (e) => {
    e.preventDefault();
    setLeaveSubmitted(true);
    setTimeout(() => {
      setLeaveSubmitted(false);
      setIsLeaveModalOpen(false);
      setLeaveForm({ date: '', reason: '', type: 'Medical' });
    }, 1800);
  };

  return (
    <div className="space-y-6">
      
      <div className="glass-panel p-6 border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <FiBell className="w-5 h-5 text-indigo-400" />
            System Notifications & Alerts
          </h3>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsLeaveModalOpen(true)}
              className="btn btn-primary py-1.5 px-3 text-xs"
            >
              <FiPlus className="w-4 h-4" />
              <span>Apply for Leave</span>
            </button>
            <button 
              onClick={markAllRead}
              className="text-xs text-indigo-400 hover:underline"
            >
              Mark all as read
            </button>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          {notifications.map((notif) => (
            <div 
              key={notif.id}
              className={`p-4 rounded-xl border transition-all flex items-start gap-3 ${
                notif.unread ? 'bg-indigo-950/20 border-indigo-500/30' : 'bg-slate-950/40 border-slate-800'
              }`}
            >
              <div className="mt-0.5">
                {notif.type === 'warning' && <FiAlertTriangle className="w-5 h-5 text-rose-400" />}
                {notif.type === 'success' && <FiCheckCircle className="w-5 h-5 text-emerald-400" />}
                {notif.type === 'info' && <FiInfo className="w-5 h-5 text-cyan-400" />}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-white">{notif.title}</h4>
                  <span className="text-[10px] text-slate-400">{notif.time}</span>
                </div>
                <p className="text-xs text-slate-300 mt-1">{notif.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leave Modal */}
      <Modal 
        isOpen={isLeaveModalOpen} 
        onClose={() => setIsLeaveModalOpen(false)}
        title="Apply for Absence / Medical Leave"
      >
        {leaveSubmitted ? (
          <div className="py-8 text-center space-y-3">
            <FiCheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
            <h4 className="text-base font-bold text-white">Leave Request Submitted</h4>
            <p className="text-xs text-slate-400">Your application has been routed to your department head for verification.</p>
          </div>
        ) : (
          <form onSubmit={handleLeaveSubmit} className="space-y-4">
            <div className="input-group mb-0">
              <label className="input-label">Leave Type</label>
              <select 
                value={leaveForm.type}
                onChange={(e) => setLeaveForm({ ...leaveForm, type: e.target.value })}
                className="input-field text-xs bg-slate-900"
              >
                <option value="Medical">Medical Leave</option>
                <option value="Official Event">Official Campus Event</option>
                <option value="Personal Emergency">Personal Emergency</option>
              </select>
            </div>

            <div className="input-group mb-0">
              <label className="input-label">Date of Absence</label>
              <input 
                type="date"
                required
                value={leaveForm.date}
                onChange={(e) => setLeaveForm({ ...leaveForm, date: e.target.value })}
                className="input-field text-xs"
              />
            </div>

            <div className="input-group mb-0">
              <label className="input-label">Reason & Details</label>
              <textarea 
                rows="3"
                required
                placeholder="Explain the reason for leave..."
                value={leaveForm.reason}
                onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                className="input-field text-xs"
              />
            </div>

            <button type="submit" className="btn btn-primary w-full py-2.5 text-xs font-semibold">
              Submit Leave Request
            </button>
          </form>
        )}
      </Modal>

    </div>
  );
}
