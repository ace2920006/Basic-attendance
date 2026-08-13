import React, { useState } from 'react';
import Modal from '../common/Modal';
import { FiBookOpen, FiPlusCircle } from 'react-icons/fi';
import { createClassApi } from '../../services/api';

export default function CreateClassModal({ isOpen, onClose, onClassCreated }) {
  const [formData, setFormData] = useState({
    subject: '',
    subjectCode: '',
    section: 'Sec A',
    room: '',
    timeSlot: '09:00 AM - 10:30 AM',
    department: 'Computer Science',
    studentsCount: 40
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subject || !formData.subjectCode || !formData.room || !formData.timeSlot) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      let createdData = null;
      try {
        const res = await createClassApi(formData);
        if (res?.success) {
          createdData = res.data;
        }
      } catch (err) {
        console.warn('Backend unavailable, generating local class:', err);
      }

      const newClassObj = createdData || {
        id: 'TC-' + Date.now(),
        subject: `${formData.subject} (${formData.subjectCode.toUpperCase()})`,
        subjectCode: formData.subjectCode.toUpperCase(),
        section: formData.section,
        time: formData.timeSlot,
        room: formData.room,
        studentsCount: Number(formData.studentsCount),
        marked: false,
        present: 0,
        absent: 0,
        late: 0
      };

      if (onClassCreated) {
        onClassCreated(newClassObj);
      }

      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create class');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Class Session">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs font-semibold text-rose-400">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Subject Name *</label>
          <input
            type="text"
            name="subject"
            placeholder="e.g. Advanced Machine Learning"
            value={formData.subject}
            onChange={handleChange}
            required
            className="input-field text-xs bg-slate-900"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Subject Code *</label>
            <input
              type="text"
              name="subjectCode"
              placeholder="e.g. CS601"
              value={formData.subjectCode}
              onChange={handleChange}
              required
              className="input-field text-xs bg-slate-900 uppercase"
            />
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

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Room / Venue *</label>
            <input
              type="text"
              name="room"
              placeholder="e.g. Lab 402 / Hall B"
              value={formData.room}
              onChange={handleChange}
              required
              className="input-field text-xs bg-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Time Slot *</label>
            <select
              name="timeSlot"
              value={formData.timeSlot}
              onChange={handleChange}
              className="input-field text-xs bg-slate-900"
            >
              <option value="09:00 AM - 10:30 AM">09:00 AM - 10:30 AM</option>
              <option value="10:30 AM - 12:00 PM">10:30 AM - 12:00 PM</option>
              <option value="01:30 PM - 03:00 PM">01:30 PM - 03:00 PM</option>
              <option value="03:30 PM - 05:00 PM">03:30 PM - 05:00 PM</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="input-field text-xs bg-slate-900"
            >
              <option value="Computer Science">Computer Science</option>
              <option value="Electrical Engineering">Electrical Engineering</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
              <option value="Information Technology">Information Technology</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Enrolled Capacity</label>
            <input
              type="number"
              name="studentsCount"
              value={formData.studentsCount}
              onChange={handleChange}
              min="1"
              max="200"
              className="input-field text-xs bg-slate-900"
            />
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
            <FiPlusCircle className="w-4 h-4" />
            <span>{loading ? 'Creating...' : 'Create Class Session'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
