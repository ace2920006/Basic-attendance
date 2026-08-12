import React, { useState } from 'react';
import { 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiBookOpen, 
  FiEdit2, 
  FiLock, 
  FiCheckCircle, 
  FiShield,
  FiAward,
  FiBook
} from 'react-icons/fi';
import { currentUser, studentSubjects } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/common/Modal';

export default function StudentProfile() {
  const { user: authUser } = useAuth();
  const initialUser = authUser || currentUser.student;
  
  const [profile, setProfile] = useState({
    name: initialUser.name || 'Alex Rivera',
    rollNo: initialUser.rollNo || 'CS-2024-089',
    email: initialUser.email || 'alex.rivera@university.edu',
    phone: initialUser.phone || '+1 (555) 234-5678',
    address: initialUser.address || '42 Academic Drive, Innovation City, CA',
    department: initialUser.department || 'Computer Science & Engineering',
    course: initialUser.course || 'B.Tech Computer Science',
    semester: initialUser.semester || 'Semester 4',
    batch: initialUser.batch || '2024-2028',
    section: initialUser.section || 'Sec A',
    advisor: initialUser.advisor || 'Dr. Sarah Jenkins',
    avatar: initialUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    phone: profile.phone,
    address: profile.address,
    avatar: profile.avatar
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });

  const handleEditSubmit = (e) => {
    e.preventDefault();
    setProfile({
      ...profile,
      phone: editForm.phone,
      address: editForm.address,
      avatar: editForm.avatar
    });
    setIsEditModalOpen(false);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordForm.newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setPasswordMsg({ type: 'success', text: 'Password updated successfully!' });
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setTimeout(() => setPasswordMsg({ type: '', text: '' }), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Avatar Header */}
      <div className="glass-panel p-6 border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/50 to-slate-900 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          
          <div className="flex items-center gap-5">
            <div className="relative">
              <img 
                src={profile.avatar} 
                alt={profile.name} 
                className="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-500/50 shadow-xl shadow-indigo-500/20"
              />
              <span className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 rounded-full border-2 border-slate-950" title="Active Student Account"></span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-white tracking-tight">{profile.name}</h2>
                <span className="badge badge-present text-xs px-2.5 py-0.5 font-bold">Enrolled</span>
              </div>
              <p className="text-xs text-indigo-300 font-semibold">
                Roll No: <span className="text-white">{profile.rollNo}</span> • {profile.course} ({profile.semester})
              </p>
              <p className="text-xs text-slate-400">
                {profile.department} • Batch {profile.batch} ({profile.section})
              </p>
            </div>
          </div>

          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="btn btn-secondary text-xs py-2 px-4 flex items-center gap-2 self-start sm:self-auto"
          >
            <FiEdit2 className="w-4 h-4 text-indigo-400" />
            <span>Edit Contact Info</span>
          </button>

        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (7 cols): Personal Info & Enrolled Subjects */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Personal & Academic Details Card */}
          <div className="glass-panel p-6 border-slate-800 space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <FiUser className="w-5 h-5 text-indigo-400" />
              Personal & Academic Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 font-medium flex items-center gap-1.5"><FiMail className="w-3.5 h-3.5 text-cyan-400" /> University Email</span>
                <span className="font-semibold text-white block">{profile.email}</span>
              </div>

              <div className="space-y-1 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 font-medium flex items-center gap-1.5"><FiPhone className="w-3.5 h-3.5 text-emerald-400" /> Phone Number</span>
                <span className="font-semibold text-white block">{profile.phone}</span>
              </div>

              <div className="space-y-1 p-3 rounded-xl bg-slate-950/60 border border-slate-800 sm:col-span-2">
                <span className="text-slate-400 font-medium flex items-center gap-1.5"><FiMapPin className="w-3.5 h-3.5 text-amber-400" /> Residential Address</span>
                <span className="font-semibold text-white block">{profile.address}</span>
              </div>

              <div className="space-y-1 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 font-medium flex items-center gap-1.5"><FiUser className="w-3.5 h-3.5 text-indigo-400" /> Academic Advisor</span>
                <span className="font-semibold text-white block">{profile.advisor}</span>
              </div>

              <div className="space-y-1 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 font-medium flex items-center gap-1.5"><FiAward className="w-3.5 h-3.5 text-purple-400" /> Academic Batch</span>
                <span className="font-semibold text-white block">{profile.batch}</span>
              </div>
            </div>
          </div>

          {/* Enrolled Courses & Instructors */}
          <div className="glass-panel p-6 border-slate-800 space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <FiBook className="w-5 h-5 text-cyan-400" />
              Enrolled Academic Subjects ({studentSubjects.length})
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {studentSubjects.map(sub => (
                <div key={sub.id} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">{sub.code}</span>
                    <span className="text-xs font-bold text-emerald-400">{sub.percentage}%</span>
                  </div>
                  <h4 className="text-xs font-semibold text-white">{sub.name}</h4>
                  <span className="text-[11px] text-slate-400 block">{sub.instructor}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column (5 cols): Security & Account Management */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Security / Password Update Form */}
          <div className="glass-panel p-6 border-slate-800 space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <FiShield className="w-5 h-5 text-emerald-400" />
              Security & Password
            </h3>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="input-group mb-0">
                <label className="input-label">Current Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input 
                    type="password" 
                    required
                    placeholder="••••••••"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="input-field pl-9 text-xs"
                  />
                </div>
              </div>

              <div className="input-group mb-0">
                <label className="input-label">New Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input 
                    type="password" 
                    required
                    placeholder="At least 6 characters"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="input-field pl-9 text-xs"
                  />
                </div>
              </div>

              <div className="input-group mb-0">
                <label className="input-label">Confirm New Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input 
                    type="password" 
                    required
                    placeholder="Repeat new password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="input-field pl-9 text-xs"
                  />
                </div>
              </div>

              {passwordMsg.text && (
                <div className={`p-3 rounded-lg text-xs ${
                  passwordMsg.type === 'success' 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}>
                  {passwordMsg.text}
                </div>
              )}

              <button type="submit" className="btn btn-primary w-full py-2.5 text-xs font-semibold">
                Update Security Password
              </button>
            </form>
          </div>

        </div>

      </div>

      {/* Edit Contact Information Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Contact & Profile Details"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="input-group mb-0">
            <label className="input-label">Phone Number</label>
            <input 
              type="text" 
              required
              value={editForm.phone}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              className="input-field text-xs"
            />
          </div>

          <div className="input-group mb-0">
            <label className="input-label">Residential Address</label>
            <textarea 
              rows="3" 
              required
              value={editForm.address}
              onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
              className="input-field text-xs"
            />
          </div>

          <div className="input-group mb-0">
            <label className="input-label">Avatar Image URL</label>
            <input 
              type="url" 
              required
              value={editForm.avatar}
              onChange={(e) => setEditForm({ ...editForm, avatar: e.target.value })}
              className="input-field text-xs"
            />
          </div>

          <button type="submit" className="btn btn-primary w-full py-2.5 text-xs font-semibold">
            Save Profile Changes
          </button>
        </form>
      </Modal>

    </div>
  );
}
