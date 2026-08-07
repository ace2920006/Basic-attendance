import React, { useState } from 'react';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  FileText, 
  Bell, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  PlusCircle, 
  ShieldCheck, 
  Building2, 
  BarChart3, 
  LogOut 
} from 'lucide-react';

export default function App() {
  const [currentRole, setCurrentRole] = useState('student');
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <header className="glass-panel" style={{ borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0, padding: '0.875rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)', padding: '0.5rem', borderRadius: '10px', display: 'flex' }}>
            <GraduationCap size={24} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', lineHeight: 1.1 }}>Attendance System</h1>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Phase 1 Architecture Foundation</span>
          </div>
        </div>

        {/* Role Selector Tabs */}
        <div style={{ display: 'flex', background: 'rgba(15, 23, 42, 0.6)', padding: '0.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)' }}>
          <button 
            className={`btn ${currentRole === 'student' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.375rem 0.875rem', fontSize: '0.8125rem' }}
            onClick={() => { setCurrentRole('student'); setActiveTab('dashboard'); }}
          >
            <GraduationCap size={16} /> Student Portal
          </button>
          <button 
            className={`btn ${currentRole === 'teacher' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.375rem 0.875rem', fontSize: '0.8125rem' }}
            onClick={() => { setCurrentRole('teacher'); setActiveTab('dashboard'); }}
          >
            <BookOpen size={16} /> Teacher Portal
          </button>
          <button 
            className={`btn ${currentRole === 'admin' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.375rem 0.875rem', fontSize: '0.8125rem' }}
            onClick={() => { setCurrentRole('admin'); setActiveTab('dashboard'); }}
          >
            <ShieldCheck size={16} /> Admin Portal
          </button>
        </div>

        {/* User Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Demo Account</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>Role: {currentRole}</div>
          </div>
          <button className="btn btn-secondary" style={{ padding: '0.5rem' }} title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '2rem', maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
        
        {/* STUDENT ROLE VIEW */}
        {currentRole === 'student' && (
          <div>
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 className="gradient-text" style={{ fontSize: '1.75rem' }}>Welcome back, Alex!</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>Roll No: CS-2024-001 | Semester 4 (Computer Science)</p>
              </div>
              <button className="btn btn-primary">
                <PlusCircle size={18} /> Submit Leave Request
              </button>
            </div>

            {/* Quick Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
              <div className="glass-panel" style={{ padding: '1.25rem' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginBottom: '0.5rem' }}>Overall Attendance</div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#34d399' }}>88.5%</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Above 75% threshold</div>
              </div>
              <div className="glass-panel" style={{ padding: '1.25rem' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginBottom: '0.5rem' }}>Classes Attended</div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)' }}>46 / 52</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>6 Absent entries</div>
              </div>
              <div className="glass-panel" style={{ padding: '1.25rem' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginBottom: '0.5rem' }}>Pending Leave Requests</div>
                <div style={{ fontSize: '2rem', fontWeight 700, color: '#fbbf24' }}>1</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Medical leave under review</div>
              </div>
              <div className="glass-panel" style={{ padding: '1.25rem' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginBottom: '0.5rem' }}>Notifications</div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#818cf8' }}>2 Unread</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Timetable & Alert updates</div>
              </div>
            </div>

            {/* Attendance History Preview Table */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={20} color="var(--primary)" /> Attendance History & Logs
              </h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Date</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Subject Code & Name</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Instructor</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.875rem 1rem' }}>2026-08-03</td>
                    <td style={{ padding: '0.875rem 1rem', fontWeight: 500 }}>CS401 - Database Management Systems</td>
                    <td style={{ padding: '0.875rem 1rem' }}>Dr. John Smith</td>
                    <td style={{ padding: '0.875rem 1rem' }}><span className="badge badge-present"><CheckCircle2 size={12} /> Present</span></td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.875rem 1rem' }}>2026-08-01</td>
                    <td style={{ padding: '0.875rem 1rem', fontWeight: 500 }}>CS402 - Data Structures & Algorithms</td>
                    <td style={{ padding: '0.875rem 1rem' }}>Prof. Sarah Connor</td>
                    <td style={{ padding: '0.875rem 1rem' }}><span className="badge badge-late"><Clock size={12} /> Late (10:18)</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TEACHER ROLE VIEW */}
        {currentRole === 'teacher' && (
          <div>
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 className="gradient-text" style={{ fontSize: '1.75rem' }}>Teacher Dashboard</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>Instructor: Dr. John Smith (Computer Science)</p>
              </div>
              <button className="btn btn-primary">
                <PlusCircle size={18} /> Create New Class Session
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
              <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <BookOpen size={20} color="var(--primary)" /> Assigned Active Classes
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ background: 'rgba(15, 23, 42, 0.4)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '1.05rem' }}>CS401 - Database Management Systems</div>
                      <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Section A | Mon & Wed 10:00 AM | Room Lab-301</div>
                    </div>
                    <button className="btn btn-primary" style={{ fontSize: '0.8125rem' }}>Mark Attendance</button>
                  </div>
                  <div style={{ background: 'rgba(15, 23, 42, 0.4)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '1.05rem' }}>CS403 - Web Application Development</div>
                      <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Section B | Tue & Thu 02:00 PM | Room 104</div>
                    </div>
                    <button className="btn btn-secondary" style={{ fontSize: '0.8125rem' }}>View Reports</button>
                  </div>
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>Quick Actions</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <button className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}><FileText size={16} /> Export Attendance CSV</button>
                  <button className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}><BarChart3 size={16} /> View Attendance Analytics</button>
                  <button className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}><Bell size={16} /> Send Class Announcements</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ADMIN ROLE VIEW */}
        {currentRole === 'admin' && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 className="gradient-text" style={{ fontSize: '1.75rem' }}>Administrator Management Console</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>System Overview, Departments, Users, and Timetable Configuration</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
              <div className="glass-panel" style={{ padding: '1.25rem' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>Total Students</div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>1,248</div>
              </div>
              <div className="glass-panel" style={{ padding: '1.25rem' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>Active Teachers</div>
                <div style={{ fontSize: '2rem', fontWeight 700, color: 'var(--accent-emerald)' }}>84</div>
              </div>
              <div className="glass-panel" style={{ padding: '1.25rem' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>Departments</div>
                <div style={{ fontSize: '2rem', fontWeight 700, color: '#a5b4fc' }}>6</div>
              </div>
              <div className="glass-panel" style={{ padding: '1.25rem' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>Active Subjects</div>
                <div style={{ fontSize: '2rem', fontWeight 700, color: '#f59e0b' }}>42</div>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building2 size={20} color="var(--primary)" /> System Management Modules
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                <div style={{ border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', padding: '1rem', background: 'rgba(15, 23, 42, 0.3)' }}>
                  <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Manage Students</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Add, bulk import, and manage student enrollments</div>
                  <button className="btn btn-secondary" style={{ width: '100%', fontSize: '0.8125rem' }}>Open Student Manager</button>
                </div>
                <div style={{ border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', padding: '1rem', background: 'rgba(15, 23, 42, 0.3)' }}>
                  <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Manage Teachers</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Assign departments, staff accounts, and subjects</div>
                  <button className="btn btn-secondary" style={{ width: '100%', fontSize: '0.8125rem' }}>Open Teacher Manager</button>
                </div>
                <div style={{ border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', padding: '1rem', background: 'rgba(15, 23, 42, 0.3)' }}>
                  <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Departments & Semesters</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Configure academic structure and semesters</div>
                  <button className="btn btn-secondary" style={{ width: '100%', fontSize: '0.8125rem' }}>Configure Academics</button>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="glass-panel" style={{ borderRadius: 0, borderBottom: 0, borderLeft: 0, borderRight: 0, padding: '1rem 2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
        Attendance System &copy; 2026 | Built with Node.js, Express, SQLite, and React (Vite)
      </footer>
    </div>
  );
}
