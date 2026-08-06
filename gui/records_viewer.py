import tkinter as tk
from tkinter import ttk, messagebox
from datetime import datetime

class RecordsViewer:
    def __init__(self, parent, db, theme_manager=None):
        self.parent = parent
        self.db = db
        self.theme_manager = theme_manager
        self.date_var = tk.StringVar(value=datetime.now().strftime("%Y-%m-%d"))
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

        top = tk.Frame(frm, bg=theme["bg_secondary"], padx=10, pady=10)
        top.pack(fill="x")
        tk.Label(top, text="Date (YYYY-MM-DD)", bg=theme["bg_secondary"], fg=theme["fg_primary"]).pack(side="left")
        ttk.Entry(top, textvariable=self.date_var, width=12).pack(side="left", padx=5)
        ttk.Button(top, text="Load", command=self.load_records).pack(side="left", padx=5)

        list_frame = tk.Frame(frm, bg=theme["bg_primary"])
        list_frame.pack(fill="both", expand=True, pady=10)

        cols = ("student_id", "name", "status", "timestamp")
        self.tree = ttk.Treeview(list_frame, columns=cols, show="headings", height=18)
        for c in cols:
            self.tree.heading(c, text=c.replace("_", " ").title())
            self.tree.column(c, width=150)
        self.tree.pack(side="left", fill="both", expand=True)
        vsb = ttk.Scrollbar(list_frame, orient="vertical", command=self.tree.yview)
        # Use the correct option name so the scrollbar tracks the treeview
        self.tree.configure(yscrollcommand=vsb.set)
        vsb.pack(side="right", fill="y")

        btn_frame = tk.Frame(frm, bg=theme["bg_secondary"], padx=10, pady=10)
        btn_frame.pack(fill="x")
        ttk.Button(btn_frame, text="Export CSV", command=self.export_csv).pack(side="left")
        ttk.Button(btn_frame, text="Refresh", command=self.load_records).pack(side="left", padx=5)

        self.load_records()
    
    def apply_theme(self, theme):
        """Apply theme to this component"""
        if self.main_frame:
            self.main_frame.configure(bg=theme["bg_primary"])
            for widget in self.main_frame.winfo_children():
                if isinstance(widget, tk.Frame):
                    widget.configure(bg=theme.get("bg_secondary", theme["bg_primary"]))

    def load_records(self):
        for i in self.tree.get_children():
            self.tree.delete(i)
        date = self.date_var.get().strip()
        rows = self.db.get_attendance_by_date(date)
        # get_attendance_by_date returns:
        # (student_id, name, status, timestamp, arrival_time, departure_time, notes)
        # Only show the first four fields in this viewer.
        for r in rows:
            self.tree.insert("", "end", values=(r[0], r[1], r[2], r[3]))

    def export_csv(self):
        date = self.date_var.get().strip()
        rows = self.db.get_attendance_by_date(date)
        if not rows:
            messagebox.showinfo("No Data", "No attendance records found for that date.")
            return
        import csv, os
        out = os.path.join(os.getcwd(), f"attendance_{date}.csv")
        with open(out, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(["student_id", "name", "status", "timestamp"])
            # Match the header by only writing the first four columns
            for r in rows:
                writer.writerow([r[0], r[1], r[2], r[3]])
        messagebox.showinfo("Exported", f"CSV exported to:\n{out}")
