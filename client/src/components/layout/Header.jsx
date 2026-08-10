import React from 'react';
import { FiSearch, FiBell, FiCalendar } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

export default function Header({ title, subtitle, user: userProp }) {
  const { user: authUser } = useAuth();
  const activeUser = authUser || userProp;

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 px-6 py-4 flex items-center justify-between">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Search Input */}
        <div className="relative hidden md:block w-64">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search classes, logs, students..." 
            className="input-field pl-9 py-1.5 text-xs bg-slate-950/60 border-slate-800 focus:border-indigo-500"
          />
        </div>

        {/* Date Display Badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-950/50 border border-slate-800 rounded-xl text-xs text-slate-300">
          <FiCalendar className="w-3.5 h-3.5 text-indigo-400" />
          <span>{currentDate}</span>
        </div>

        {/* Notifications Icon with Badge */}
        <button className="relative p-2 text-slate-300 hover:text-white bg-slate-950/50 hover:bg-slate-800 border border-slate-800 rounded-xl transition-colors">
          <FiBell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full ring-2 ring-slate-900" />
        </button>

        {/* User Mini Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <img 
            src={activeUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'} 
            alt={activeUser?.name || 'User'}
            className="w-8 h-8 rounded-lg object-cover border border-slate-700"
          />
          <div className="hidden sm:block text-left">
            <span className="block text-xs font-semibold text-white leading-tight">{activeUser?.name?.split(' ')[0] || 'User'}</span>
            <span className="block text-[10px] text-slate-400 capitalize">{activeUser?.role || 'User'}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
