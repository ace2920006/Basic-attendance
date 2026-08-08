import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import { currentUser } from '../../data/mockData';

export default function StudentLayout() {
  const user = currentUser.student;

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Sidebar role="student" user={user} />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header 
          title="Student Attendance Portal" 
          subtitle="Real-time attendance score, schedule & notification logs" 
          user={user} 
        />
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
