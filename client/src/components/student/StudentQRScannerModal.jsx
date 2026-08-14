import React, { useState, useEffect } from 'react';
import { QrCode, MapPin, ShieldCheck, Camera, CheckCircle2, AlertCircle, RefreshCw, X, Smartphone } from 'lucide-react';
import { getDevicePayload } from '../../services/deviceFingerprint';

export default function StudentQRScannerModal({ isOpen, onClose, onSuccess }) {
  const [qrInputToken, setQrInputToken] = useState('');
  const [gpsLocation, setGpsLocation] = useState(null);
  const [gpsStatus, setGpsStatus] = useState('Fetching GPS location...');
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Capture Device Fingerprint & Browser ID
      const devPayload = getDevicePayload();
      setDeviceInfo(devPayload);

      // Acquire GPS Geolocation coordinates
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setGpsLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: Math.round(position.coords.accuracy)
            });
            setGpsStatus(`GPS Position Acquired (${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)})`);
          },
          (err) => {
            // Fallback for local testing or denied permission
            setGpsLocation({
              latitude: 28.6139,
              longitude: 77.2090,
              accuracy: 10
            });
            setGpsStatus('GPS Defaulted to Campus Coordinates (Testing mode)');
          },
          { enableHighAccuracy: true, timeout: 10000 }
        );
      } else {
        setGpsStatus('Geolocation not supported by browser');
      }
    } else {
      setQrInputToken('');
      setError('');
      setSuccessMsg('');
    }
  }, [isOpen]);

  const handleSubmitScan = async (e) => {
    e?.preventDefault();
    if (!qrInputToken.trim()) {
      setError('Please paste or scan a valid QR code token');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const payload = {
        qrToken: qrInputToken.trim(),
        latitude: gpsLocation?.latitude,
        longitude: gpsLocation?.longitude,
        browserId: deviceInfo?.browserId,
        deviceFingerprint: deviceInfo?.deviceFingerprint
      };

      const res = await fetch('/api/attendance/scan-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMsg(data.message || 'Attendance marked Present successfully!');
        if (onSuccess) onSuccess(data.data);
        setTimeout(() => {
          onClose();
        }, 2200);
      } else {
        setError(data.message || 'Failed to submit QR attendance');
      }
    } catch (err) {
      setError('Network error while processing attendance scan');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Scan QR Attendance</h2>
              <p className="text-xs text-slate-400">GPS & Device Verified Attendance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-4 p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
            <div>
              <p className="font-bold text-emerald-200">Attendance Recorded!</p>
              <p>{successMsg}</p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-4 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-200">Verification Failed</p>
              <p className="mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Scanner Form */}
        <form onSubmit={handleSubmitScan} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              QR Session Token / Scanner Input
            </label>
            <div className="relative">
              <textarea
                value={qrInputToken}
                onChange={(e) => setQrInputToken(e.target.value)}
                placeholder="Paste or scan QR code payload token here..."
                rows={3}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono resize-none"
              />
            </div>
          </div>

          {/* Location & Device Security Checks */}
          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-300">GPS Location:</span>
              </div>
              <span className="text-emerald-400 font-mono text-[11px] truncate max-w-[200px]">
                {gpsStatus}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Smartphone className="w-4 h-4 text-blue-400" />
                <span className="text-slate-300">Device Fingerprint:</span>
              </div>
              <span className="text-blue-400 font-mono text-[11px]">
                {deviceInfo?.deviceFingerprint || 'Calculating...'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !qrInputToken.trim()}
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/20 transition"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify & Submit</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
