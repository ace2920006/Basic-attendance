import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiBook, FiHash, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { HiOutlineAcademicCap } from 'react-icons/hi2';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { useAuth } from '../../context/AuthContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: 'Computer Science & Engineering',
    idNumber: '',
    password: '',
    confirmPassword: ''
  });

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role,
        department: formData.department,
        rollNo: role === 'student' ? formData.idNumber : '',
        designation: role === 'teacher' ? 'Assistant Professor' : ''
      };

      const res = await register(payload);
      if (res?.success) {
        const destRole = res.user?.role || role;
        navigate(`/${destRole}`);
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 py-12 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-cyan-600/15 rounded-full blur-[140px] pointer-events-none" />

        <div className="w-full max-w-lg glass-panel p-8 border-slate-800 shadow-2xl relative z-10">
          
          <div className="text-center mb-6">
            <div className="inline-flex p-3 bg-cyan-600/20 rounded-2xl border border-cyan-500/30 text-cyan-400 mb-3">
              <HiOutlineAcademicCap className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-extrabold text-white">Create Your Account</h2>
            <p className="text-xs text-slate-400 mt-1">Register for AttendPro access as a Student or Faculty member</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
              <FiAlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Role Selection & Admin Provisioning Notice */}
          <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-indigo-500/30 mb-6 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-indigo-300">
              <span className="flex items-center gap-1.5">
                <FiUser className="w-4 h-4 text-indigo-400" /> Account Type: Student Registration
              </span>
              <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-md text-[10px] font-mono uppercase">Verified</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              🛡️ <strong>Security Notice:</strong> Public self-registration creates Student accounts. Faculty (Teacher) and Administrator accounts are provisioned directly by authorized institutional administrators.
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            
            <div className="input-group mb-0">
              <label className="input-label">Full Name</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Alex Rivera"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field pl-9 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="input-group mb-0">
                <label className="input-label">University Email</label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input 
                    type="email" 
                    required
                    placeholder="name@univ.edu"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-field pl-9 text-xs"
                  />
                </div>
              </div>

              <div className="input-group mb-0">
                <label className="input-label">{role === 'student' ? 'Roll / Enrollment No.' : 'Faculty ID Number'}</label>
                <div className="relative">
                  <FiHash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input 
                    type="text" 
                    required
                    placeholder={role === 'student' ? 'CS-2024-089' : 'TCH-1004'}
                    value={formData.idNumber}
                    onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                    className="input-field pl-9 text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="input-group mb-0">
              <label className="input-label">Department</label>
              <div className="relative">
                <FiBook className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <select 
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="input-field pl-9 text-xs bg-slate-900"
                >
                  <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                  <option value="Electrical Engineering">Electrical Engineering</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="Business Administration">Business Administration</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="input-group mb-0">
                <label className="input-label">Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input 
                    type="password" 
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input-field pl-9 text-xs"
                  />
                </div>
              </div>

              <div className="input-group mb-0">
                <label className="input-label">Confirm Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input 
                    type="password" 
                    required
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="input-field pl-9 text-xs"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-3 text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Creating Account...</span>
              ) : (
                <>
                  <FiCheckCircle className="w-4 h-4" />
                  <span>Complete Registration</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400 border-t border-slate-800/80 pt-4">
            Already registered?{' '}
            <Link to="/login" className="text-indigo-400 font-semibold hover:underline">
              Sign In Here
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
