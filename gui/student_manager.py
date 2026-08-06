import tkinter as tk
from tkinter import ttk, messagebox

class StudentManager:
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

        # Form to add student
        form = ttk.LabelFrame(frm, text="Add Student", padding=10)
        form.pack(fill="x", padx=5, pady=5)

        tk.Label(form, text="Student ID", bg=theme["bg_primary"], fg=theme["fg_primary"]).grid(row=0, column=0, sticky="w")
        tk.Label(form, text="Name", bg=theme["bg_primary"], fg=theme["fg_primary"]).grid(row=1, column=0, sticky="w")
        tk.Label(form, text="Class/Section", bg=theme["bg_primary"], fg=theme["fg_primary"]).grid(row=2, column=0, sticky="w")
        tk.Label(form, text="Roll No", bg=theme["bg_primary"], fg=theme["fg_primary"]).grid(row=3, column=0, sticky="w")
        tk.Label(form, text="Email", bg=theme["bg_primary"], fg=theme["fg_primary"]).grid(row=4, column=0, sticky="w")
        tk.Label(form, text="Phone", bg=theme["bg_primary"], fg=theme["fg_primary"]).grid(row=5, column=0, sticky="w")
        tk.Label(form, text="Parent Contact", bg=theme["bg_primary"], fg=theme["fg_primary"]).grid(row=6, column=0, sticky="w")

        self.sid = tk.StringVar()
        self.name = tk.StringVar()
        self.class_section = tk.StringVar()
        self.roll_no = tk.StringVar()
        self.email = tk.StringVar()
        self.phone = tk.StringVar()
        self.parent_contact = tk.StringVar()

        ttk.Entry(form, textvariable=self.sid).grid(row=0, column=1, sticky="ew")
        ttk.Entry(form, textvariable=self.name).grid(row=1, column=1, sticky="ew")
        ttk.Entry(form, textvariable=self.class_section).grid(row=2, column=1, sticky="ew")
        ttk.Entry(form, textvariable=self.roll_no).grid(row=3, column=1, sticky="ew")
        ttk.Entry(form, textvariable=self.email).grid(row=4, column=1, sticky="ew")
        ttk.Entry(form, textvariable=self.phone).grid(row=5, column=1, sticky="ew")
        ttk.Entry(form, textvariable=self.parent_contact).grid(row=6, column=1, sticky="ew")

        add_btn = ttk.Button(form, text="Add Student", command=self.add_student)
        add_btn.grid(row=7, column=0, columnspan=2, pady=6)

        # Student list
        list_frame = ttk.LabelFrame(frm, text="Students List", padding=10)
        list_frame.pack(fill="both", expand=True, padx=5, pady=5)

        cols = ("student_id", "name", "class_section", "roll_no", "email", "phone", "parent_contact", "date_added")
        self.tree = ttk.Treeview(list_frame, columns=cols, show="headings", selectmode="browse")
        for c in cols:
            self.tree.heading(c, text=c.replace("_", " ").title())
            self.tree.column(c, width=120)
        self.tree.pack(fill="both", expand=True, side="left")

        vsb = ttk.Scrollbar(list_frame, orient="vertical", command=self.tree.yview)
        self.tree.configure(yscroll=vsb.set)
        vsb.pack(side="right", fill="y")

        btn_frame = tk.Frame(frm, bg=theme["bg_secondary"], padx=10, pady=10)
        btn_frame.pack(fill="x", padx=5, pady=5)
        ttk.Button(btn_frame, text="Refresh", command=self.load_students).pack(side="left")
        ttk.Button(btn_frame, text="Delete Selected", command=self.delete_selected).pack(side="left", padx=5)

        self.load_students()
    
    def apply_theme(self, theme):
        """Apply theme to this component"""
        if self.main_frame:
            self.main_frame.configure(bg=theme["bg_primary"])
            for widget in self.main_frame.winfo_children():
                if isinstance(widget, tk.Frame):
                    widget.configure(bg=theme.get("bg_secondary", theme["bg_primary"]))

    def add_student(self):
        sid = self.sid.get().strip()
        name = self.name.get().strip()
        cs = self.class_section.get().strip()
        roll = self.roll_no.get().strip()
        email = self.email.get().strip()
        phone = self.phone.get().strip()
        parent_contact = self.parent_contact.get().strip()
        
        if not sid or not name:
            messagebox.showwarning("Validation", "Student ID and Name are required.")
            return
        
        # First add the student with basic info
        res = self.db.add_student(sid, name, cs, roll)
        if res == "OK":
            # Then update with contact information
            if email or phone or parent_contact:
                self.db.update_student_info(sid, email=email, phone=phone, parent_contact=parent_contact)
            
            messagebox.showinfo("Success", "Student added.")
            # clear form
            self.sid.set("")
            self.name.set("")
            self.class_section.set("")
            self.roll_no.set("")
            self.email.set("")
            self.phone.set("")
            self.parent_contact.set("")
            self.load_students()
            if self.refresh_callback: self.refresh_callback()
        else:
            messagebox.showerror("Error", res)

    def load_students(self):
        for i in self.tree.get_children():
            self.tree.delete(i)
        rows = self.db.get_all_students()
        for r in rows:
            self.tree.insert("", "end", values=r)

    def delete_selected(self):
        sel = self.tree.selection()
        if not sel:
            messagebox.showwarning("Select", "Select a student to delete.")
            return
        item = self.tree.item(sel[0])
        sid = item["values"][0]
        if messagebox.askyesno("Confirm", f"Delete student {sid}?"):
            self.db.delete_student(sid)
            self.load_students()
            if self.refresh_callback: self.refresh_callback()
