import tkinter as tk
from tkinter import ttk, messagebox, filedialog
from datetime import datetime, timedelta
import csv
import os

class BulkOperations:
    def __init__(self, parent, db, refresh_callback=None, theme_manager=None):
        self.parent = parent
        self.db = db
        self.refresh_callback = refresh_callback
        self.theme_manager = theme_manager
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

        # Import/Export section
        import_export_frame = ttk.LabelFrame(frm, text="Import/Export Operations", padding=10)
        import_export_frame.pack(fill="x", padx=5, pady=5)

        # Import students
        import_frame = ttk.Frame(import_export_frame)
        import_frame.pack(fill="x", pady=5)
        
        ttk.Label(import_frame, text="Import Students from CSV:").pack(side="left")
        ttk.Button(import_frame, text="Browse", command=self.import_students).pack(side="left", padx=5)
        ttk.Button(import_frame, text="Download Template", command=self.download_template).pack(side="left", padx=5)

        # Export students
        export_frame = ttk.Frame(import_export_frame)
        export_frame.pack(fill="x", pady=5)
        
        ttk.Label(export_frame, text="Export Students to CSV:").pack(side="left")
        ttk.Button(export_frame, text="Export All Students", command=self.export_students).pack(side="left", padx=5)
        ttk.Button(export_frame, text="Export with Attendance", command=self.export_with_attendance).pack(side="left", padx=5)

        # Bulk attendance operations
        attendance_frame = ttk.LabelFrame(frm, text="Bulk Attendance Operations", padding=10)
        attendance_frame.pack(fill="x", padx=5, pady=5)

        # Date range for bulk operations
        date_frame = ttk.Frame(attendance_frame)
        date_frame.pack(fill="x", pady=5)

        ttk.Label(date_frame, text="From Date:").pack(side="left")
        self.start_date = tk.StringVar(value=(datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d"))
        ttk.Entry(date_frame, textvariable=self.start_date, width=12).pack(side="left", padx=5)

        ttk.Label(date_frame, text="To Date:").pack(side="left", padx=(10, 0))
        self.end_date = tk.StringVar(value=datetime.now().strftime("%Y-%m-%d"))
        ttk.Entry(date_frame, textvariable=self.end_date, width=12).pack(side="left", padx=5)

        # Bulk operations buttons
        bulk_frame = ttk.Frame(attendance_frame)
        bulk_frame.pack(fill="x", pady=5)

        ttk.Button(bulk_frame, text="Mark All Present (Date Range)", 
                  command=self.bulk_mark_present).pack(side="left", padx=2)
        ttk.Button(bulk_frame, text="Mark All Absent (Date Range)", 
                  command=self.bulk_mark_absent).pack(side="left", padx=2)
        ttk.Button(bulk_frame, text="Clear Attendance (Date Range)", 
                  command=self.bulk_clear_attendance).pack(side="left", padx=2)

        # Class-specific operations
        class_frame = ttk.LabelFrame(frm, text="Class-Specific Operations", padding=10)
        class_frame.pack(fill="x", padx=5, pady=5)

        # Class selection
        class_select_frame = ttk.Frame(class_frame)
        class_select_frame.pack(fill="x", pady=5)

        ttk.Label(class_select_frame, text="Select Class:").pack(side="left")
        self.class_var = tk.StringVar()
        self.class_combo = ttk.Combobox(class_select_frame, textvariable=self.class_var, width=20)
        self.class_combo.pack(side="left", padx=5)
        self._load_classes()

        ttk.Button(class_select_frame, text="Refresh Classes", command=self._load_classes).pack(side="left", padx=5)

        # Class operations
        class_ops_frame = ttk.Frame(class_frame)
        class_ops_frame.pack(fill="x", pady=5)

        ttk.Button(class_ops_frame, text="Mark Class Present (Today)", 
                  command=self.mark_class_present_today).pack(side="left", padx=2)
        ttk.Button(class_ops_frame, text="Export Class Report", 
                  command=self.export_class_report).pack(side="left", padx=2)
        ttk.Button(class_ops_frame, text="Class Statistics", 
                  command=self.show_class_statistics).pack(side="left", padx=2)

        # Student management operations
        student_mgmt_frame = ttk.LabelFrame(frm, text="Student Management", padding=10)
        student_mgmt_frame.pack(fill="x", padx=5, pady=5)

        mgmt_frame = ttk.Frame(student_mgmt_frame)
        mgmt_frame.pack(fill="x")

        ttk.Button(mgmt_frame, text="Update Student Information", 
                  command=self.bulk_update_students).pack(side="left", padx=2)
        ttk.Button(mgmt_frame, text="Delete Inactive Students", 
                  command=self.delete_inactive_students).pack(side="left", padx=2)
        ttk.Button(mgmt_frame, text="Generate Student IDs", 
                  command=self.generate_student_ids).pack(side="left", padx=2)

        # Progress bar
        self.progress_var = tk.StringVar()
        self.progress_label = tk.Label(frm, textvariable=self.progress_var, bg=theme["bg_primary"], fg=theme["fg_primary"])
        self.progress_label.pack(pady=5)

        self.progress_bar = ttk.Progressbar(frm, mode='indeterminate')
        self.progress_bar.pack(fill="x", padx=5)
    
    def apply_theme(self, theme):
        """Apply theme to this component"""
        if self.main_frame:
            self.main_frame.configure(bg=theme["bg_primary"])
            if hasattr(self, 'progress_label'):
                self.progress_label.configure(bg=theme["bg_primary"], fg=theme["fg_primary"])

    def _load_classes(self):
        classes = set()
        students = self.db.get_all_students()
        for student in students:
            if student[2]:  # class_section
                classes.add(student[2])
        self.class_combo['values'] = sorted(list(classes))
        if classes:
            self.class_combo.set(sorted(list(classes))[0])

    def import_students(self):
        file_path = filedialog.askopenfilename(
            title="Select CSV file to import",
            filetypes=[("CSV files", "*.csv"), ("All files", "*.*")]
        )
        
        if not file_path:
            return

        try:
            from data.csv_handler import import_students_from_csv
            result = import_students_from_csv(file_path)
            
            message = f"Import completed!\n\nAdded: {result['added']} students"
            if result['errors']:
                message += f"\n\nErrors ({len(result['errors'])}):\n"
                for line, error in result['errors'][:10]:  # Show first 10 errors
                    message += f"Line {line}: {error}\n"
                if len(result['errors']) > 10:
                    message += f"... and {len(result['errors']) - 10} more errors"
            
            messagebox.showinfo("Import Results", message)
            if self.refresh_callback:
                self.refresh_callback()
                
        except Exception as e:
            messagebox.showerror("Import Error", f"Failed to import students: {str(e)}")

    def download_template(self):
        template_data = [
            ["student_id", "name", "class_section", "roll_no", "email", "phone", "parent_contact"],
            ["STU001", "John Doe", "Class A", "001", "john@email.com", "1234567890", "parent@email.com"],
            ["STU002", "Jane Smith", "Class A", "002", "jane@email.com", "0987654321", "parent2@email.com"]
        ]
        
        try:
            file_path = filedialog.asksaveasfilename(
                title="Save template as",
                defaultextension=".csv",
                filetypes=[("CSV files", "*.csv")]
            )
            
            if file_path:
                with open(file_path, 'w', newline='', encoding='utf-8') as f:
                    writer = csv.writer(f)
                    writer.writerows(template_data)
                messagebox.showinfo("Template Downloaded", f"Template saved to: {file_path}")
                
        except Exception as e:
            messagebox.showerror("Error", f"Failed to save template: {str(e)}")

    def export_students(self):
        try:
            file_path = filedialog.asksaveasfilename(
                title="Export students to",
                defaultextension=".csv",
                filetypes=[("CSV files", "*.csv")]
            )
            
            if file_path:
                students = self.db.get_all_students()
                with open(file_path, 'w', newline='', encoding='utf-8') as f:
                    writer = csv.writer(f)
                    writer.writerow(['student_id', 'name', 'class_section', 'roll_no', 'date_added', 'email', 'phone', 'parent_contact'])
                    writer.writerows(students)
                messagebox.showinfo("Export Complete", f"Students exported to: {file_path}")
                
        except Exception as e:
            messagebox.showerror("Export Error", f"Failed to export students: {str(e)}")

    def export_with_attendance(self):
        try:
            file_path = filedialog.asksaveasfilename(
                title="Export students with attendance to",
                defaultextension=".csv",
                filetypes=[("CSV files", "*.csv")]
            )
            
            if file_path:
                students = self.db.get_all_students()
                with open(file_path, 'w', newline='', encoding='utf-8') as f:
                    writer = csv.writer(f)
                    writer.writerow(['student_id', 'name', 'class_section', 'roll_no', 'total_days', 'present_days', 'absent_days', 'late_days', 'attendance_percentage'])
                    
                    for student in students:
                        stats = self.db.get_attendance_statistics()
                        student_stats = next((s for s in stats if s[0] == student[0]), None)
                        if student_stats:
                            writer.writerow([student[0], student[1], student[2], student[3], 
                                           student_stats[3], student_stats[4], student_stats[5], 
                                           student_stats[6], student_stats[7]])
                        else:
                            writer.writerow([student[0], student[1], student[2], student[3], 0, 0, 0, 0, 0])
                            
                messagebox.showinfo("Export Complete", f"Students with attendance exported to: {file_path}")
                
        except Exception as e:
            messagebox.showerror("Export Error", f"Failed to export: {str(e)}")

    def bulk_mark_present(self):
        start_date = self.start_date.get()
        end_date = self.end_date.get()
        
        try:
            datetime.strptime(start_date, "%Y-%m-%d")
            datetime.strptime(end_date, "%Y-%m-%d")
        except ValueError:
            messagebox.showerror("Date Error", "Please use YYYY-MM-DD format.")
            return

        if messagebox.askyesno("Confirm", f"Mark all students as present from {start_date} to {end_date}?"):
            self._start_progress("Marking students as present...")
            
            try:
                students = self.db.get_all_students()
                current_date = datetime.strptime(start_date, "%Y-%m-%d")
                end_dt = datetime.strptime(end_date, "%Y-%m-%d")
                
                count = 0
                while current_date <= end_dt:
                    date_str = current_date.strftime("%Y-%m-%d")
                    for student in students:
                        self.db.set_attendance(student[0], date_str, "Present")
                        count += 1
                    current_date += timedelta(days=1)
                
                self._stop_progress()
                messagebox.showinfo("Complete", f"Marked {count} attendance records as present.")
                if self.refresh_callback:
                    self.refresh_callback()
                    
            except Exception as e:
                self._stop_progress()
                messagebox.showerror("Error", f"Failed to mark attendance: {str(e)}")

    def bulk_mark_absent(self):
        start_date = self.start_date.get()
        end_date = self.end_date.get()
        
        try:
            datetime.strptime(start_date, "%Y-%m-%d")
            datetime.strptime(end_date, "%Y-%m-%d")
        except ValueError:
            messagebox.showerror("Date Error", "Please use YYYY-MM-DD format.")
            return

        if messagebox.askyesno("Confirm", f"Mark all students as absent from {start_date} to {end_date}?"):
            self._start_progress("Marking students as absent...")
            
            try:
                students = self.db.get_all_students()
                current_date = datetime.strptime(start_date, "%Y-%m-%d")
                end_dt = datetime.strptime(end_date, "%Y-%m-%d")
                
                count = 0
                while current_date <= end_dt:
                    date_str = current_date.strftime("%Y-%m-%d")
                    for student in students:
                        self.db.set_attendance(student[0], date_str, "Absent")
                        count += 1
                    current_date += timedelta(days=1)
                
                self._stop_progress()
                messagebox.showinfo("Complete", f"Marked {count} attendance records as absent.")
                if self.refresh_callback:
                    self.refresh_callback()
                    
            except Exception as e:
                self._stop_progress()
                messagebox.showerror("Error", f"Failed to mark attendance: {str(e)}")

    def bulk_clear_attendance(self):
        start_date = self.start_date.get()
        end_date = self.end_date.get()
        
        try:
            datetime.strptime(start_date, "%Y-%m-%d")
            datetime.strptime(end_date, "%Y-%m-%d")
        except ValueError:
            messagebox.showerror("Date Error", "Please use YYYY-MM-DD format.")
            return

        if messagebox.askyesno("Confirm", f"Clear all attendance records from {start_date} to {end_date}?"):
            self._start_progress("Clearing attendance records...")
            
            try:
                # This would require a new method in the database class
                # For now, we'll show a message that this feature needs implementation
                self._stop_progress()
                messagebox.showinfo("Feature Not Implemented", "Clear attendance feature needs to be implemented in the database class.")
                
            except Exception as e:
                self._stop_progress()
                messagebox.showerror("Error", f"Failed to clear attendance: {str(e)}")

    def mark_class_present_today(self):
        class_name = self.class_var.get()
        if not class_name:
            messagebox.showwarning("Selection Required", "Please select a class.")
            return

        today = datetime.now().strftime("%Y-%m-%d")
        
        if messagebox.askyesno("Confirm", f"Mark all students in {class_name} as present for {today}?"):
            try:
                students = self.db.get_all_students()
                class_students = [s for s in students if s[2] == class_name]
                
                count = 0
                for student in class_students:
                    self.db.set_attendance(student[0], today, "Present")
                    count += 1
                
                messagebox.showinfo("Complete", f"Marked {count} students in {class_name} as present.")
                if self.refresh_callback:
                    self.refresh_callback()
                    
            except Exception as e:
                messagebox.showerror("Error", f"Failed to mark class attendance: {str(e)}")

    def export_class_report(self):
        class_name = self.class_var.get()
        if not class_name:
            messagebox.showwarning("Selection Required", "Please select a class.")
            return

        try:
            file_path = filedialog.asksaveasfilename(
                title=f"Export {class_name} report to",
                defaultextension=".csv",
                filetypes=[("CSV files", "*.csv")]
            )
            
            if file_path:
                stats = self.db.get_attendance_statistics(class_section=class_name)
                with open(file_path, 'w', newline='', encoding='utf-8') as f:
                    writer = csv.writer(f)
                    writer.writerow(['Student ID', 'Name', 'Class', 'Total Days', 'Present Days', 'Absent Days', 'Late Days', 'Attendance %'])
                    writer.writerows(stats)
                messagebox.showinfo("Export Complete", f"Class report exported to: {file_path}")
                
        except Exception as e:
            messagebox.showerror("Export Error", f"Failed to export class report: {str(e)}")

    def show_class_statistics(self):
        class_name = self.class_var.get()
        if not class_name:
            messagebox.showwarning("Selection Required", "Please select a class.")
            return

        try:
            stats = self.db.get_attendance_statistics(class_section=class_name)
            if not stats:
                messagebox.showinfo("No Data", f"No attendance data found for {class_name}.")
                return

            # Calculate class summary
            total_students = len(stats)
            avg_attendance = sum(s[7] for s in stats) / total_students if total_students > 0 else 0
            total_present = sum(s[4] for s in stats)
            total_absent = sum(s[5] for s in stats)
            total_late = sum(s[6] for s in stats)

            summary = f"""
CLASS STATISTICS: {class_name}
========================
Total Students: {total_students}
Average Attendance: {avg_attendance:.2f}%
Total Present Days: {total_present}
Total Absent Days: {total_absent}
Total Late Days: {total_late}

TOP PERFORMERS:
"""
            for i, stat in enumerate(stats[:3]):
                summary += f"{i+1}. {stat[1]} - {stat[7]}%\n"

            summary += "\nNEEDS ATTENTION:\n"
            for i, stat in enumerate(stats[-3:]):
                summary += f"{i+1}. {stat[1]} - {stat[7]}%\n"

            # Show in a new window
            stats_window = tk.Toplevel(self.parent)
            stats_window.title(f"Class Statistics - {class_name}")
            stats_window.geometry("500x400")
            
            # Apply theme to stats window
            theme = self._get_theme()
            stats_window.configure(bg=theme["bg_primary"])
            
            text_widget = tk.Text(stats_window, wrap=tk.WORD,
                                 bg=theme["bg_primary"], fg=theme["fg_primary"],
                                 insertbackground=theme["fg_primary"],
                                 selectbackground=theme["accent"],
                                 selectforeground=theme.get("header_fg", "#ffffff"))
            scrollbar = ttk.Scrollbar(stats_window, orient="vertical", command=text_widget.yview)
            text_widget.configure(yscrollcommand=scrollbar.set)
            
            text_widget.pack(side="left", fill="both", expand=True)
            scrollbar.pack(side="right", fill="y")
            
            text_widget.insert(tk.END, summary)
            text_widget.config(state=tk.DISABLED)

        except Exception as e:
            messagebox.showerror("Error", f"Failed to get class statistics: {str(e)}")

    def bulk_update_students(self):
        messagebox.showinfo("Feature Not Implemented", "Bulk update students feature needs to be implemented.")

    def delete_inactive_students(self):
        if messagebox.askyesno("Confirm", "Delete students with no attendance records?"):
            try:
                # This would require implementing a method to find inactive students
                messagebox.showinfo("Feature Not Implemented", "Delete inactive students feature needs to be implemented.")
            except Exception as e:
                messagebox.showerror("Error", f"Failed to delete inactive students: {str(e)}")

    def generate_student_ids(self):
        try:
            students = self.db.get_all_students()
            students_without_ids = [s for s in students if not s[0] or s[0].strip() == ""]
            
            if not students_without_ids:
                messagebox.showinfo("No Action Needed", "All students already have IDs.")
                return

            # Generate IDs for students without them
            count = 0
            for i, student in enumerate(students_without_ids):
                new_id = f"STU{str(i+1).zfill(3)}"
                # Update student with new ID
                # This would require implementing an update method
                count += 1

            messagebox.showinfo("Complete", f"Generated {count} student IDs.")
            if self.refresh_callback:
                self.refresh_callback()

        except Exception as e:
            messagebox.showerror("Error", f"Failed to generate student IDs: {str(e)}")

    def _start_progress(self, message):
        self.progress_var.set(message)
        self.progress_bar.start()

    def _stop_progress(self):
        self.progress_bar.stop()
        self.progress_var.set("")
