import tkinter as tk
from tkinter import ttk, messagebox
from data.database import Database
from gui.student_manager import StudentManager
from gui.attendance_marker import AttendanceMarker
from gui.records_viewer import RecordsViewer
from gui.analytics_dashboard import AnalyticsDashboard
from gui.enhanced_attendance_marker import EnhancedAttendanceMarker
from gui.bulk_operations import BulkOperations
from gui.attendance_alerts import AttendanceAlerts
from utils.theme_manager import ThemeManager
import os

class MainWindow:
    def __init__(self, root):
        self.root = root
        self.root.title("Attendance App - Starter")
        self.root.geometry("900x600")
        self.db = Database()
        self.theme_manager = ThemeManager(root=root)
        self.components = {}
        self._build_ui()
        self._apply_theme()

    def _build_ui(self):
        # Menu - Always white background with black text
        menubar = tk.Menu(self.root, bg="#ffffff", fg="#000000", activebackground="#f0f0f0", activeforeground="#000000")
        filemenu = tk.Menu(menubar, tearoff=0, bg="#ffffff", fg="#000000", activebackground="#f0f0f0", activeforeground="#000000")
        filemenu.add_command(label="Backup Database", command=self.backup_db)
        filemenu.add_separator()
        filemenu.add_command(label="Exit", command=self.root.quit)
        menubar.add_cascade(label="File", menu=filemenu)

        # Theme menu - Always white background with black text
        thememenu = tk.Menu(menubar, tearoff=0, bg="#ffffff", fg="#000000", activebackground="#f0f0f0", activeforeground="#000000")
        theme_names = self.theme_manager.get_theme_names()
        for theme_name in theme_names:
            thememenu.add_command(
                label=theme_name,
                command=lambda t=theme_name: self.change_theme(t)
            )
        menubar.add_cascade(label="Theme", menu=thememenu)

        helpmenu = tk.Menu(menubar, tearoff=0, bg="#ffffff", fg="#000000", activebackground="#f0f0f0", activeforeground="#000000")
        helpmenu.add_command(label="About", command=lambda: messagebox.showinfo("About", "Attendance App - Starter\nBuilt with Tkinter & SQLite"))
        menubar.add_cascade(label="Help", menu=helpmenu)

        self.root.config(menu=menubar)

        # Status bar
        self.status = tk.StringVar()
        self.status.set("Welcome — {} students in database".format(self.db.count_students()))
        theme = self.theme_manager.get_theme()
        self.status_bar = tk.Label(self.root, textvariable=self.status, anchor="w", 
                                    bg=theme["bg_secondary"], fg=theme["fg_primary"], relief="sunken", bd=1)
        self.status_bar.pack(side="bottom", fill="x")

        # Notebook tabs
        tab_control = ttk.Notebook(self.root)
        self.student_frame = ttk.Frame(tab_control)
        self.attendance_frame = ttk.Frame(tab_control)
        self.enhanced_attendance_frame = ttk.Frame(tab_control)
        self.records_frame = ttk.Frame(tab_control)
        self.analytics_frame = ttk.Frame(tab_control)
        self.bulk_ops_frame = ttk.Frame(tab_control)
        self.alerts_frame = ttk.Frame(tab_control)

        tab_control.add(self.student_frame, text='Students')
        tab_control.add(self.attendance_frame, text='Mark Attendance')
        tab_control.add(self.enhanced_attendance_frame, text='Enhanced Attendance')
        tab_control.add(self.records_frame, text='Records')
        tab_control.add(self.analytics_frame, text='Analytics')
        tab_control.add(self.bulk_ops_frame, text='Bulk Operations')
        tab_control.add(self.alerts_frame, text='Alerts & Notifications')
        tab_control.pack(expand=1, fill='both')

        # populate tabs with theme manager
        self.components['student'] = StudentManager(self.student_frame, self.db, self._refresh_status, self.theme_manager)
        self.components['attendance'] = AttendanceMarker(self.attendance_frame, self.db, self._refresh_status, self.theme_manager)
        self.components['enhanced'] = EnhancedAttendanceMarker(self.enhanced_attendance_frame, self.db, self._refresh_status, self.theme_manager)
        self.components['records'] = RecordsViewer(self.records_frame, self.db, self.theme_manager)
        self.components['analytics'] = AnalyticsDashboard(self.analytics_frame, self.db, self.theme_manager)
        self.components['bulk'] = BulkOperations(self.bulk_ops_frame, self.db, self._refresh_status, self.theme_manager)
        self.components['alerts'] = AttendanceAlerts(self.alerts_frame, self.db, self._refresh_status, self.theme_manager)
        
        # Register theme change callback
        self.theme_manager.register_callback(self._apply_theme)

    def backup_db(self):
        import shutil, datetime
        src = self.db.db_path
        dst_folder = os.path.join(os.path.dirname(src), "backups")
        os.makedirs(dst_folder, exist_ok=True)
        dst = os.path.join(dst_folder, f"attendance_backup_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.db")
        shutil.copy2(src, dst)
        messagebox.showinfo("Backup", f"Backup created:\n{dst}")

    def _refresh_status(self):
        self.status.set("Welcome — {} students in database".format(self.db.count_students()))
    
    def change_theme(self, theme_name):
        """Change the application theme"""
        if self.theme_manager.set_theme(theme_name):
            messagebox.showinfo("Theme Changed", f"Theme changed to: {theme_name}")
    
    def _apply_theme(self, theme=None):
        """Apply theme to main window and all components"""
        if theme is None:
            theme = self.theme_manager.get_theme()
        
        # Apply to root window
        self.root.configure(bg=theme["bg_primary"])
        
        # Apply to status bar
        if hasattr(self, 'status_bar'):
            self.status_bar.configure(bg=theme["bg_secondary"], fg=theme["fg_primary"])
        
        # Apply to notebook tabs
        for widget in self.root.winfo_children():
            if isinstance(widget, ttk.Notebook):
                # Notebook styling is handled by theme_manager's ttk.Style configuration
                pass
        
        # Apply to all components
        for component in self.components.values():
            if hasattr(component, 'apply_theme'):
                try:
                    component.apply_theme(theme)
                except Exception as e:
                    print(f"Error applying theme to component: {e}")
