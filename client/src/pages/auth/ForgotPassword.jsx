import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import { HiOutlineAcademicCap } from 'react-icons/hi2';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 py-12 relative overflow-hidden">
        <div className="w-full max-w-md glass-panel p-8 border-slate-800 shadow-2xl relative z-10">
          
          <div className="text-center mb-6">
            <div className="inline-flex p-3 bg-amber-600/20 rounded-2xl border border-amber-500/30 text-amber-400 mb-3">
              <HiOutlineAcademicCap className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-extrabold text-white">Reset Password</h2>
            <p className="text-xs text-slate-400 mt-1">Enter your registered email to receive recovery instructions</p>
          </div>

          {submitted ? (
            <div className="p-6 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-center space-y-4">
              <FiCheckCircle className="w-10 h-10 text-indigo-400 mx-auto" />
              <div>
                <h4 className="text-base font-bold text-white">Recovery Link Sent</h4>
                <p className="text-xs text-slate-300 mt-1">We sent a reset link to <strong className="text-indigo-300">{email}</strong>.</p>
              </div>
              <Link to="/reset-password" className="btn btn-primary w-full py-2.5 text-xs font-semibold">
                Proceed to Reset Password Page
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="input-group">
                <label className="input-label">Registered University Email</label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex.rivera@university.edu"
                    className="input-field pl-9 text-xs"
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-full py-3 text-xs font-semibold">
                Send Reset Link
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-xs">
            <Link to="/login" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors">
              <FiArrowLeft className="w-4 h-4" />
              <span>Back to Login</span>
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
