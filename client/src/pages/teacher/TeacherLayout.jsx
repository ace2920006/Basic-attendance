import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import { useAuth } from '../../context/AuthContext';

export default function TeacherLayout() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Sidebar role="teacher" user={user} />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header 
          title="Teacher Faculty Console" 
          subtitle="Manage active classes, mark attendance, and generate course reports" 
          user={user} 
        />
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
