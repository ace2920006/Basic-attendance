"""
Theme Manager for Attendance App
Provides multiple beautiful themes with proper color coordination
"""
import tkinter as tk
from tkinter import ttk

class ThemeManager:
    """Manages themes for the application with proper color blending"""
    
    THEMES = {
        "Light Modern": {
            "name": "Light Modern",
            "header_bg": "#3b82f6",
            "header_fg": "#ffffff",
            "bg_primary": "#ffffff",
            "bg_secondary": "#f8fafc",
            "bg_tertiary": "#f1f5f9",
            "fg_primary": "#0f172a",
            "fg_secondary": "#475569",
            "fg_tertiary": "#64748b",
            "accent": "#3b82f6",
            "accent_hover": "#2563eb",
            "success": "#10b981",
            "success_bg": "#d1fae5",
            "success_fg": "#065f46",
            "warning": "#f59e0b",
            "warning_bg": "#fef3c7",
            "warning_fg": "#92400e",
            "error": "#ef4444",
            "error_bg": "#fee2e2",
            "error_fg": "#991b1b",
            "border": "#e2e8f0",
            "border_hover": "#cbd5e1",
            "tree_bg": "#ffffff",
            "tree_fg": "#0f172a",
            "tree_select": "#dbeafe",
            "entry_bg": "#ffffff",
            "entry_fg": "#0f172a",
            "entry_border": "#cbd5e1",
        },
        "Dark Mode": {
            "name": "Dark Mode",
            "header_bg": "#1e293b",
            "header_fg": "#f1f5f9",
            "bg_primary": "#0f172a",
            "bg_secondary": "#1e293b",
            "bg_tertiary": "#334155",
            "fg_primary": "#f1f5f9",
            "fg_secondary": "#cbd5e1",
            "fg_tertiary": "#94a3b8",
            "accent": "#60a5fa",
            "accent_hover": "#3b82f6",
            "success": "#34d399",
            "success_bg": "#064e3b",
            "success_fg": "#6ee7b7",
            "warning": "#fbbf24",
            "warning_bg": "#78350f",
            "warning_fg": "#fde68a",
            "error": "#f87171",
            "error_bg": "#7f1d1d",
            "error_fg": "#fca5a5",
            "border": "#334155",
            "border_hover": "#475569",
            "tree_bg": "#1e293b",
            "tree_fg": "#f1f5f9",
            "tree_select": "#334155",
            "entry_bg": "#1e293b",
            "entry_fg": "#f1f5f9",
            "entry_border": "#475569",
        },
        "Ocean Blue": {
            "name": "Ocean Blue",
            "header_bg": "#0ea5e9",
            "header_fg": "#ffffff",
            "bg_primary": "#f0f9ff",
            "bg_secondary": "#e0f2fe",
            "bg_tertiary": "#bae6fd",
            "fg_primary": "#0c4a6e",
            "fg_secondary": "#075985",
            "fg_tertiary": "#0369a1",
            "accent": "#0ea5e9",
            "accent_hover": "#0284c7",
            "success": "#06b6d4",
            "success_bg": "#cffafe",
            "success_fg": "#164e63",
            "warning": "#f59e0b",
            "warning_bg": "#fef3c7",
            "warning_fg": "#92400e",
            "error": "#ef4444",
            "error_bg": "#fee2e2",
            "error_fg": "#991b1b",
            "border": "#bae6fd",
            "border_hover": "#7dd3fc",
            "tree_bg": "#ffffff",
            "tree_fg": "#0c4a6e",
            "tree_select": "#e0f2fe",
            "entry_bg": "#ffffff",
            "entry_fg": "#0c4a6e",
            "entry_border": "#bae6fd",
        },
        "Forest Green": {
            "name": "Forest Green",
            "header_bg": "#059669",
            "header_fg": "#ffffff",
            "bg_primary": "#f0fdf4",
            "bg_secondary": "#dcfce7",
            "bg_tertiary": "#bbf7d0",
            "fg_primary": "#14532d",
            "fg_secondary": "#166534",
            "fg_tertiary": "#15803d",
            "accent": "#059669",
            "accent_hover": "#047857",
            "success": "#10b981",
            "success_bg": "#d1fae5",
            "success_fg": "#065f46",
            "warning": "#f59e0b",
            "warning_bg": "#fef3c7",
            "warning_fg": "#92400e",
            "error": "#ef4444",
            "error_bg": "#fee2e2",
            "error_fg": "#991b1b",
            "border": "#bbf7d0",
            "border_hover": "#86efac",
            "tree_bg": "#ffffff",
            "tree_fg": "#14532d",
            "tree_select": "#dcfce7",
            "entry_bg": "#ffffff",
            "entry_fg": "#14532d",
            "entry_border": "#bbf7d0",
        },
        "Purple Dream": {
            "name": "Purple Dream",
            "header_bg": "#8b5cf6",
            "header_fg": "#ffffff",
            "bg_primary": "#faf5ff",
            "bg_secondary": "#f3e8ff",
            "bg_tertiary": "#e9d5ff",
            "fg_primary": "#581c87",
            "fg_secondary": "#6b21a8",
            "fg_tertiary": "#7c3aed",
            "accent": "#8b5cf6",
            "accent_hover": "#7c3aed",
            "success": "#10b981",
            "success_bg": "#d1fae5",
            "success_fg": "#065f46",
            "warning": "#f59e0b",
            "warning_bg": "#fef3c7",
            "warning_fg": "#92400e",
            "error": "#ef4444",
            "error_bg": "#fee2e2",
            "error_fg": "#991b1b",
            "border": "#e9d5ff",
            "border_hover": "#d8b4fe",
            "tree_bg": "#ffffff",
            "tree_fg": "#581c87",
            "tree_select": "#f3e8ff",
            "entry_bg": "#ffffff",
            "entry_fg": "#581c87",
            "entry_border": "#e9d5ff",
        },
        "Sunset Orange": {
            "name": "Sunset Orange",
            "header_bg": "#f97316",
            "header_fg": "#ffffff",
            "bg_primary": "#fff7ed",
            "bg_secondary": "#ffedd5",
            "bg_tertiary": "#fed7aa",
            "fg_primary": "#7c2d12",
            "fg_secondary": "#9a3412",
            "fg_tertiary": "#c2410c",
            "accent": "#f97316",
            "accent_hover": "#ea580c",
            "success": "#10b981",
            "success_bg": "#d1fae5",
            "success_fg": "#065f46",
            "warning": "#f59e0b",
            "warning_bg": "#fef3c7",
            "warning_fg": "#92400e",
            "error": "#ef4444",
            "error_bg": "#fee2e2",
            "error_fg": "#991b1b",
            "border": "#fed7aa",
            "border_hover": "#fdba74",
            "tree_bg": "#ffffff",
            "tree_fg": "#7c2d12",
            "tree_select": "#ffedd5",
            "entry_bg": "#ffffff",
            "entry_fg": "#7c2d12",
            "entry_border": "#fed7aa",
        },
        "Midnight": {
            "name": "Midnight",
            "header_bg": "#1e1b4b",
            "header_fg": "#e0e7ff",
            "bg_primary": "#0f172a",
            "bg_secondary": "#1e293b",
            "bg_tertiary": "#312e81",
            "fg_primary": "#e0e7ff",
            "fg_secondary": "#c7d2fe",
            "fg_tertiary": "#a5b4fc",
            "accent": "#6366f1",
            "accent_hover": "#4f46e5",
            "success": "#34d399",
            "success_bg": "#064e3b",
            "success_fg": "#6ee7b7",
            "warning": "#fbbf24",
            "warning_bg": "#78350f",
            "warning_fg": "#fde68a",
            "error": "#f87171",
            "error_bg": "#7f1d1d",
            "error_fg": "#fca5a5",
            "border": "#312e81",
            "border_hover": "#4338ca",
            "tree_bg": "#1e293b",
            "tree_fg": "#e0e7ff",
            "tree_select": "#312e81",
            "entry_bg": "#1e293b",
            "entry_fg": "#e0e7ff",
            "entry_border": "#4338ca",
        }
    }
    
    def __init__(self, default_theme="Light Modern", root=None):
        self.current_theme_name = default_theme
        self.theme_callbacks = []
        self.root = root
        self.style = None
        if root:
            self.style = ttk.Style(root)
            self._configure_ttk_styles()
    
    def get_theme(self):
        """Get the current theme"""
        return self.THEMES.get(self.current_theme_name, self.THEMES["Light Modern"])
    
    def set_theme(self, theme_name):
        """Set the current theme"""
        if theme_name in self.THEMES:
            self.current_theme_name = theme_name
            self._notify_callbacks()
            return True
        return False
    
    def get_theme_names(self):
        """Get list of available theme names"""
        return list(self.THEMES.keys())
    
    def register_callback(self, callback):
        """Register a callback to be called when theme changes"""
        if callback not in self.theme_callbacks:
            self.theme_callbacks.append(callback)
    
    def _notify_callbacks(self):
        """Notify all registered callbacks of theme change"""
        theme = self.get_theme()
        self._configure_ttk_styles()
        for callback in self.theme_callbacks:
            try:
                callback(theme)
            except Exception as e:
                print(f"Error in theme callback: {e}")
    
    def _configure_ttk_styles(self):
        """Configure ttk widget styles based on current theme"""
        if not self.style:
            return
        
        theme = self.get_theme()
        
        # Configure Frame styles
        self.style.configure('TFrame', background=theme["bg_primary"])
        self.style.configure('TLabelFrame', background=theme["bg_primary"], foreground=theme["fg_primary"])
        self.style.configure('TLabelFrame.Label', background=theme["bg_primary"], foreground=theme["fg_primary"])
        
        # Configure Label styles - create multiple variants
        self.style.configure('TLabel', background=theme["bg_primary"], foreground=theme["fg_primary"])
        self.style.configure('Secondary.TLabel', background=theme["bg_secondary"], foreground=theme["fg_primary"])
        self.style.configure('Tertiary.TLabel', background=theme["bg_tertiary"], foreground=theme["fg_primary"])
        
        # Configure Button styles - Always white background with black text (consistent across all themes)
        self.style.configure('TButton', 
                           background="#ffffff",
                           foreground="#000000",
                           borderwidth=1,
                           focuscolor='none',
                           padding=[10, 5],
                           relief='raised')
        self.style.map('TButton',
                      background=[('active', "#f0f0f0"),
                                ('pressed', "#e0e0e0"),
                                ('disabled', "#cccccc")],
                      foreground=[('active', "#000000"),
                                ('pressed', "#000000"),
                                ('disabled', "#666666")],
                      relief=[('pressed', 'sunken'),
                             ('!pressed', 'raised')])
        
        # Configure Entry styles
        self.style.configure('TEntry',
                           fieldbackground=theme["entry_bg"],
                           foreground=theme["entry_fg"],
                           borderwidth=1)
        self.style.map('TEntry',
                      fieldbackground=[('focus', theme["entry_bg"])],
                      bordercolor=[('focus', theme["accent"])])
        
        # Configure Combobox styles
        self.style.configure('TCombobox',
                           fieldbackground=theme["entry_bg"],
                           foreground=theme["entry_fg"],
                           background=theme["entry_bg"],
                           borderwidth=1)
        self.style.map('TCombobox',
                      fieldbackground=[('readonly', theme["entry_bg"])],
                      background=[('readonly', theme["entry_bg"])])
        
        # Configure Checkbutton styles
        self.style.configure('TCheckbutton',
                           background=theme["bg_primary"],
                           foreground=theme["fg_primary"],
                           focuscolor='none')
        self.style.map('TCheckbutton',
                      background=[('active', theme["bg_primary"])])
        
        # Configure Radiobutton styles
        self.style.configure('TRadiobutton',
                           background=theme["bg_primary"],
                           foreground=theme["fg_primary"],
                           focuscolor='none')
        self.style.map('TRadiobutton',
                      background=[('active', theme["bg_primary"])])
        
        # Configure Notebook (tabs) styles
        self.style.configure('TNotebook', background=theme["bg_primary"], borderwidth=0)
        self.style.configure('TNotebook.Tab',
                           background=theme["bg_secondary"],
                           foreground=theme["fg_primary"],
                           padding=[12, 8])
        self.style.map('TNotebook.Tab',
                      background=[('selected', theme["bg_primary"])],
                      expand=[('selected', [1, 1, 1, 0])])
        
        # Configure Treeview styles
        self.style.configure('Treeview',
                           background=theme["tree_bg"],
                           foreground=theme["tree_fg"],
                           fieldbackground=theme["tree_bg"],
                           borderwidth=1)
        self.style.configure('Treeview.Heading',
                           background=theme["bg_secondary"],
                           foreground=theme["fg_primary"],
                           relief='flat')
        self.style.map('Treeview',
                      background=[('selected', theme["tree_select"])],
                      foreground=[('selected', theme["tree_fg"])])
        
        # Configure Scrollbar styles
        self.style.configure('TScrollbar',
                           background=theme["bg_secondary"],
                           troughcolor=theme["bg_primary"],
                           borderwidth=1,
                           arrowcolor=theme["fg_primary"])
        
        # Configure Text widget (for Text areas)
        try:
            # Text widgets need direct configuration, not through style
            pass
        except:
            pass

