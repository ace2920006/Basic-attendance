import tkinter as tk
from tkinter import ttk, messagebox, simpledialog
from datetime import datetime, time
import threading

class EnhancedAttendanceMarker:
    def __init__(self, parent, db, refresh_callback=None, theme_manager=None):
        self.parent = parent
        self.db = db
        self.refresh_callback = refresh_callback
        self.theme_manager = theme_manager
        self.date_var = tk.StringVar(value=datetime.now().strftime("%Y-%m-%d"))
        self.late_threshold = tk.StringVar(value="09:00")
        self.auto_mark_late = tk.BooleanVar(value=True)
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
            "header_bg": "#3b82f6",
            "header_fg": "#ffffff",
        }

    def _build_ui(self):
        theme = self._get_theme()
        self.main_frame = frm = tk.Frame(self.parent, bg=theme["bg_primary"], padx=10, pady=10)
        frm.pack(fill="both", expand=True)

        # Header controls
        header_frame = tk.Frame(frm, bg=theme["bg_secondary"], padx=10, pady=10)
        header_frame.pack(fill="x", pady=(0, 10))

        # Date and time controls
        date_frame = ttk.LabelFrame(header_frame, text="Date & Time Settings", padding=5)
        date_frame.pack(side="left", fill="x", expand=True)

        ttk.Label(date_frame, text="Date:").grid(row=0, column=0, padx=5)
        ttk.Entry(date_frame, textvariable=self.date_var, width=12).grid(row=0, column=1, padx=5)

        ttk.Label(date_frame, text="Late Threshold:").grid(row=0, column=2, padx=5)
        ttk.Entry(date_frame, textvariable=self.late_threshold, width=8).grid(row=0, column=3, padx=5)

        ttk.Checkbutton(date_frame, text="Auto-mark late", variable=self.auto_mark_late).grid(row=1, column=0, columnspan=2, sticky="w", padx=5)

        # Action buttons
        action_frame = ttk.LabelFrame(header_frame, text="Quick Actions", padding=5)
        action_frame.pack(side="right")

        ttk.Button(action_frame, text="Load Students", command=self.load_students).pack(side="left", padx=2)
        ttk.Button(action_frame, text="Mark All Present", command=self.mark_all_present).pack(side="left", padx=2)
        ttk.Button(action_frame, text="Mark All Absent", command=self.mark_all_absent).pack(side="left", padx=2)
        ttk.Button(action_frame, text="Auto Time", command=self.auto_set_times).pack(side="left", padx=2)

        # Students list with enhanced status
        list_frame = ttk.LabelFrame(frm, text="Student Attendance", padding=5)
        list_frame.pack(fill="both", expand=True, pady=5)

        # Create treeview with more columns
        cols = ("student_id", "name", "class", "status", "arrival_time", "departure_time", "notes")
        self.tree = ttk.Treeview(list_frame, columns=cols, show="headings", selectmode="browse", height=15)
        
        # Configure columns
        self.tree.heading("student_id", text="Student ID")
        self.tree.heading("name", text="Name")
        self.tree.heading("class", text="Class")
        self.tree.heading("status", text="Status")
        self.tree.heading("arrival_time", text="Arrival Time")
        self.tree.heading("departure_time", text="Departure Time")
        self.tree.heading("notes", text="Notes")

        self.tree.column("student_id", width=100)
        self.tree.column("name", width=150)
        self.tree.column("class", width=100)
        self.tree.column("status", width=80)
        self.tree.column("arrival_time", width=100)
        self.tree.column("departure_time", width=100)
        self.tree.column("notes", width=200)

        self.tree.pack(side="left", fill="both", expand=True)

        # Scrollbars
        v_scroll = ttk.Scrollbar(list_frame, orient="vertical", command=self.tree.yview)
        h_scroll = ttk.Scrollbar(list_frame, orient="horizontal", command=self.tree.xview)
        self.tree.configure(yscrollcommand=v_scroll.set, xscrollcommand=h_scroll.set)
        v_scroll.pack(side="right", fill="y")
        h_scroll.pack(side="bottom", fill="x")

        # Bind double-click for editing
        self.tree.bind("<Double-1>", self.edit_attendance_details)

        # Bottom controls
        bottom_frame = tk.Frame(frm, bg=theme["bg_secondary"], padx=10, pady=10)
        bottom_frame.pack(fill="x", pady=5)

        # Status info
        self.status_var = tk.StringVar()
        self.status_label = tk.Label(bottom_frame, textvariable=self.status_var, bg=theme["bg_secondary"], fg=theme["fg_primary"])
        self.status_label.pack(side="left")

        # Action buttons
        btn_frame = ttk.Frame(bottom_frame)
        btn_frame.pack(side="right")

        ttk.Button(btn_frame, text="Save Attendance", command=self.save_attendance).pack(side="left", padx=2)
        ttk.Button(btn_frame, text="Export Today", command=self.export_today).pack(side="left", padx=2)
        ttk.Button(btn_frame, text="Print Report", command=self.print_report).pack(side="left", padx=2)

        # Load initial data
        self.load_students()
    
    def apply_theme(self, theme):
        """Apply theme to this component"""
        if self.main_frame:
            self.main_frame.configure(bg=theme["bg_primary"])
            for widget in self.main_frame.winfo_children():
                if isinstance(widget, tk.Frame):
                    widget.configure(bg=theme.get("bg_secondary", theme["bg_primary"]))
            if hasattr(self, 'status_label'):
                self.status_label.configure(bg=theme["bg_secondary"], fg=theme["fg_primary"])

    def load_students(self):
        # Clear existing data
        for item in self.tree.get_children():
            self.tree.delete(item)

        try:
            # Validate date
            date = self.date_var.get().strip()
            datetime.strptime(date, "%Y-%m-%d")
        except ValueError:
            messagebox.showerror("Date Error", "Please use YYYY-MM-DD format.")
            return

        # Get students and their attendance for the date
        students = self.db.get_all_students()
        attendance_data = {}
        
        # Get existing attendance records for the date
        existing_records = self.db.get_attendance_by_date(date)
        for record in existing_records:
            attendance_data[record[0]] = {
                'status': record[2],
                'arrival_time': record[4] if len(record) > 4 else None,
                'departure_time': record[5] if len(record) > 5 else None,
                'notes': record[6] if len(record) > 6 else None
            }

        # Populate tree
        present_count = 0
        absent_count = 0
        late_count = 0

        for student in students:
            student_id, name, class_section, roll_no = student[:4]
            
            # Get attendance data for this student
            att_data = attendance_data.get(student_id, {})
            status = att_data.get('status', 'Absent')
            arrival_time = att_data.get('arrival_time', '')
            departure_time = att_data.get('departure_time', '')
            notes = att_data.get('notes', '')

            # Count statuses
            if status == 'Present':
                present_count += 1
            elif status == 'Absent':
                absent_count += 1
            elif status == 'Late':
                late_count += 1

            # Insert into tree
            self.tree.insert("", "end", values=(
                student_id, name, class_section, status, 
                arrival_time, departure_time, notes
            ))

        # Update status
        total = len(students)
        self.status_var.set(f"Total: {total} | Present: {present_count} | Absent: {absent_count} | Late: {late_count}")

    def mark_all_present(self):
        for item in self.tree.get_children():
            values = list(self.tree.item(item)["values"])
            values[3] = "Present"  # status column
            if not values[4]:  # arrival_time
                values[4] = datetime.now().strftime("%H:%M")
            self.tree.item(item, values=values)
        self._update_status()

    def mark_all_absent(self):
        for item in self.tree.get_children():
            values = list(self.tree.item(item)["values"])
            values[3] = "Absent"  # status column
            values[4] = ""  # clear arrival_time
            values[5] = ""  # clear departure_time
            self.tree.item(item, values=values)
        self._update_status()

    def auto_set_times(self):
        current_time = datetime.now().strftime("%H:%M")
        threshold_time = self.late_threshold.get()
        
        for item in self.tree.get_children():
            values = list(self.tree.item(item)["values"])
            if values[3] in ["Present", "Late"]:  # if marked as present or late
                if not values[4]:  # if no arrival time set
                    values[4] = current_time
                    # Auto-mark as late if after threshold
                    if self.auto_mark_late.get() and current_time > threshold_time:
                        values[3] = "Late"
            self.tree.item(item, values=values)
        self._update_status()

    def edit_attendance_details(self, event):
        selection = self.tree.selection()
        if not selection:
            return

        item = self.tree.item(selection[0])
        values = list(item["values"])
        student_id, name, class_section, status, arrival_time, departure_time, notes = values

        # Create edit dialog
        dialog = AttendanceEditDialog(self.parent, student_id, name, status, arrival_time, departure_time, notes)
        if dialog.result:
            new_values = list(values)
            new_values[3] = dialog.result['status']
            new_values[4] = dialog.result['arrival_time']
            new_values[5] = dialog.result['departure_time']
            new_values[6] = dialog.result['notes']
            self.tree.item(selection[0], values=new_values)
            self._update_status()

    def save_attendance(self):
        date = self.date_var.get().strip()
        try:
            datetime.strptime(date, "%Y-%m-%d")
        except ValueError:
            messagebox.showerror("Date Error", "Please use YYYY-MM-DD format.")
            return

        saved_count = 0
        for item in self.tree.get_children():
            values = self.tree.item(item)["values"]
            student_id, name, class_section, status, arrival_time, departure_time, notes = values

            try:
                self.db.set_attendance_with_details(
                    student_id, date, status, 
                    arrival_time if arrival_time else None,
                    departure_time if departure_time else None,
                    notes if notes else None
                )
                saved_count += 1
            except Exception as e:
                messagebox.showerror("Save Error", f"Failed to save attendance for {name}: {str(e)}")
                return

        messagebox.showinfo("Saved", f"Attendance saved for {saved_count} students.")
        if self.refresh_callback:
            self.refresh_callback()

    def export_today(self):
        date = self.date_var.get().strip()
        try:
            import csv
            import os
            
            filename = f"attendance_{date}.csv"
            filepath = os.path.join(os.getcwd(), filename)
            
            with open(filepath, 'w', newline='', encoding='utf-8') as f:
                writer = csv.writer(f)
                writer.writerow(['Student ID', 'Name', 'Class', 'Status', 'Arrival Time', 'Departure Time', 'Notes', 'Date'])
                
                for item in self.tree.get_children():
                    values = list(self.tree.item(item)["values"])
                    values.append(date)
                    writer.writerow(values)
            
            messagebox.showinfo("Export Complete", f"Attendance exported to:\n{filepath}")
            
        except Exception as e:
            messagebox.showerror("Export Error", f"Failed to export: {str(e)}")

    def print_report(self):
        date = self.date_var.get().strip()
        
        # Generate report content
        report_lines = [f"ATTENDANCE REPORT - {date}", "=" * 50, ""]
        
        present_count = 0
        absent_count = 0
        late_count = 0
        
        for item in self.tree.get_children():
            values = self.tree.item(item)["values"]
            student_id, name, class_section, status, arrival_time, departure_time, notes = values
            
            report_lines.append(f"{name} ({student_id}) - {status}")
            if arrival_time:
                report_lines.append(f"  Arrival: {arrival_time}")
            if departure_time:
                report_lines.append(f"  Departure: {departure_time}")
            if notes:
                report_lines.append(f"  Notes: {notes}")
            report_lines.append("")
            
            if status == 'Present':
                present_count += 1
            elif status == 'Absent':
                absent_count += 1
            elif status == 'Late':
                late_count += 1
        
        total = present_count + absent_count + late_count
        report_lines.extend([
            "SUMMARY",
            "-" * 20,
            f"Total Students: {total}",
            f"Present: {present_count}",
            f"Absent: {absent_count}",
            f"Late: {late_count}",
            f"Attendance Rate: {(present_count + late_count) / total * 100:.1f}%" if total > 0 else "N/A"
        ])
        
        # Show report in a new window
        report_window = tk.Toplevel(self.parent)
        report_window.title(f"Attendance Report - {date}")
        report_window.geometry("600x500")
        
        # Apply theme to report window
        theme = self._get_theme() if hasattr(self, '_get_theme') else {"bg_primary": "#ffffff", "fg_primary": "#0f172a", "accent": "#3b82f6"}
        report_window.configure(bg=theme["bg_primary"])
        
        text_widget = tk.Text(report_window, wrap=tk.WORD,
                             bg=theme["bg_primary"], fg=theme["fg_primary"],
                             insertbackground=theme["fg_primary"],
                             selectbackground=theme["accent"],
                             selectforeground="#ffffff")
        scrollbar = ttk.Scrollbar(report_window, orient="vertical", command=text_widget.yview)
        text_widget.configure(yscrollcommand=scrollbar.set)
        
        text_widget.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")
        
        text_widget.insert(tk.END, "\n".join(report_lines))
        text_widget.config(state=tk.DISABLED)

    def _update_status(self):
        present_count = 0
        absent_count = 0
        late_count = 0
        
        for item in self.tree.get_children():
            values = self.tree.item(item)["values"]
            status = values[3]
            if status == 'Present':
                present_count += 1
            elif status == 'Absent':
                absent_count += 1
            elif status == 'Late':
                late_count += 1
        
        total = present_count + absent_count + late_count
        self.status_var.set(f"Total: {total} | Present: {present_count} | Absent: {absent_count} | Late: {late_count}")


class AttendanceEditDialog:
    def __init__(self, parent, student_id, name, status, arrival_time, departure_time, notes):
        self.result = None
        
        self.dialog = tk.Toplevel(parent)
        self.dialog.title(f"Edit Attendance - {name}")
        self.dialog.geometry("400x300")
        self.dialog.transient(parent)
        self.dialog.grab_set()
        
        # Center the dialog
        self.dialog.geometry("+%d+%d" % (parent.winfo_rootx() + 50, parent.winfo_rooty() + 50))
        
        # Create form
        form_frame = ttk.Frame(self.dialog, padding=20)
        form_frame.pack(fill="both", expand=True)
        
        ttk.Label(form_frame, text=f"Student: {name} ({student_id})", font=("Arial", 10, "bold")).pack(pady=(0, 10))
        
        # Status
        ttk.Label(form_frame, text="Status:").pack(anchor="w")
        self.status_var = tk.StringVar(value=status)
        status_combo = ttk.Combobox(form_frame, textvariable=self.status_var, values=["Present", "Absent", "Late"])
        status_combo.pack(fill="x", pady=(0, 10))
        
        # Arrival time
        ttk.Label(form_frame, text="Arrival Time (HH:MM):").pack(anchor="w")
        self.arrival_var = tk.StringVar(value=arrival_time)
        ttk.Entry(form_frame, textvariable=self.arrival_var).pack(fill="x", pady=(0, 10))
        
        # Departure time
        ttk.Label(form_frame, text="Departure Time (HH:MM):").pack(anchor="w")
        self.departure_var = tk.StringVar(value=departure_time)
        ttk.Entry(form_frame, textvariable=self.departure_var).pack(fill="x", pady=(0, 10))
        
        # Notes
        ttk.Label(form_frame, text="Notes:").pack(anchor="w")
        # Get theme for text widget
        theme = {
            "bg_primary": "#ffffff",
            "fg_primary": "#0f172a",
            "accent": "#3b82f6",
        }
        self.notes_text = tk.Text(form_frame, height=4, width=40,
                                 bg=theme["bg_primary"], fg=theme["fg_primary"],
                                 insertbackground=theme["fg_primary"],
                                 selectbackground=theme["accent"],
                                 selectforeground="#ffffff")
        self.notes_text.pack(fill="x", pady=(0, 10))
        if notes:
            self.notes_text.insert(tk.END, notes)
        
        # Buttons
        button_frame = ttk.Frame(form_frame)
        button_frame.pack(fill="x", pady=(10, 0))
        
        ttk.Button(button_frame, text="Save", command=self.save).pack(side="right", padx=(5, 0))
        ttk.Button(button_frame, text="Cancel", command=self.cancel).pack(side="right")
        
        # Set current time buttons
        time_frame = ttk.Frame(form_frame)
        time_frame.pack(fill="x", pady=(5, 0))
        
        ttk.Button(time_frame, text="Set Current Time", command=self.set_current_time).pack(side="left")
        ttk.Button(time_frame, text="Clear Times", command=self.clear_times).pack(side="left", padx=(5, 0))
        
        self.dialog.wait_window()
    
    def set_current_time(self):
        current_time = datetime.now().strftime("%H:%M")
        self.arrival_var.set(current_time)
    
    def clear_times(self):
        self.arrival_var.set("")
        self.departure_var.set("")
    
    def save(self):
        self.result = {
            'status': self.status_var.get(),
            'arrival_time': self.arrival_var.get(),
            'departure_time': self.departure_var.get(),
            'notes': self.notes_text.get(1.0, tk.END).strip()
        }
        self.dialog.destroy()
    
    def cancel(self):
        self.dialog.destroy()
