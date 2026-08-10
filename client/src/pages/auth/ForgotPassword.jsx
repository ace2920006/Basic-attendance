import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiArrowLeft, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { HiOutlineAcademicCap } from 'react-icons/hi2';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { useAuth } from '../../context/AuthContext';

export default function ForgotPassword() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetData, setResetData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await forgotPassword(email);
      if (res?.success) {
        setResetData(res);
        setSubmitted(true);
      } else {
        setError(res?.message || 'Failed to send password reset request.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
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

          {error && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
              <FiAlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {submitted ? (
            <div className="p-6 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-center space-y-4">
              <FiCheckCircle className="w-10 h-10 text-indigo-400 mx-auto" />
              <div>
                <h4 className="text-base font-bold text-white">Recovery Link Sent</h4>
                <p className="text-xs text-slate-300 mt-1">We sent a reset link to <strong className="text-indigo-300">{email}</strong>.</p>
              </div>

              {resetData?.resetToken && (
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-left text-[11px] font-mono text-slate-400 break-all space-y-1">
                  <div className="text-indigo-400 font-semibold">Demo Reset Token:</div>
                  <div>{resetData.resetToken}</div>
                </div>
              )}

              <Link
                to={resetData?.resetToken ? `/reset-password?token=${resetData.resetToken}` : '/reset-password'}
                className="btn btn-primary w-full py-2.5 text-xs font-semibold block text-center"
              >
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

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full py-3 text-xs font-semibold flex items-center justify-center gap-2"
              >
                {loading ? <span>Generating Reset Link...</span> : <span>Send Reset Link</span>}
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
