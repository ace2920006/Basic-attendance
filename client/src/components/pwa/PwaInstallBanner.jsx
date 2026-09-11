import React, { useState } from 'react';
import { FiDownload, FiX, FiShare, FiPlusSquare, FiSmartphone, FiCheck } from 'react-icons/fi';
import { usePwaInstall } from '../../context/PwaInstallContext';

export default function PwaInstallBanner() {
  const { isInstallable, isInstalled, promptInstall, isIos, showIosGuide, setShowIosGuide } = usePwaInstall();
  const [dismissed, setDismissed] = useState(false);

  if (!isInstallable || isInstalled || dismissed) return null;

  return (
    <>
      {/* Floating Install Prompt Banner */}
      <aside aria-label="Install CampusAttend App Prompt" className="fixed bottom-20 md:bottom-6 right-4 left-4 md:left-auto md:w-96 z-40 animate-fade-in">
        <div className="bg-slate-900/95 backdrop-blur-xl border border-indigo-500/40 p-4 rounded-2xl shadow-2xl shadow-indigo-950/50 text-white flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src="/icons/icon-192.png"
              alt="CampusAttend App Icon"
              className="w-12 h-12 rounded-xl object-cover border border-indigo-500/30 flex-shrink-0 shadow-md"
            />
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                <span>Install CampusAttend</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                  App
                </span>
              </h3>
              <p className="text-[11px] text-slate-300 truncate mt-0.5">
                Fast 1-tap QR scan & offline timetables
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={promptInstall}
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition transform active:scale-95"
            >
              <FiDownload className="w-3.5 h-3.5" />
              <span>Install</span>
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Dismiss"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* iOS "Add to Home Screen" Instructions Modal */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <FiSmartphone className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Install on iPhone / iPad</h3>
              </div>
              <button
                onClick={() => setShowIosGuide(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 py-4 text-xs text-slate-300">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold flex-shrink-0 text-[11px]">
                  1
                </div>
                <div>
                  Tap the <strong className="text-white">Share</strong> button{' '}
                  <FiShare className="inline w-3.5 h-3.5 text-indigo-400 mx-1" /> at the bottom of Safari.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold flex-shrink-0 text-[11px]">
                  2
                </div>
                <div>
                  Scroll down the share sheet and select{' '}
                  <strong className="text-white">Add to Home Screen</strong>{' '}
                  <FiPlusSquare className="inline w-3.5 h-3.5 text-emerald-400 mx-1" />.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold flex-shrink-0 text-[11px]">
                  3
                </div>
                <div>
                  Tap <strong className="text-white">Add</strong> in the top-right corner. Launch CampusAttend anytime with 1 tap!
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIosGuide(false)}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
