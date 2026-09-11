import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import MobileBottomNav from '../../components/layout/MobileBottomNav';
import { currentUser } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';

export default function TeacherLayout() {
  const { user: authUser } = useAuth();
  const user = authUser || currentUser.teacher;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Sidebar 
        role="teacher" 
        user={user} 
        isOpenMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header 
          title="Teacher Faculty Console" 
          subtitle="Manage active classes, mark attendance, and generate course reports" 
          user={user} 
          onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)}
        />
        <main className="flex-1 p-3 sm:p-6 pb-24 md:pb-6 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
      <MobileBottomNav role="teacher" />
    </div>
  );
}
