import tkinter as tk
from tkinter import ttk, messagebox
from datetime import datetime
import os

import pandas as pd


class AttendanceMarker:
    STATUS_ORDER = ("Present", "Late", "Absent")
    REASON_OPTIONS = ("", "Sick 🤒", "School Activity 🏫", "Other…")
    PARENT_CONTACT_OPTIONS = ("Not needed", "Notified ✅", "Unnotified ⚠️")

    def __init__(self, parent, db, refresh_callback=None, theme_manager=None):
        self.parent = parent
        self.db = db
        self.refresh_callback = refresh_callback
        self.theme_manager = theme_manager
        self.date_var = tk.StringVar(value=datetime.now().strftime("%Y-%m-%d"))
        self.search_var = tk.StringVar()
        self.summary_var = tk.StringVar(value="Loading students…")
        self.detail_name_var = tk.StringVar(value="Select a student")
        self.detail_class_var = tk.StringVar(value="")
        self.detail_status_var = tk.StringVar(value="Absent")
        self._detail_sync_locked = False
        self.students_data = []
        self.students_map = {}
        self.banner = None
        self.main_frame = None
        self._build_ui()

    def _get_theme(self):
        """Get current theme"""
        if self.theme_manager:
            return self.theme_manager.get_theme()
        return {
            "header_bg": "#3b82f6",
            "header_fg": "#ffffff",
            "bg_primary": "#ffffff",
            "bg_secondary": "#f8fafc",
            "fg_primary": "#0f172a",
            "accent": "#3b82f6",
            "success": "#10b981",
            "success_bg": "#d1fae5",
            "warning": "#f59e0b",
            "warning_bg": "#fef3c7",
            "error": "#ef4444",
            "error_bg": "#fee2e2",
        }
    
    def _build_ui(self):
        theme = self._get_theme()
        self.main_frame = frm = tk.Frame(self.parent, bg=theme["bg_primary"])
        frm.pack(fill="both", expand=True)

        # Title / banner with theme colors
        self.banner = tk.Frame(frm, bg=theme["header_bg"], height=70)
        self.banner.pack(fill="x")
        self.banner.pack_propagate(False)
        self.banner_label = tk.Label(
            self.banner,
            text="📋 Attendance Tracker",
            bg=theme["header_bg"],
            fg=theme["header_fg"],
            font=("Segoe UI", 18, "bold")
        )
        self.banner_label.pack(side="left", padx=20, pady=10)

        # Header controls (date + bulk actions)
        header = tk.Frame(frm, bg=theme["bg_secondary"], padx=10, pady=10)
        header.pack(fill="x")

        tk.Label(header, text="Date (YYYY-MM-DD)", bg=theme["bg_secondary"], fg=theme["fg_primary"]).pack(side="left")
        date_entry = ttk.Entry(header, textvariable=self.date_var, width=12)
        date_entry.pack(side="left", padx=5)
        ttk.Button(header, text="Today", command=self._set_today).pack(side="left")
        ttk.Button(header, text="Load", command=self.load_students).pack(side="left", padx=(5, 0))
        ttk.Button(header, text="Mark All Present", command=self.mark_all_present).pack(side="right")
        ttk.Button(header, text="Mark All Absent", command=self.mark_all_absent).pack(side="right", padx=(0, 5))

        # Search & summary
        utility_bar = tk.Frame(frm, bg=theme["bg_secondary"], padx=10)
        utility_bar.pack(fill="x", pady=(0, 8))

        search_box = ttk.Frame(utility_bar)
        search_box.pack(side="left")
        tk.Label(search_box, text="Quick Search", bg=theme["bg_secondary"], fg=theme["fg_primary"]).pack(side="left")
        search_entry = ttk.Entry(search_box, textvariable=self.search_var, width=30)
        search_entry.pack(side="left", padx=5)
        ttk.Button(search_box, text="Clear", command=lambda: self.search_var.set("")).pack(side="left")
        self.search_var.trace_add("write", lambda *_: self._apply_filter())

        summary_label = tk.Label(utility_bar, textvariable=self.summary_var, anchor="e", bg=theme["bg_secondary"], fg=theme["fg_primary"])
        summary_label.pack(side="right")

        # Main content: tree + detail panel
        content = tk.Frame(frm, bg=theme["bg_primary"], padx=10, pady=10)
        content.pack(fill="both", expand=True, pady=(5, 0))

        tree_frame = ttk.Frame(content)
        tree_frame.pack(side="left", fill="both", expand=True)

        # Columns modeled after the spreadsheet-style tracker
        cols = ("date", "class", "surname", "given_name", "student_id", "status", "reason", "parent_contacted")
        self.tree = ttk.Treeview(
            tree_frame,
            columns=cols,
            show="headings",
            selectmode="browse",
            height=16
        )
        self.tree.heading("date", text="Date")
        self.tree.column("date", width=100, anchor="center")
        self.tree.heading("class", text="Class")
        self.tree.column("class", width=80, anchor="center")
        self.tree.heading("surname", text="Student Surname")
        self.tree.column("surname", width=140)
        self.tree.heading("given_name", text="Given Name")
        self.tree.column("given_name", width=130)
        self.tree.heading("student_id", text="Student ID")
        self.tree.column("student_id", width=80, anchor="center")
        self.tree.heading("status", text="Attendance")
        self.tree.column("status", width=110, anchor="center")
        self.tree.heading("reason", text="Reason")
        self.tree.column("reason", width=150)
        self.tree.heading("parent_contacted", text="Parent Contacted?")
        self.tree.column("parent_contacted", width=140)
        self.tree.pack(side="left", fill="both", expand=True)

        vsb = ttk.Scrollbar(tree_frame, orient="vertical", command=self.tree.yview)
        self.tree.configure(yscrollcommand=vsb.set)
        vsb.pack(side="right", fill="y")

        # Tag styles for quick visual scan with theme colors
        theme = self._get_theme()
        self.tree.tag_configure("Present", background=theme.get("success_bg", "#e8f6ec"))
        self.tree.tag_configure("Absent", background=theme.get("error_bg", "#fdeaea"))
        self.tree.tag_configure("Late", background=theme.get("warning_bg", "#fffbe6"))

        # Detail / quick actions panel
        detail = ttk.LabelFrame(content, text="Quick Update", padding=10)
        detail.pack(side="left", fill="y", padx=(10, 0))

        tk.Label(detail, textvariable=self.detail_name_var, font=("Segoe UI", 10, "bold"), wraplength=220, 
                bg=theme["bg_primary"], fg=theme["fg_primary"]).pack(anchor="w")
        tk.Label(detail, textvariable=self.detail_class_var, fg=theme["fg_secondary"], 
                bg=theme["bg_primary"]).pack(anchor="w", pady=(0, 10))

        tk.Label(detail, text="Attendance", bg=theme["bg_primary"], fg=theme["fg_primary"]).pack(anchor="w")
        for status in self.STATUS_ORDER:
            ttk.Radiobutton(
                detail,
                text=status,
                value=status,
                variable=self.detail_status_var,
                command=self._apply_detail_status
            ).pack(anchor="w", pady=2)

        ttk.Separator(detail, orient="horizontal").pack(fill="x", pady=10)

        # Reason dropdown
        ttk.Label(detail, text="Reason").pack(anchor="w")
        self.detail_reason_var = tk.StringVar(value=self.REASON_OPTIONS[0])
        ttk.Combobox(detail, textvariable=self.detail_reason_var, values=self.REASON_OPTIONS, state="readonly").pack(
            fill="x", pady=(0, 8)
        )

        # Parent contacted dropdown
        ttk.Label(detail, text="Parent Contacted?").pack(anchor="w")
        self.detail_parent_var = tk.StringVar(value=self.PARENT_CONTACT_OPTIONS[0])
        ttk.Combobox(
            detail,
            textvariable=self.detail_parent_var,
            values=self.PARENT_CONTACT_OPTIONS,
            state="readonly",
        ).pack(fill="x", pady=(0, 10))

        ttk.Button(detail, text="Mark Present", command=lambda: self._set_selected_status("Present")).pack(fill="x", pady=2)
        ttk.Button(detail, text="Mark Absent", command=lambda: self._set_selected_status("Absent")).pack(fill="x", pady=2)
        ttk.Button(detail, text="Mark Late", command=lambda: self._set_selected_status("Late")).pack(fill="x", pady=2)

        ttk.Separator(detail, orient="horizontal").pack(fill="x", pady=10)
        ttk.Button(detail, text="Toggle Present/Absent", command=self._toggle_selected_status).pack(fill="x", pady=2)

        # Footer actions
        btn_frame = tk.Frame(frm, bg=theme["bg_secondary"], padx=10, pady=10)
        btn_frame.pack(fill="x", pady=(0, 5))
        ttk.Button(btn_frame, text="Save Attendance", command=self.save_attendance).pack(side="left")
        ttk.Button(btn_frame, text="Refresh", command=self.load_students).pack(side="left", padx=5)
        ttk.Button(btn_frame, text="Export to Excel", command=self.export_to_excel).pack(side="left", padx=5)

        ttk.Button(btn_frame, text="Mark Selected Present", command=lambda: self._set_selected_status("Present")).pack(side="right")
        ttk.Button(btn_frame, text="Mark Selected Absent", command=lambda: self._set_selected_status("Absent")).pack(side="right", padx=5)

        # Tree interactions
        self.tree.bind("<<TreeviewSelect>>", self._on_tree_select)
        self.tree.bind("<Double-1>", self._on_tree_double_click)
        self.tree.bind("<Button-3>", self._on_tree_right_click)

        self.context_menu = tk.Menu(self.tree, tearoff=0)
        self.context_menu.add_command(label="Mark Present", command=lambda: self._set_selected_status("Present"))
        self.context_menu.add_command(label="Mark Absent", command=lambda: self._set_selected_status("Absent"))
        self.context_menu.add_command(label="Mark Late", command=lambda: self._set_selected_status("Late"))

        self.load_students()

    def _set_today(self):
        self.date_var.set(datetime.now().strftime("%Y-%m-%d"))
        self.load_students()

    def load_students(self):
        date = self.date_var.get().strip()
        try:
            datetime.strptime(date, "%Y-%m-%d")
        except ValueError:
            messagebox.showerror("Date Error", "Use YYYY-MM-DD format.")
            return

        rows = self.db.get_all_students()

        # Get existing attendance for the chosen date, including notes (for reason/parent)
        att_rows = self.db.get_attendance_by_date(date)
        att_map = {}
        for rec in att_rows:
            # rec: (student_id, name, status, timestamp, arrival_time, departure_time, notes)
            sid = rec[0]
            status = rec[2]
            notes = rec[6] if len(rec) > 6 else None
            reason, parent = self._parse_notes(notes)
            att_map[sid] = {
                "status": status,
                "reason": reason,
                "parent_contacted": parent,
            }
        self.students_data = []
        self.students_map = {}

        for r in rows:
            full_name = r[1] or ""
            parts = full_name.split()
            given = parts[0] if parts else ""
            surname = " ".join(parts[1:]) if len(parts) > 1 else ""

            att = att_map.get(r[0], {})
            status = att.get("status") or "Absent"
            reason = att.get("reason") or self.REASON_OPTIONS[0]
            parent_contacted = att.get("parent_contacted") or self.PARENT_CONTACT_OPTIONS[0]

            student = {
                "student_id": r[0],
                "given_name": given,
                "surname": surname,
                "class_section": r[2] or "",
                "status": status,
                "reason": reason,
                "parent_contacted": parent_contacted,
            }
            self.students_data.append(student)
            self.students_map[student["student_id"]] = student

        self._populate_tree(self.students_data)
        self.summary_var.set("Loaded {} students".format(len(self.students_data)))

    def _populate_tree(self, dataset):
        for iid in self.tree.get_children():
            self.tree.delete(iid)

        for student in dataset:
            iid = student["student_id"]
            self.tree.insert(
                "",
                "end",
                iid=iid,
                values=(
                    self.date_var.get().strip(),
                    student["class_section"],
                    student["surname"],
                    student["given_name"],
                    student["student_id"],
                    student["status"],
                    student["reason"],
                    student["parent_contacted"],
                ),
                tags=(student["status"],)
            )

        self._update_summary()

    def _apply_filter(self):
        query = self.search_var.get().strip().lower()
        if not query:
            filtered = self.students_data
        else:
            filtered = [
                s for s in self.students_data
                if query in f"{s['given_name']} {s['surname']}".lower()
                or query in s["student_id"].lower()
                or query in (s["class_section"] or "").lower()
            ]
        self._populate_tree(filtered)

    def mark_all_present(self):
        for student in self.students_data:
            student["status"] = "Present"
        for iid in self.tree.get_children():
            self.tree.item(iid, tags=("Present",))
            values = list(self.tree.item(iid)["values"])
            # values: date, class, surname, given, id, status, reason, parent_contacted
            values[5] = "Present"
            self.tree.item(iid, values=values)
        self._update_summary()

    def mark_all_absent(self):
        for student in self.students_data:
            student["status"] = "Absent"
        for iid in self.tree.get_children():
            self.tree.item(iid, tags=("Absent",))
            values = list(self.tree.item(iid)["values"])
            # values: date, class, surname, given, id, status, reason, parent_contacted
            values[5] = "Absent"
            self.tree.item(iid, values=values)
        self._update_summary()

    def _on_tree_select(self, _event=None):
        selection = self.tree.selection()
        if not selection:
            self.detail_name_var.set("Select a student")
            self.detail_class_var.set("")
            return
        student_id = selection[0]
        student = self.students_map.get(student_id)
        if not student:
            return
        self._detail_sync_locked = True
        display_name = f"{student['given_name']} {student['surname']}".strip() or student_id
        self.detail_name_var.set(f"{display_name} ({student_id})")
        self.detail_class_var.set(student["class_section"] or "—")
        self.detail_status_var.set(student["status"])
        self.detail_reason_var.set(student["reason"])
        self.detail_parent_var.set(student["parent_contacted"])
        self._detail_sync_locked = False

    def _on_tree_double_click(self, event):
        iid = self.tree.identify_row(event.y)
        if not iid:
            return
        student = self.students_map.get(iid)
        if not student:
            return
        new_status = "Present" if student["status"] != "Present" else "Absent"
        self._update_student_status(iid, new_status)
        self.tree.selection_set(iid)
        self._on_tree_select()

    def _on_tree_right_click(self, event):
        iid = self.tree.identify_row(event.y)
        if iid:
            self.tree.selection_set(iid)
            try:
                self.context_menu.tk_popup(event.x_root, event.y_root)
            finally:
                self.context_menu.grab_release()

    def _apply_detail_status(self):
        if self._detail_sync_locked:
            return
        selection = self.tree.selection()
        if not selection:
            return
        student_id = selection[0]
        self._update_student_status(
            student_id,
            self.detail_status_var.get(),
            reason=self.detail_reason_var.get(),
            parent=self.detail_parent_var.get(),
        )

    def _toggle_selected_status(self):
        selection = self.tree.selection()
        if not selection:
            return
        student = self.students_map.get(selection[0])
        if not student:
            return
        new_status = "Present" if student["status"] != "Present" else "Absent"
        self._update_student_status(selection[0], new_status)

    def _set_selected_status(self, status):
        selection = self.tree.selection()
        if not selection:
            messagebox.showinfo("Select Student", "Select a student first.")
            return
        self._update_student_status(selection[0], status)

    def _update_student_status(self, student_id, status, reason=None, parent=None):
        student = self.students_map.get(student_id)
        if not student:
            return
        student["status"] = status
        if reason is not None:
            student["reason"] = reason
        if parent is not None:
            student["parent_contacted"] = parent
        if self.tree.exists(student_id):
            values = list(self.tree.item(student_id)["values"])
            # date, class, surname, given, id, status, reason, parent_contacted
            values[5] = status
            values[6] = student["reason"]
            values[7] = student["parent_contacted"]
            self.tree.item(student_id, values=values, tags=(status,))
        if not self._detail_sync_locked:
            self._detail_sync_locked = True
            self.detail_status_var.set(status)
            self.detail_reason_var.set(student["reason"])
            self.detail_parent_var.set(student["parent_contacted"])
            self._detail_sync_locked = False
        self._update_summary()

    def _update_summary(self):
        total = len(self.students_data)
        present = sum(1 for s in self.students_data if s["status"] == "Present")
        absent = sum(1 for s in self.students_data if s["status"] == "Absent")
        late = sum(1 for s in self.students_data if s["status"] == "Late")
        showing = len(self.tree.get_children())
        self.summary_var.set(
            f"Total: {total} • Present: {present} • Absent: {absent} • Late: {late} • Showing: {showing}"
        )

    def save_attendance(self):
        date = self.date_var.get().strip()
        try:
            datetime.strptime(date, "%Y-%m-%d")
        except ValueError:
            messagebox.showerror("Date Error", "Use YYYY-MM-DD format.")
            return

        for student in self.students_data:
            notes = None
            if student["reason"] or student["parent_contacted"]:
                notes = f"reason={student['reason']};parent={student['parent_contacted']}"
            # Reuse detailed attendance API to persist notes
            self.db.set_attendance_with_details(
                student["student_id"],
                date,
                student["status"],
                None,
                None,
                notes,
            )

        messagebox.showinfo("Saved", "Attendance saved.")
        if self.refresh_callback:
            self.refresh_callback()

    def export_to_excel(self):
        """Export the current day's attendance view to an Excel sheet."""
        date = self.date_var.get().strip()
        try:
            datetime.strptime(date, "%Y-%m-%d")
        except ValueError:
            messagebox.showerror("Date Error", "Use YYYY-MM-DD format before exporting.")
            return

        if not self.students_data:
            messagebox.showinfo("No Data", "There is no attendance data to export.")
            return

        try:
            rows = []
            for s in self.students_data:
                full_name = f"{s['surname']} {s['given_name']}".strip()
                rows.append(
                    {
                        "Date": date,
                        "Class": s["class_section"],
                        "Student Surname": s["surname"],
                        "Given Name": s["given_name"],
                        "Full Name": full_name,
                        "Student ID": s["student_id"],
                        "Attendance": s["status"],
                        "Reason": s["reason"],
                        "Parent Contacted?": s["parent_contacted"],
                    }
                )

            df = pd.DataFrame(rows)

            export_dir = os.path.join(os.getcwd(), "exports")
            os.makedirs(export_dir, exist_ok=True)
            filename = f"attendance_{date}.xlsx"
            filepath = os.path.join(export_dir, filename)

            # Use pandas Excel writer so it works even if openpyxl/xlsxwriter is default
            with pd.ExcelWriter(filepath, engine="openpyxl") as writer:
                df.to_excel(writer, sheet_name="Attendance", index=False)

            messagebox.showinfo(
                "Export Complete",
                f"Attendance exported to Excel:\n{filepath}",
            )
        except ImportError:
            messagebox.showerror(
                "Export Error",
                "Pandas or an Excel engine (openpyxl/xlsxwriter) is missing.\n"
                "Install with: pip install pandas openpyxl",
            )
        except Exception as e:
            messagebox.showerror("Export Error", f"Failed to export to Excel:\n{e}")

    # --- helpers for encoding/decoding reason/parent into notes ---
    def _parse_notes(self, notes):
        """
        Parse notes stored as 'reason=...;parent=...' into (reason, parent_contacted).
        """
        if not notes or "reason=" not in notes:
            return self.REASON_OPTIONS[0], self.PARENT_CONTACT_OPTIONS[0]
        reason = self.REASON_OPTIONS[0]
        parent = self.PARENT_CONTACT_OPTIONS[0]
        try:
            parts = [p.strip() for p in notes.split(";") if p.strip()]
            for p in parts:
                if p.startswith("reason="):
                    reason = p.split("=", 1)[1]
                elif p.startswith("parent="):
                    parent = p.split("=", 1)[1]
        except Exception:
            pass
        return reason, parent
    
    def apply_theme(self, theme):
        """Apply theme to this component"""
        if self.banner:
            self.banner.configure(bg=theme["header_bg"])
            if hasattr(self, 'banner_label'):
                self.banner_label.configure(bg=theme["header_bg"], fg=theme["header_fg"])
        if self.main_frame:
            self.main_frame.configure(bg=theme["bg_primary"])
        # Update tree tags
        self.tree.tag_configure("Present", background=theme.get("success_bg", "#e8f6ec"))
        self.tree.tag_configure("Absent", background=theme.get("error_bg", "#fdeaea"))
        self.tree.tag_configure("Late", background=theme.get("warning_bg", "#fffbe6"))
