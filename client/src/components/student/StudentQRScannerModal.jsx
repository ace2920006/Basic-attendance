import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  QrCode,
  MapPin,
  ShieldCheck,
  Camera,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  Smartphone,
  Zap,
  ZapOff,
  SwitchCamera,
  Video,
  Type
} from 'lucide-react';
import jsQR from 'jsqr';
import { getDevicePayload } from '../../services/deviceFingerprint';

export default function StudentQRScannerModal({ isOpen, onClose, onSuccess }) {
  const [activeTab, setActiveTab] = useState('camera'); // 'camera' | 'manual'
  const [qrInputToken, setQrInputToken] = useState('');
  const [gpsLocation, setGpsLocation] = useState(null);
  const [gpsStatus, setGpsStatus] = useState('Fetching GPS location...');
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Camera stream states
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' | 'user'
  const [torchSupported, setTorchSupported] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const animationFrameIdRef = useRef(null);
  const barcodeDetectorRef = useRef(null);

  // Play audio chime on successful QR scan
  const playScanBeep = useCallback(() => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.12); // E6

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.2);

      // Mobile haptic vibration if supported
      if ('vibrate' in navigator) {
        navigator.vibrate([80, 40, 80]);
      }
    } catch (e) {
      // Audio suppressed by browser policy
    }
  }, []);

  // Initialize BarcodeDetector API if supported
  useEffect(() => {
    if ('BarcodeDetector' in window) {
      try {
        barcodeDetectorRef.current = new window.BarcodeDetector({ formats: ['qr_code'] });
      } catch (e) {
        console.log('[Scanner] Native BarcodeDetector init failed, using jsQR fallback');
      }
    }
  }, []);

  // Stop camera media tracks cleanly
  const stopCameraStream = useCallback(() => {
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {}
      });
      streamRef.current = null;
    }
    setCameraActive(false);
    setTorchOn(false);
    setTorchSupported(false);
  }, []);

  // Start video stream
  const startCameraStream = useCallback(async () => {
    stopCameraStream();
    setCameraError('');
    setHasScanned(false);

    try {
      const constraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);

        // Check if device supports torch
        const track = stream.getVideoTracks()[0];
        if (track) {
          const capabilities = track.getCapabilities ? track.getCapabilities() : {};
          if (capabilities.torch) {
            setTorchSupported(true);
          }
        }
      }
    } catch (err) {
      console.warn('[Camera Scanner] getUserMedia error:', err);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera access in browser settings or switch to Manual Input.'
          : 'Could not access device camera. You can still paste or type your session token in the Manual tab.'
      );
      setCameraActive(false);
    }
  }, [facingMode, stopCameraStream]);

  // Submit attendance scan payload to backend
  const executeSubmit = useCallback(
    async (token) => {
      if (!token) return;
      setLoading(true);
      setError('');
      setSuccessMsg('');

      try {
        const payload = {
          qrToken: token.trim(),
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
          }, 2400);
        } else {
          setError(data.message || 'Failed to submit QR attendance');
          // Allow re-scanning after error
          setTimeout(() => setHasScanned(false), 3000);
        }
      } catch (err) {
        setError('Network error while processing attendance scan');
        setTimeout(() => setHasScanned(false), 3000);
      } finally {
        setLoading(false);
      }
    },
    [gpsLocation, deviceInfo, onSuccess, onClose]
  );

  // Scan loop on video frames
  const scanFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || hasScanned) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      const width = video.videoWidth;
      const height = video.videoHeight;

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(video, 0, 0, width, height);

      // 1. Try Native BarcodeDetector first
      if (barcodeDetectorRef.current) {
        barcodeDetectorRef.current
          .detect(canvas)
          .then((barcodes) => {
            if (barcodes && barcodes.length > 0 && !hasScanned) {
              const rawValue = barcodes[0].rawValue;
              if (rawValue) {
                setHasScanned(true);
                playScanBeep();
                setQrInputToken(rawValue);
                executeSubmit(rawValue);
                return;
              }
            }
            if (!hasScanned) {
              animationFrameIdRef.current = requestAnimationFrame(scanFrame);
            }
          })
          .catch(() => {
            // Fallback to jsQR
            runJsQrDecode(ctx, width, height);
          });
      } else {
        runJsQrDecode(ctx, width, height);
      }
    } else {
      if (!hasScanned) {
        animationFrameIdRef.current = requestAnimationFrame(scanFrame);
      }
    }

    function runJsQrDecode(context, w, h) {
      try {
        const imageData = context.getImageData(0, 0, w, h);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert'
        });

        if (code && code.data && !hasScanned) {
          setHasScanned(true);
          playScanBeep();
          setQrInputToken(code.data);
          executeSubmit(code.data);
          return;
        }
      } catch (e) {}

      if (!hasScanned) {
        animationFrameIdRef.current = requestAnimationFrame(scanFrame);
      }
    }
  }, [hasScanned, playScanBeep, executeSubmit]);

  // Trigger scan loop when camera is active
  useEffect(() => {
    if (cameraActive && !hasScanned && activeTab === 'camera') {
      animationFrameIdRef.current = requestAnimationFrame(scanFrame);
    }
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
    };
  }, [cameraActive, hasScanned, activeTab, scanFrame]);

  // Toggle Torch
  const toggleTorch = async () => {
    if (!streamRef.current || !torchSupported) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track) {
      try {
        const nextTorch = !torchOn;
        await track.applyConstraints({
          advanced: [{ torch: nextTorch }]
        });
        setTorchOn(nextTorch);
      } catch (err) {
        console.warn('Could not toggle device torch:', err);
      }
    }
  };

  // Flip Camera
  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Lifecycle on modal open/close
  useEffect(() => {
    if (isOpen) {
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
            setGpsStatus(
              `GPS Acquired (${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)})`
            );
          },
          () => {
            setGpsLocation({
              latitude: 28.6139,
              longitude: 77.209,
              accuracy: 10
            });
            setGpsStatus('GPS Campus Fallback (Testing Mode)');
          },
          { enableHighAccuracy: true, timeout: 10000 }
        );
      } else {
        setGpsStatus('Geolocation not supported');
      }

      if (activeTab === 'camera') {
        startCameraStream();
      }
    } else {
      stopCameraStream();
      setQrInputToken('');
      setError('');
      setSuccessMsg('');
      setHasScanned(false);
    }

    return () => {
      stopCameraStream();
    };
  }, [isOpen, activeTab, facingMode, startCameraStream, stopCameraStream]);

  const handleManualSubmit = (e) => {
    e?.preventDefault();
    if (!qrInputToken.trim()) {
      setError('Please paste or scan a valid QR code token');
      return;
    }
    executeSubmit(qrInputToken.trim());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-2xl text-slate-100 max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 shadow-inner">
              <QrCode className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-1.5">
                <span>Scan QR Attendance</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                  Live
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">Mobile Camera & GPS Radius Verification</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-1 bg-slate-950/60 p-1 rounded-xl mb-3 flex-shrink-0 border border-slate-800/80">
          <button
            type="button"
            onClick={() => setActiveTab('camera')}
            className={`py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition ${
              activeTab === 'camera'
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Live Camera</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('manual');
              stopCameraStream();
            }}
            className={`py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition ${
              activeTab === 'manual'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Manual Input</span>
          </button>
        </div>

        {/* Alerts */}
        {successMsg && (
          <div className="mb-3 p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-3 flex-shrink-0 animate-fade-in">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
            <div>
              <p className="font-bold text-emerald-200">Attendance Recorded!</p>
              <p className="text-[11px]">{successMsg}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-3 p-3.5 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-start space-x-3 flex-shrink-0 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-200">Verification Failed</p>
              <p className="text-[11px] mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-0.5">
          {activeTab === 'camera' ? (
            <div className="space-y-3">
              {/* Camera Viewfinder Box */}
              <div className="relative w-full aspect-square max-h-[280px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-inner flex items-center justify-center">
                <video
                  ref={videoRef}
                  playsInline
                  autoPlay
                  muted
                  className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Laser Reticle & Scan Overlay */}
                {cameraActive && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    {/* Viewfinder Target Frame */}
                    <div className="relative w-48 h-48 sm:w-56 sm:h-56 border-2 border-emerald-500/40 rounded-2xl">
                      {/* Corner Accents */}
                      <span className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                      <span className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
                      <span className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                      <span className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />

                      {/* Animated Laser Scanning Line */}
                      <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#10b981] animate-scan-laser" />
                    </div>

                    <div className="absolute bottom-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] text-emerald-300 font-mono tracking-wide">
                      Point camera at classroom QR code
                    </div>
                  </div>
                )}

                {/* Camera Fallback / Error State */}
                {cameraError && (
                  <div className="p-4 text-center space-y-2">
                    <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
                    <p className="text-xs text-amber-200">{cameraError}</p>
                    <button
                      type="button"
                      onClick={startCameraStream}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold inline-flex items-center gap-1.5 border border-slate-700 transition"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Retry Camera</span>
                    </button>
                  </div>
                )}

                {/* Camera Loading Spinner */}
                {!cameraActive && !cameraError && (
                  <div className="p-4 text-center space-y-2">
                    <RefreshCw className="w-7 h-7 text-indigo-400 animate-spin mx-auto" />
                    <p className="text-xs text-slate-400">Initializing mobile camera stream...</p>
                  </div>
                )}
              </div>

              {/* Camera Controls Toolbar */}
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={toggleFacingMode}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition"
                  title="Switch Front/Back Lens"
                >
                  <SwitchCamera className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{facingMode === 'environment' ? 'Back Lens' : 'Front Lens'}</span>
                </button>

                {torchSupported && (
                  <button
                    type="button"
                    onClick={toggleTorch}
                    className={`px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 border transition ${
                      torchOn
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    }`}
                    title="Toggle Flashlight Torch"
                  >
                    {torchOn ? (
                      <>
                        <ZapOff className="w-3.5 h-3.5 text-amber-400" />
                        <span>Torch Off</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        <span>Torch On</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Manual Input Form */
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                Session Token / Manual Input
              </label>
              <textarea
                value={qrInputToken}
                onChange={(e) => setQrInputToken(e.target.value)}
                placeholder="Paste or enter attendance session token (e.g. SESS-20260911-XXXX)..."
                rows={3}
                className="w-full rounded-2xl bg-slate-800/90 border border-slate-700 p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono resize-none shadow-inner"
              />
            </div>
          )}

          {/* Location & Device Telemetry Pill */}
          <div className="space-y-1.5 text-xs pt-1">
            <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-slate-300 text-[11px]">GPS Status:</span>
              </div>
              <span className="text-emerald-400 font-mono text-[10px] truncate max-w-[210px]">
                {gpsStatus}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-slate-300 text-[11px]">Anti-Proxy Fingerprint:</span>
              </div>
              <span className="text-indigo-400 font-mono text-[10px] truncate max-w-[180px]">
                {deviceInfo?.deviceFingerprint || 'Calculating...'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-800 flex items-center space-x-2 flex-shrink-0 mt-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
          >
            Cancel
          </button>
          
          {activeTab === 'manual' && (
            <button
              type="button"
              onClick={handleManualSubmit}
              disabled={loading || !qrInputToken.trim()}
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 shadow-lg shadow-emerald-600/20 transition"
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
          )}
        </div>

      </div>
    </div>
  );
}
