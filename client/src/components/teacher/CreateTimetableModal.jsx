import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { FiCalendar, FiClock, FiPlusCircle, FiCheck, FiEdit2 } from 'react-icons/fi';
import { createTimetableApi, updateTimetableApi } from '../../services/api';

const PRESET_COLORS = [
  { label: 'Indigo', value: '#6366f1' },
  { label: 'Cyan', value: '#06b6d4' },
  { label: 'Emerald', value: '#10b981' },
  { label: 'Amber', value: '#f59e0b' },
  { label: 'Rose', value: '#f43f5e' },
  { label: 'Violet', value: '#8b5cf6' },
  { label: 'Pink', value: '#ec4899' }
];

export default function CreateTimetableModal({ isOpen, onClose, onSaved, editSlot = null }) {
  const [formData, setFormData] = useState({
    day: 'Monday',
    subject: '',
    subjectCode: '',
    startTime: '09:00 AM',
    endTime: '10:30 AM',
    room: '',
    section: 'Sec A',
    department: 'Computer Science & Engineering',
    instructor: 'Dr. Sarah Jenkins',
    color: '#6366f1'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editSlot) {
      setFormData({
        day: editSlot.day || 'Monday',
        subject: editSlot.subject || '',
        subjectCode: editSlot.subjectCode || '',
        startTime: editSlot.startTime || '09:00 AM',
        endTime: editSlot.endTime || '10:30 AM',
        room: editSlot.room || '',
        section: editSlot.section || 'Sec A',
        department: editSlot.department || 'Computer Science & Engineering',
        instructor: editSlot.instructor || 'Dr. Sarah Jenkins',
        color: editSlot.color || '#6366f1'
      });
    } else {
      setFormData({
        day: 'Monday',
        subject: '',
        subjectCode: '',
        startTime: '09:00 AM',
        endTime: '10:30 AM',
        room: '',
        section: 'Sec A',
        department: 'Computer Science & Engineering',
        instructor: 'Dr. Sarah Jenkins',
        color: '#6366f1'
      });
    }
  }, [editSlot, isOpen]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subject || !formData.subjectCode || !formData.room || !formData.startTime || !formData.endTime) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const payload = {
        ...formData,
        subjectCode: formData.subjectCode.toUpperCase(),
        timeSlot: `${formData.startTime} - ${formData.endTime}`
      };

      let result = null;
      if (editSlot?.id || editSlot?._id) {
        const id = editSlot._id || editSlot.id;
        try {
          const res = await updateTimetableApi(id, payload);
          if (res?.success) result = res.data;
        } catch (err) {
          console.warn('Backend update failed, using local result:', err);
          result = { ...payload, id, _id: id };
        }
      } else {
        try {
          const res = await createTimetableApi(payload);
          if (res?.success) result = res.data;
        } catch (err) {
          console.warn('Backend create failed, using local result:', err);
          result = { ...payload, id: 'TT-' + Date.now(), _id: 'TT-' + Date.now() };
        }
      }

      if (onSaved) {
        onSaved(result || payload);
      }

      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save timetable slot');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editSlot ? 'Edit Timetable Class Slot' : 'Create New Timetable Class Slot'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs font-semibold text-rose-400">
            {error}
          </div>
        )}

        {/* Day & Department Row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Day of Week *</label>
            <select
              name="day"
              value={formData.day}
              onChange={handleChange}
              className="input-field text-xs bg-slate-900"
            >
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
              <option value="Saturday">Saturday</option>
              <option value="Sunday">Sunday</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Section / Batch *</label>
            <select
              name="section"
              value={formData.section}
              onChange={handleChange}
              className="input-field text-xs bg-slate-900"
            >
              <option value="Sec A">Sec A</option>
              <option value="Sec B">Sec B</option>
              <option value="Sec C">Sec C</option>
              <option value="Lab Batch 1">Lab Batch 1</option>
            </select>
          </div>
        </div>

        {/* Subject Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Subject Name *</label>
          <input
            type="text"
            name="subject"
            placeholder="e.g. Database Management Systems"
            value={formData.subject}
            onChange={handleChange}
            required
            className="input-field text-xs bg-slate-900"
          />
        </div>

        {/* Code & Room */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Subject Code *</label>
            <input
              type="text"
              name="subjectCode"
              placeholder="e.g. CS401"
              value={formData.subjectCode}
              onChange={handleChange}
              required
              className="input-field text-xs bg-slate-900 uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Room / Venue *</label>
            <input
              type="text"
              name="room"
              placeholder="e.g. Lab 301 / Hall B"
              value={formData.room}
              onChange={handleChange}
              required
              className="input-field text-xs bg-slate-900"
            />
          </div>
        </div>

        {/* Start Time & End Time */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Start Time *</label>
            <input
              type="text"
              name="startTime"
              placeholder="e.g. 09:00 AM"
              value={formData.startTime}
              onChange={handleChange}
              required
              className="input-field text-xs bg-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">End Time *</label>
            <input
              type="text"
              name="endTime"
              placeholder="e.g. 10:30 AM"
              value={formData.endTime}
              onChange={handleChange}
              required
              className="input-field text-xs bg-slate-900"
            />
          </div>
        </div>

        {/* Instructor & Department */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Instructor Name</label>
            <input
              type="text"
              name="instructor"
              placeholder="e.g. Dr. Sarah Jenkins"
              value={formData.instructor}
              onChange={handleChange}
              className="input-field text-xs bg-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
            <input
              type="text"
              name="department"
              placeholder="e.g. Computer Science & Engineering"
              value={formData.department}
              onChange={handleChange}
              className="input-field text-xs bg-slate-900"
            />
          </div>
        </div>

        {/* Theme Color Picker */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">Subject Color Tag</label>
          <div className="flex items-center gap-2">
            {PRESET_COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setFormData({ ...formData, color: c.value })}
                className={`w-7 h-7 rounded-lg transition-transform flex items-center justify-center ${
                  formData.color === c.value ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-slate-950' : 'hover:scale-105'
                }`}
                style={{ backgroundColor: c.value }}
                title={c.label}
              >
                {formData.color === c.value && <FiCheck className="w-3.5 h-3.5 text-white" />}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary px-4 py-2 text-xs"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary px-5 py-2 text-xs font-semibold shadow-lg shadow-indigo-600/30"
          >
            {editSlot ? <FiEdit2 className="w-4 h-4" /> : <FiPlusCircle className="w-4 h-4" />}
            <span>{loading ? 'Saving...' : editSlot ? 'Update Timetable Slot' : 'Save Timetable Slot'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
