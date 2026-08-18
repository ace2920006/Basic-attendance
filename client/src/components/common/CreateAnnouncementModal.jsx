import React, { useState } from 'react';
import Modal from './Modal';
import { useNotifications } from '../../context/NotificationContext';
import { FiMegaphone, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

export default function CreateAnnouncementModal({ isOpen, onClose }) {
  const { sendAnnouncement } = useNotifications();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetRole, setTargetRole] = useState('student');
  const [department, setDepartment] = useState('');
  const [type, setType] = useState('info');
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    try {
      setSubmitting(true);
      setStatusMsg(null);
      await sendAnnouncement({
        title,
        message,
        targetRole: targetRole === 'all' ? '' : targetRole,
        department: department || '',
        type
      });

      setStatusMsg({ success: true, text: 'Announcement broadcasted in real-time!' });
      setTimeout(() => {
        setTitle('');
        setMessage('');
        setStatusMsg(null);
        onClose();
      }, 1500);
    } catch (error) {
      setStatusMsg({ success: false, text: error.message || 'Failed to send announcement' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Broadcast Real-Time Announcement">
      {statusMsg?.success ? (
        <div className="py-8 text-center space-y-3">
          <FiCheckCircle className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
          <h4 className="text-base font-bold text-white">Announcement Delivered</h4>
          <p className="text-xs text-slate-400">Broadcast sent across all connected sockets & notification feeds.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {statusMsg?.success === false && (
            <div className="p-3 bg-rose-950/40 border border-rose-800/50 rounded-xl text-xs text-rose-300 flex items-center gap-2">
              <FiAlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{statusMsg.text}</span>
            </div>
          )}

          <div className="input-group mb-0">
            <label className="input-label">Announcement Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Midterm Exam Schedule Updated"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="input-group mb-0">
              <label className="input-label">Target Audience</label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="input-field text-xs bg-slate-900"
              >
                <option value="student">All Students</option>
                <option value="teacher">All Faculty Members</option>
                <option value="all">Entire Campus (All Users)</option>
              </select>
            </div>

            <div className="input-group mb-0">
              <label className="input-label">Alert Severity</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="input-field text-xs bg-slate-900"
              >
                <option value="info">Info (Cyan)</option>
                <option value="warning">Warning (Amber)</option>
                <option value="success">Success (Emerald)</option>
                <option value="error">Urgent / Critical (Rose)</option>
              </select>
            </div>
          </div>

          <div className="input-group mb-0">
            <label className="input-label">Target Department (Optional)</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="input-field text-xs bg-slate-900"
            >
              <option value="">All Departments</option>
              <option value="Computer Science & Engineering">Computer Science & Engineering</option>
              <option value="Electronics & Communication">Electronics & Communication</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
              <option value="Civil Engineering">Civil Engineering</option>
              <option value="Information Technology">Information Technology</option>
            </select>
          </div>

          <div className="input-group mb-0">
            <label className="input-label">Announcement Message</label>
            <textarea
              rows="4"
              required
              placeholder="Write the full announcement text here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="input-field text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary w-full py-2.5 text-xs font-semibold flex items-center justify-center gap-2"
          >
            <FiMegaphone className="w-4 h-4" />
            <span>{submitting ? 'Broadcasting...' : 'Send Live Announcement'}</span>
          </button>
        </form>
      )}
    </Modal>
  );
}
