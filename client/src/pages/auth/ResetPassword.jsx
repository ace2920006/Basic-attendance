import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiLock, FiCheckCircle } from 'react-icons/fi';
import { HiOutlineAcademicCap } from 'react-icons/hi2';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [completed, setCompleted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setCompleted(true);
    setTimeout(() => {
      navigate('/login');
    }, 2500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 py-12 relative overflow-hidden">
        <div className="w-full max-w-md glass-panel p-8 border-slate-800 shadow-2xl relative z-10">
          
          <div className="text-center mb-6">
            <div className="inline-flex p-3 bg-emerald-600/20 rounded-2xl border border-emerald-500/30 text-emerald-400 mb-3">
              <HiOutlineAcademicCap className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-extrabold text-white">Set New Password</h2>
            <p className="text-xs text-slate-400 mt-1">Please enter your new password below</p>
          </div>

          {completed ? (
            <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center space-y-3">
              <FiCheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
              <h4 className="text-base font-bold text-white">Password Reset Complete!</h4>
              <p className="text-xs text-slate-300">Redirecting to login page...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="input-group">
                <label className="input-label">New Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-field pl-9 text-xs"
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Confirm New Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input 
                    type="password" 
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-field pl-9 text-xs"
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-full py-3 text-xs font-semibold">
                Update Password
              </button>
            </form>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
