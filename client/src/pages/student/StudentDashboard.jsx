import React from 'react';
import AttendanceCard from './AttendanceCard';
import TodaysClasses from './TodaysClasses';
import NotificationsList from './NotificationsList';
import AttendanceGraph from './AttendanceGraph';
import { currentUser } from '../../data/mockData';

export default function StudentDashboard() {
  const user = currentUser.student;

  return (
    <div className="space-y-6">
      
      {/* Top Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Welcome back, <span className="gradient-text">{user.name}</span>!
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Roll No: <span className="text-indigo-300 font-semibold">{user.rollNo}</span> | {user.department} ({user.semester})
          </p>
        </div>
      </div>

      {/* Main Grid Section */}
      <AttendanceCard user={user} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          <TodaysClasses />
          <AttendanceGraph />
        </div>
        <div className="lg:col-span-5">
          <NotificationsList />
        </div>
      </div>

    </div>
  );
}
