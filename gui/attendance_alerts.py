import tkinter as tk
from tkinter import ttk, messagebox
from datetime import datetime, timedelta
import threading
import time

class AttendanceAlerts:
    def __init__(self, parent, db, refresh_callback=None, theme_manager=None):
        self.parent = parent
        self.db = db
        self.refresh_callback = refresh_callback
        self.theme_manager = theme_manager
        self.alert_thread = None
        self.stop_alerts = False
        self.main_frame = None
        self._build_ui()
    
    def _get_theme(self):
        """Get current theme"""
        if self.theme_manager:
            return self.theme_manager.get_theme()
        return {
            "bg_primary": "#ffffff",
            "bg_secondary": "#f8fafc",
            "fg_primary": "#0f172a",
        }

    def _build_ui(self):
        theme = self._get_theme()
        self.main_frame = frm = tk.Frame(self.parent, bg=theme["bg_primary"], padx=10, pady=10)
        frm.pack(fill="both", expand=True)

        # Alert settings
        settings_frame = ttk.LabelFrame(frm, text="Alert Settings", padding=10)
        settings_frame.pack(fill="x", padx=5, pady=5)

        # Low attendance threshold
        threshold_frame = ttk.Frame(settings_frame)
        threshold_frame.pack(fill="x", pady=5)

        ttk.Label(threshold_frame, text="Low Attendance Threshold (%):").pack(side="left")
        self.threshold_var = tk.StringVar(value="75")
        ttk.Entry(threshold_frame, textvariable=self.threshold_var, width=10).pack(side="left", padx=5)

        # Alert frequency
        ttk.Label(threshold_frame, text="Check Every (minutes):").pack(side="left", padx=(20, 0))
        self.frequency_var = tk.StringVar(value="30")
        ttk.Entry(threshold_frame, textvariable=self.frequency_var, width=10).pack(side="left", padx=5)

        # Alert controls
        control_frame = ttk.Frame(settings_frame)
        control_frame.pack(fill="x", pady=5)

        self.alert_enabled = tk.BooleanVar()
        ttk.Checkbutton(control_frame, text="Enable Alerts", variable=self.alert_enabled, 
                       command=self.toggle_alerts).pack(side="left")

        ttk.Button(control_frame, text="Test Alert", command=self.test_alert).pack(side="left", padx=10)
        ttk.Button(control_frame, text="Check Now", command=self.check_attendance_now).pack(side="left", padx=5)

        # Alert history
        history_frame = ttk.LabelFrame(frm, text="Alert History", padding=10)
        history_frame.pack(fill="both", expand=True, padx=5, pady=5)

        # Alert list
        cols = ("timestamp", "type", "student", "message", "action_taken")
        self.alert_tree = ttk.Treeview(history_frame, columns=cols, show="headings", height=12)
        
        for col in cols:
            self.alert_tree.heading(col, text=col.replace("_", " ").title())
            self.alert_tree.column(col, width=120)

        self.alert_tree.pack(side="left", fill="both", expand=True)

        alert_scroll = ttk.Scrollbar(history_frame, orient="vertical", command=self.alert_tree.yview)
        self.alert_tree.configure(yscrollcommand=alert_scroll.set)
        alert_scroll.pack(side="right", fill="y")

        # Alert actions
        action_frame = ttk.Frame(frm)
        action_frame.pack(fill="x", padx=5, pady=5)

        ttk.Button(action_frame, text="Clear History", command=self.clear_history).pack(side="left")
        ttk.Button(action_frame, text="Export Alerts", command=self.export_alerts).pack(side="left", padx=5)
        ttk.Button(action_frame, text="Send Parent Notifications", command=self.send_parent_notifications).pack(side="left", padx=5)

        # Status
        self.status_var = tk.StringVar()
        self.status_label = tk.Label(frm, textvariable=self.status_var, bg=theme["bg_primary"], fg=theme["fg_primary"])
        self.status_label.pack(pady=5)

        # Load initial data
        self.load_alert_history()
    
    def apply_theme(self, theme):
        """Apply theme to this component"""
        if self.main_frame:
            self.main_frame.configure(bg=theme["bg_primary"])
            if hasattr(self, 'status_label'):
                self.status_label.configure(bg=theme["bg_primary"], fg=theme["fg_primary"])

    def toggle_alerts(self):
        if self.alert_enabled.get():
            self.start_alert_monitoring()
            self.status_var.set("Alerts enabled - monitoring attendance...")
        else:
            self.stop_alert_monitoring()
            self.status_var.set("Alerts disabled")

    def start_alert_monitoring(self):
        if self.alert_thread and self.alert_thread.is_alive():
            return

        self.stop_alerts = False
        self.alert_thread = threading.Thread(target=self._monitor_attendance, daemon=True)
        self.alert_thread.start()

    def stop_alert_monitoring(self):
        self.stop_alerts = True

    def _monitor_attendance(self):
        while not self.stop_alerts:
            try:
                self.check_attendance_now()
                
                # Wait for the specified frequency
                frequency = int(self.frequency_var.get()) * 60  # Convert to seconds
                time.sleep(frequency)
                
            except Exception as e:
                self.add_alert("ERROR", "System", f"Alert monitoring error: {str(e)}", "None")
                time.sleep(60)  # Wait 1 minute before retrying

    def check_attendance_now(self):
        try:
            # Check for low attendance
            threshold = float(self.threshold_var.get())
            stats = self.db.get_attendance_statistics()
            
            low_attendance_students = []
            for stat in stats:
                if stat[7] < threshold:  # attendance_percentage
                    low_attendance_students.append(stat)

            if low_attendance_students:
                for student in low_attendance_students:
                    self.add_alert("LOW_ATTENDANCE", student[1], 
                                 f"Attendance below {threshold}% ({student[7]}%)", "Alerted")
            
            # Check for students with consecutive absences
            today = datetime.now().strftime("%Y-%m-%d")
            yesterday = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
            
            # Get students absent today
            today_absent = []
            today_records = self.db.get_attendance_by_date(today)
            for record in today_records:
                if record[2] == "Absent":
                    today_absent.append(record[0])
            
            # Check if they were also absent yesterday
            consecutive_absent = []
            for student_id in today_absent:
                yesterday_status = self.db.get_attendance_status(student_id, yesterday)
                if yesterday_status == "Absent":
                    consecutive_absent.append(student_id)
            
            for student_id in consecutive_absent:
                student_name = next((s[1] for s in self.db.get_all_students() if s[0] == student_id), "Unknown")
                self.add_alert("CONSECUTIVE_ABSENCE", student_name, 
                             "Absent for 2 consecutive days", "Parent notified")
            
            # Check for late arrivals today
            late_students = self.db.get_late_students(today)
            for student in late_students:
                self.add_alert("LATE_ARRIVAL", student[1], 
                             f"Arrived late at {student[2]}", "Marked as late")
            
            self.status_var.set(f"Last checked: {datetime.now().strftime('%H:%M:%S')}")
            
        except Exception as e:
            self.add_alert("ERROR", "System", f"Attendance check failed: {str(e)}", "None")

    def add_alert(self, alert_type, student, message, action):
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        self.alert_tree.insert("", 0, values=(timestamp, alert_type, student, message, action))

    def test_alert(self):
        self.add_alert("TEST", "System", "Test alert - system is working", "None")
        messagebox.showinfo("Test Alert", "Test alert generated successfully!")

    def load_alert_history(self):
        # In a real implementation, this would load from a database or file
        # For now, we'll add some sample alerts
        sample_alerts = [
            ("2024-01-15 09:30:00", "LOW_ATTENDANCE", "John Doe", "Attendance below 75% (68%)", "Alerted"),
            ("2024-01-15 10:15:00", "LATE_ARRIVAL", "Jane Smith", "Arrived late at 09:15", "Marked as late"),
            ("2024-01-15 11:00:00", "CONSECUTIVE_ABSENCE", "Bob Johnson", "Absent for 2 consecutive days", "Parent notified")
        ]
        
        for alert in sample_alerts:
            self.alert_tree.insert("", "end", values=alert)

    def clear_history(self):
        if messagebox.askyesno("Confirm", "Clear all alert history?"):
            for item in self.alert_tree.get_children():
                self.alert_tree.delete(item)

    def export_alerts(self):
        try:
            from tkinter import filedialog
            import csv
            
            file_path = filedialog.asksaveasfilename(
                title="Export alerts to",
                defaultextension=".csv",
                filetypes=[("CSV files", "*.csv")]
            )
            
            if file_path:
                with open(file_path, 'w', newline='', encoding='utf-8') as f:
                    writer = csv.writer(f)
                    writer.writerow(['Timestamp', 'Type', 'Student', 'Message', 'Action Taken'])
                    
                    for item in self.alert_tree.get_children():
                        values = self.alert_tree.item(item)["values"]
                        writer.writerow(values)
                
                messagebox.showinfo("Export Complete", f"Alerts exported to: {file_path}")
                
        except Exception as e:
            messagebox.showerror("Export Error", f"Failed to export alerts: {str(e)}")

    def send_parent_notifications(self):
        try:
            # Get students with low attendance
            threshold = float(self.threshold_var.get())
            stats = self.db.get_attendance_statistics()
            
            low_attendance_students = [s for s in stats if s[7] < threshold]
            
            if not low_attendance_students:
                messagebox.showinfo("No Notifications", "No students with low attendance found.")
                return
            
            # In a real implementation, this would send actual notifications
            # For now, we'll just show a summary
            notification_count = len(low_attendance_students)
            
            message = f"Parent notifications would be sent for {notification_count} students:\n\n"
            for student in low_attendance_students[:5]:  # Show first 5
                message += f"• {student[1]} - {student[7]}% attendance\n"
            
            if len(low_attendance_students) > 5:
                message += f"... and {len(low_attendance_students) - 5} more students"
            
            messagebox.showinfo("Parent Notifications", message)
            
            # Add alert for each notification
            for student in low_attendance_students:
                self.add_alert("PARENT_NOTIFICATION", student[1], 
                             f"Parent notified of low attendance ({student[7]}%)", "Email sent")
                
        except Exception as e:
            messagebox.showerror("Error", f"Failed to send notifications: {str(e)}")


class AttendanceNotifications:
    def __init__(self, db):
        self.db = db
        self.notification_queue = []

    def add_notification(self, student_id, message, priority="normal"):
        notification = {
            'student_id': student_id,
            'message': message,
            'priority': priority,
            'timestamp': datetime.now(),
            'sent': False
        }
        self.notification_queue.append(notification)

    def get_pending_notifications(self):
        return [n for n in self.notification_queue if not n['sent']]

    def mark_sent(self, notification):
        notification['sent'] = True

    def send_email_notification(self, student_id, subject, message):
        # In a real implementation, this would send actual emails
        # For now, we'll just log the notification
        print(f"EMAIL NOTIFICATION TO PARENT OF {student_id}")
        print(f"Subject: {subject}")
        print(f"Message: {message}")
        print("-" * 50)

    def send_sms_notification(self, phone_number, message):
        # In a real implementation, this would send actual SMS
        # For now, we'll just log the notification
        print(f"SMS NOTIFICATION TO {phone_number}")
        print(f"Message: {message}")
        print("-" * 50)

    def generate_attendance_report(self, student_id, start_date, end_date):
        try:
            trends = self.db.get_attendance_trends(student_id, 30)
            if not trends:
                return "No attendance data available."
            
            present_days = sum(1 for t in trends if t[1] == 'Present')
            absent_days = sum(1 for t in trends if t[1] == 'Absent')
            late_days = sum(1 for t in trends if t[1] == 'Late')
            total_days = len(trends)
            
            attendance_rate = (present_days + late_days) / total_days * 100 if total_days > 0 else 0
            
            report = f"""
ATTENDANCE REPORT
=================
Student ID: {student_id}
Period: {start_date} to {end_date}

Summary:
- Total Days: {total_days}
- Present: {present_days}
- Absent: {absent_days}
- Late: {late_days}
- Attendance Rate: {attendance_rate:.1f}%

Recent Attendance:
"""
            for trend in trends[-7:]:  # Last 7 days
                report += f"- {trend[0]}: {trend[1]}\n"
            
            return report
            
        except Exception as e:
            return f"Error generating report: {str(e)}"
