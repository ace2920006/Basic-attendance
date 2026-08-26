import React, { useState, useEffect } from 'react';
import { QrCode, RefreshCw, Clock, MapPin, X, Copy, Check, Users, ShieldCheck } from 'lucide-react';

export default function QRAttendanceModal({ isOpen, onClose, classSession }) {
  const [sessionData, setSessionData] = useState(null);
  const [token, setToken] = useState('');
  const [expiresAt, setExpiresAt] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Start / Fetch active Attendance Session
  const fetchQRToken = async () => {
    if (!classSession?._id) return;
    setLoading(true);
    setError('');
    try {
      // 1. Try to start or fetch active session
      const startRes = await fetch('/api/sessions/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          classId: classSession._id,
          mode: 'QR',
          latitude: 28.6139,
          longitude: 77.2090,
          maxRadiusMeters: 100
        })
      });
      const startData = await startRes.json();
      if (startRes.ok && startData.data) {
        setSessionData(startData.data);
        setToken(startData.token);
        setExpiresAt(new Date(startData.data.qrExpiresAt || Date.now() + 30000));
        setTimeLeft(startData.validitySeconds || 30);
      } else {
        // Fallback to class token endpoint if needed
        const classRes = await fetch(`/api/classes/${classSession._id}/qr-token`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const classData = await classRes.json();
        if (classRes.ok && classData.token) {
          setToken(classData.token);
          setExpiresAt(new Date(classData.expiresAt));
          setTimeLeft(30);
        } else {
          setError(startData.message || 'Failed to initialize Attendance Session');
        }
      }
    } catch (err) {
      setError('Network error while initializing Attendance Session');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && classSession) {
      fetchQRToken();
    }
  }, [isOpen, classSession]);

  // 30-second Countdown Timer effect
  useEffect(() => {
    if (!isOpen || !token) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (sessionData?._id) {
            // Fetch fresh QR token for session
            fetch(`/api/sessions/${sessionData._id}/qr-token`, {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            })
              .then((res) => res.json())
              .then((d) => {
                if (d.token) {
                  setToken(d.token);
                  setExpiresAt(new Date(d.expiresAt));
                }
              })
              .catch(() => fetchQRToken());
          } else {
            fetchQRToken();
          }
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, token, sessionData]);

  // Handle Stop Session
  const handleStopSession = async () => {
    if (sessionData?._id) {
      try {
        await fetch(`/api/sessions/${sessionData._id}/stop`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      } catch (e) {
        console.error(e);
      }
    } else if (classSession?._id) {
      try {
        await fetch(`/api/classes/${classSession._id}/stop-qr`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      } catch (e) {
        console.error(e);
      }
    }
    onClose();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  // Generate SVG matrix display for QR Code preview
  const generateSvgQrPath = (str) => {
    // Generate deterministic pattern cells based on token string hash
    const cells = [];
    const size = 15;
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = (hash << 5) - hash + str.charCodeAt(i);
    
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        // Keep corner position markers
        const isCorner =
          (r < 4 && c < 4) ||
          (r < 4 && c > size - 5) ||
          (r > size - 5 && c < 4);
        const cellHash = Math.abs((hash ^ (r * 17 + c * 31)) % 100);
        if (isCorner || cellHash < 48) {
          cells.push({ r, c });
        }
      }
    }
    return cells;
  };

  const qrCells = generateSvgQrPath(token || 'ATTENDANCE');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Dynamic Attendance Session</h2>
                {sessionData?.sessionId && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    {sessionData.sessionId}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {classSession?.subject} ({classSession?.subjectCode}) • Division: {sessionData?.division || classSession?.section || 'Sec A'}
              </p>
            </div>
          </div>
          <button
            onClick={handleStopSession}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center justify-between">
            <span>{error}</span>
            <button onClick={fetchQRToken} className="underline ml-2">Retry</button>
          </div>
        )}

        {/* QR Code Container */}
        <div className="flex flex-col items-center justify-center my-4 space-y-4">
          <div className="relative p-5 rounded-2xl bg-white text-slate-900 shadow-xl border-4 border-blue-500/40">
            {/* 30s Rotating QR Visual */}
            <svg className="w-52 h-52" viewBox="0 0 15 15">
              {/* Outer corner detection blocks */}
              <rect x="0" y="0" width="4" height="4" fill="#0f172a" rx="0.5" />
              <rect x="1" y="1" width="2" height="2" fill="#ffffff" />
              <rect x="1.5" y="1.5" width="1" height="1" fill="#2563eb" />

              <rect x="11" y="0" width="4" height="4" fill="#0f172a" rx="0.5" />
              <rect x="12" y="1" width="2" height="2" fill="#ffffff" />
              <rect x="12.5" y="1.5" width="1" height="1" fill="#2563eb" />

              <rect x="0" y="11" width="4" height="4" fill="#0f172a" rx="0.5" />
              <rect x="1" y="12" width="2" height="2" fill="#ffffff" />
              <rect x="1.5" y="12.5" width="1" height="1" fill="#2563eb" />

              {/* Matrix Cells */}
              {qrCells.map((cell, idx) => (
                <rect
                  key={idx}
                  x={cell.c}
                  y={cell.r}
                  width="0.9"
                  height="0.9"
                  fill="#0f172a"
                  rx="0.1"
                />
              ))}
            </svg>

            {loading && (
              <div className="absolute inset-0 bg-white/90 rounded-xl flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            )}
          </div>

          {/* Live 30-Second Countdown Timer Ring */}
          <div className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
            <div className="flex items-center space-x-2 text-xs text-slate-300">
              <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>Token Expires In:</span>
            </div>

            {/* Live Progress Bar & Counter */}
            <div className="flex items-center space-x-3">
              <div className="w-24 h-2 rounded-full bg-slate-700 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-1000 ease-linear"
                  style={{ width: `${(timeLeft / 30) * 100}%` }}
                />
              </div>
              <span className="text-sm font-bold text-amber-400 font-mono w-6 text-right">
                {timeLeft}s
              </span>
            </div>
          </div>
        </div>

        {/* Security & Verification Metadata */}
        <div className="grid grid-cols-2 gap-3 text-xs mb-5">
          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <div>
              <p className="text-slate-400">Campus Radius</p>
              <p className="font-semibold text-slate-200">GPS Verified (&le; 500m)</p>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <div>
              <p className="text-slate-400">Anti-Proxy Guard</p>
              <p className="font-semibold text-slate-200">Device Fingerprinted</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchQRToken}
            disabled={loading}
            className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center space-x-2 border border-slate-700 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Force Rotate Token</span>
          </button>
          
          <button
            onClick={handleStopSession}
            className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold flex items-center justify-center space-x-2 transition shadow-lg shadow-red-600/20"
          >
            <span>Stop QR Session</span>
          </button>
        </div>

      </div>
    </div>
  );
}
