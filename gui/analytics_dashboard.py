import tkinter as tk
from tkinter import ttk, messagebox
from datetime import datetime, timedelta
import matplotlib.pyplot as plt
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
import pandas as pd

class AnalyticsDashboard:
    def __init__(self, parent, db, theme_manager=None):
        self.parent = parent
        self.db = db
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

        # Date range selection
        date_frame = ttk.LabelFrame(frm, text="Date Range", padding=10)
        date_frame.pack(fill="x", padx=5, pady=5)
    
    def apply_theme(self, theme):
        """Apply theme to this component"""
        if self.main_frame:
            self.main_frame.configure(bg=theme["bg_primary"])
            # Update Text widget colors
            if hasattr(self, 'summary_text'):
                self.summary_text.configure(bg=theme["bg_primary"], fg=theme["fg_primary"],
                                          insertbackground=theme["fg_primary"],
                                          selectbackground=theme["accent"],
                                          selectforeground=theme.get("header_fg", "#ffffff"))

        ttk.Label(date_frame, text="From:").grid(row=0, column=0, padx=5)
        self.start_date = tk.StringVar(value=(datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d"))
        ttk.Entry(date_frame, textvariable=self.start_date, width=12).grid(row=0, column=1, padx=5)

        ttk.Label(date_frame, text="To:").grid(row=0, column=2, padx=5)
        self.end_date = tk.StringVar(value=datetime.now().strftime("%Y-%m-%d"))
        ttk.Entry(date_frame, textvariable=self.end_date, width=12).grid(row=0, column=3, padx=5)

        ttk.Button(date_frame, text="Generate Report", command=self.generate_report).grid(row=0, column=4, padx=10)

        # Class filter
        ttk.Label(date_frame, text="Class:").grid(row=1, column=0, padx=5, pady=5)
        self.class_filter = tk.StringVar()
        class_combo = ttk.Combobox(date_frame, textvariable=self.class_filter, width=15)
        class_combo.grid(row=1, column=1, padx=5, pady=5)
        self._load_classes(class_combo)

        # Main content area with notebook
        notebook = ttk.Notebook(frm)
        notebook.pack(fill="both", expand=True, pady=10)

        # Statistics tab
        self.stats_frame = ttk.Frame(notebook)
        notebook.add(self.stats_frame, text="Statistics")
        self._build_statistics_tab()

        # Charts tab
        self.charts_frame = ttk.Frame(notebook)
        notebook.add(self.charts_frame, text="Charts")
        self._build_charts_tab()

        # Trends tab
        self.trends_frame = ttk.Frame(notebook)
        notebook.add(self.trends_frame, text="Trends")
        self._build_trends_tab()

    def _load_classes(self, combo):
        classes = set()
        students = self.db.get_all_students()
        for student in students:
            if student[2]:  # class_section
                classes.add(student[2])
        combo['values'] = sorted(list(classes))
        combo.set("All Classes")

    def _build_statistics_tab(self):
        # Summary statistics
        summary_frame = ttk.LabelFrame(self.stats_frame, text="Summary Statistics", padding=10)
        summary_frame.pack(fill="x", padx=5, pady=5)

        theme = self._get_theme()
        self.summary_text = tk.Text(summary_frame, height=8, width=80,
                                    bg=theme["bg_primary"], fg=theme["fg_primary"],
                                    insertbackground=theme["fg_primary"],
                                    selectbackground=theme["accent"],
                                    selectforeground=theme.get("header_fg", "#ffffff"))
        summary_scroll = ttk.Scrollbar(summary_frame, orient="vertical", command=self.summary_text.yview)
        self.summary_text.configure(yscrollcommand=summary_scroll.set)
        self.summary_text.pack(side="left", fill="both", expand=True)
        summary_scroll.pack(side="right", fill="y")

        # Individual student statistics
        student_frame = ttk.LabelFrame(self.stats_frame, text="Student Statistics", padding=10)
        student_frame.pack(fill="both", expand=True, padx=5, pady=5)

        cols = ("Student ID", "Name", "Class", "Total Days", "Present", "Absent", "Late", "Percentage")
        self.stats_tree = ttk.Treeview(student_frame, columns=cols, show="headings", height=15)
        for col in cols:
            self.stats_tree.heading(col, text=col)
            self.stats_tree.column(col, width=100)
        self.stats_tree.pack(side="left", fill="both", expand=True)

        stats_scroll = ttk.Scrollbar(student_frame, orient="vertical", command=self.stats_tree.yview)
        self.stats_tree.configure(yscrollcommand=stats_scroll.set)
        stats_scroll.pack(side="right", fill="y")

        # Export button
        ttk.Button(self.stats_frame, text="Export Statistics to CSV", 
                  command=self.export_statistics).pack(pady=5)

    def _build_charts_tab(self):
        # Chart controls
        controls_frame = ttk.Frame(self.charts_frame)
        controls_frame.pack(fill="x", padx=5, pady=5)

        ttk.Button(controls_frame, text="Attendance Overview", 
                  command=self.plot_attendance_overview).pack(side="left", padx=5)
        ttk.Button(controls_frame, text="Daily Trends", 
                  command=self.plot_daily_trends).pack(side="left", padx=5)
        ttk.Button(controls_frame, text="Class Comparison", 
                  command=self.plot_class_comparison).pack(side="left", padx=5)

        # Chart area
        self.chart_frame = ttk.Frame(self.charts_frame)
        self.chart_frame.pack(fill="both", expand=True, padx=5, pady=5)

    def _build_trends_tab(self):
        # Student selection for individual trends
        trend_controls = ttk.Frame(self.trends_frame)
        trend_controls.pack(fill="x", padx=5, pady=5)

        ttk.Label(trend_controls, text="Select Student:").pack(side="left")
        self.student_var = tk.StringVar()
        student_combo = ttk.Combobox(trend_controls, textvariable=self.student_var, width=30)
        student_combo.pack(side="left", padx=5)
        self._load_students(student_combo)

        ttk.Button(trend_controls, text="Show Trends", 
                  command=self.plot_student_trends).pack(side="left", padx=10)

        # Trend chart area
        self.trend_chart_frame = ttk.Frame(self.trends_frame)
        self.trend_chart_frame.pack(fill="both", expand=True, padx=5, pady=5)

    def _load_students(self, combo):
        students = self.db.get_all_students()
        student_list = [f"{s[0]} - {s[1]}" for s in students]
        combo['values'] = student_list
        if student_list:
            combo.set(student_list[0])

    def generate_report(self):
        start_date = self.start_date.get()
        end_date = self.end_date.get()
        class_filter = self.class_filter.get() if self.class_filter.get() != "All Classes" else None

        try:
            # Generate summary statistics
            stats = self.db.get_attendance_statistics(start_date, end_date, class_filter)
            self._display_summary_stats(stats, start_date, end_date)
            self._display_student_stats(stats)

        except Exception as e:
            messagebox.showerror("Error", f"Failed to generate report: {str(e)}")

    def _display_summary_stats(self, stats, start_date, end_date):
        self.summary_text.delete(1.0, tk.END)
        
        total_students = len(stats)
        if total_students == 0:
            self.summary_text.insert(tk.END, "No data found for the selected criteria.")
            return

        total_days = sum(s[3] for s in stats)  # total_days
        total_present = sum(s[4] for s in stats)  # present_days
        total_absent = sum(s[5] for s in stats)  # absent_days
        total_late = sum(s[6] for s in stats)  # late_days

        avg_attendance = sum(s[7] for s in stats) / total_students if total_students > 0 else 0

        summary = f"""
ATTENDANCE REPORT
================
Date Range: {start_date} to {end_date}
Total Students: {total_students}
Total Days Tracked: {total_days}

OVERALL STATISTICS:
- Total Present: {total_present}
- Total Absent: {total_absent}
- Total Late: {total_late}
- Average Attendance Rate: {avg_attendance:.2f}%

TOP PERFORMERS (by attendance %):
"""
        for i, stat in enumerate(stats[:5]):
            if i < len(stats):
                summary += f"{i+1}. {stat[1]} ({stat[2]}) - {stat[7]}%\n"

        summary += "\nSTUDENTS NEEDING ATTENTION (lowest attendance %):\n"
        for i, stat in enumerate(stats[-5:]):
            if i < len(stats):
                summary += f"{i+1}. {stat[1]} ({stat[2]}) - {stat[7]}%\n"

        self.summary_text.insert(tk.END, summary)

    def _display_student_stats(self, stats):
        # Clear existing data
        for item in self.stats_tree.get_children():
            self.stats_tree.delete(item)

        # Insert new data
        for stat in stats:
            self.stats_tree.insert("", "end", values=stat)

    def plot_attendance_overview(self):
        self._clear_chart()
        start_date = self.start_date.get()
        end_date = self.end_date.get()

        try:
            data = self.db.get_attendance_by_date_range(start_date, end_date)
            if not data:
                messagebox.showinfo("No Data", "No attendance data found for the selected date range.")
                return

            dates = [d[0] for d in data]
            present = [d[2] for d in data]
            absent = [d[3] for d in data]
            late = [d[4] for d in data]

            fig, ax = plt.subplots(figsize=(10, 6))
            ax.plot(dates, present, label='Present', marker='o')
            ax.plot(dates, absent, label='Absent', marker='s')
            ax.plot(dates, late, label='Late', marker='^')
            ax.set_title('Daily Attendance Overview')
            ax.set_xlabel('Date')
            ax.set_ylabel('Number of Students')
            ax.legend()
            ax.tick_params(axis='x', rotation=45)

            canvas = FigureCanvasTkAgg(fig, self.chart_frame)
            canvas.draw()
            canvas.get_tk_widget().pack(fill="both", expand=True)

        except Exception as e:
            messagebox.showerror("Error", f"Failed to create chart: {str(e)}")

    def plot_daily_trends(self):
        self._clear_chart()
        start_date = self.start_date.get()
        end_date = self.end_date.get()

        try:
            data = self.db.get_attendance_by_date_range(start_date, end_date)
            if not data:
                messagebox.showinfo("No Data", "No attendance data found for the selected date range.")
                return

            dates = [d[0] for d in data]
            total_students = [d[1] for d in data]
            present = [d[2] for d in data]
            
            # Calculate attendance percentage
            percentages = [(p/t)*100 if t > 0 else 0 for p, t in zip(present, total_students)]

            fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(10, 8))
            
            # Daily counts
            ax1.plot(dates, present, label='Present', marker='o')
            ax1.plot(dates, total_students, label='Total', marker='s')
            ax1.set_title('Daily Attendance Counts')
            ax1.set_ylabel('Number of Students')
            ax1.legend()
            ax1.tick_params(axis='x', rotation=45)

            # Attendance percentage
            ax2.plot(dates, percentages, label='Attendance %', marker='o', color='green')
            ax2.set_title('Daily Attendance Percentage')
            ax2.set_xlabel('Date')
            ax2.set_ylabel('Attendance Percentage (%)')
            ax2.legend()
            ax2.tick_params(axis='x', rotation=45)

            plt.tight_layout()
            canvas = FigureCanvasTkAgg(fig, self.chart_frame)
            canvas.draw()
            canvas.get_tk_widget().pack(fill="both", expand=True)

        except Exception as e:
            messagebox.showerror("Error", f"Failed to create chart: {str(e)}")

    def plot_class_comparison(self):
        self._clear_chart()
        start_date = self.start_date.get()
        end_date = self.end_date.get()

        try:
            # Get statistics for each class
            classes = set()
            students = self.db.get_all_students()
            for student in students:
                if student[2]:  # class_section
                    classes.add(student[2])

            class_stats = {}
            for class_name in classes:
                stats = self.db.get_attendance_statistics(start_date, end_date, class_name)
                if stats:
                    avg_attendance = sum(s[7] for s in stats) / len(stats)
                    class_stats[class_name] = avg_attendance

            if not class_stats:
                messagebox.showinfo("No Data", "No class data found for comparison.")
                return

            fig, ax = plt.subplots(figsize=(10, 6))
            classes = list(class_stats.keys())
            percentages = list(class_stats.values())

            bars = ax.bar(classes, percentages)
            ax.set_title('Class Attendance Comparison')
            ax.set_xlabel('Class')
            ax.set_ylabel('Average Attendance Percentage (%)')
            ax.set_ylim(0, 100)

            # Add percentage labels on bars
            for bar, percentage in zip(bars, percentages):
                height = bar.get_height()
                ax.text(bar.get_x() + bar.get_width()/2., height + 1,
                       f'{percentage:.1f}%', ha='center', va='bottom')

            plt.xticks(rotation=45)
            plt.tight_layout()
            canvas = FigureCanvasTkAgg(fig, self.chart_frame)
            canvas.draw()
            canvas.get_tk_widget().pack(fill="both", expand=True)

        except Exception as e:
            messagebox.showerror("Error", f"Failed to create chart: {str(e)}")

    def plot_student_trends(self):
        self._clear_chart()
        student_text = self.student_var.get()
        if not student_text:
            messagebox.showwarning("Selection Required", "Please select a student.")
            return

        student_id = student_text.split(" - ")[0]
        
        try:
            trends = self.db.get_attendance_trends(student_id, 30)
            if not trends:
                messagebox.showinfo("No Data", f"No attendance data found for student {student_id}.")
                return

            dates = [t[0] for t in trends]
            statuses = [t[1] for t in trends]
            
            # Convert status to numeric values for plotting
            status_values = []
            for status in statuses:
                if status == 'Present':
                    status_values.append(1)
                elif status == 'Late':
                    status_values.append(0.5)
                else:  # Absent
                    status_values.append(0)

            fig, ax = plt.subplots(figsize=(12, 6))
            ax.plot(dates, status_values, marker='o', linewidth=2)
            ax.set_title(f'Attendance Trend for {student_text}')
            ax.set_xlabel('Date')
            ax.set_ylabel('Attendance Status')
            ax.set_ylim(-0.1, 1.1)
            ax.set_yticks([0, 0.5, 1])
            ax.set_yticklabels(['Absent', 'Late', 'Present'])
            ax.tick_params(axis='x', rotation=45)
            ax.grid(True, alpha=0.3)

            plt.tight_layout()
            canvas = FigureCanvasTkAgg(fig, self.trend_chart_frame)
            canvas.draw()
            canvas.get_tk_widget().pack(fill="both", expand=True)

        except Exception as e:
            messagebox.showerror("Error", f"Failed to create trend chart: {str(e)}")

    def _clear_chart(self):
        for widget in self.chart_frame.winfo_children():
            widget.destroy()

    def export_statistics(self):
        start_date = self.start_date.get()
        end_date = self.end_date.get()
        class_filter = self.class_filter.get() if self.class_filter.get() != "All Classes" else None

        try:
            stats = self.db.get_attendance_statistics(start_date, end_date, class_filter)
            if not stats:
                messagebox.showinfo("No Data", "No statistics to export.")
                return

            import csv
            import os
            filename = f"attendance_statistics_{start_date}_to_{end_date}.csv"
            filepath = os.path.join(os.getcwd(), filename)
            
            with open(filepath, 'w', newline='', encoding='utf-8') as f:
                writer = csv.writer(f)
                writer.writerow(['Student ID', 'Name', 'Class', 'Total Days', 'Present', 'Absent', 'Late', 'Percentage'])
                writer.writerows(stats)

            messagebox.showinfo("Export Complete", f"Statistics exported to:\n{filepath}")

        except Exception as e:
            messagebox.showerror("Error", f"Failed to export statistics: {str(e)}")
