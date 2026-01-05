"""
UI Components Module
Reusable Tkinter UI component classes
"""

import tkinter as tk
from tkinter import ttk
from typing import Dict, Callable, Optional


class TenantDetailFrame(ttk.Frame):
    """Frame containing editable fields for tenant properties."""
    
    def __init__(self, parent, on_change: Optional[Callable] = None):
        super().__init__(parent, padding="10")
        self.on_change = on_change
        self.tenant_id = None
        self._home_tabs = []  # Initialize home tabs
        
        # Create widgets
        self._create_widgets()
    
    def _create_widgets(self):
        """Create all input widgets."""
        # Company Initial (PRIMARY)
        ttk.Label(self, text="Company Initial:").grid(row=0, column=0, sticky="w", pady=2)
        self.company_initial_var = tk.StringVar()
        self.company_initial_entry = ttk.Entry(self, textvariable=self.company_initial_var, width=30)
        self.company_initial_entry.grid(row=0, column=1, sticky="ew", padx=(10, 0), pady=2)
        self.company_initial_var.trace('w', self._on_field_change)
        
        # App Name
        ttk.Label(self, text="App Name:").grid(row=1, column=0, sticky="w", pady=2)
        self.app_name_var = tk.StringVar()
        self.app_name_entry = ttk.Entry(self, textvariable=self.app_name_var, width=30)
        self.app_name_entry.grid(row=1, column=1, sticky="ew", padx=(10, 0), pady=2)
        self.app_name_var.trace('w', self._on_field_change)
        
        # Package Name
        ttk.Label(self, text="Package Name:").grid(row=2, column=0, sticky="w", pady=2)
        self.package_name_var = tk.StringVar()
        self.package_name_entry = ttk.Entry(self, textvariable=self.package_name_var, width=30)
        self.package_name_entry.grid(row=2, column=1, sticky="ew", padx=(10, 0), pady=2)
        self.package_name_var.trace('w', self._on_field_change)
        
        # Logo Path
        ttk.Label(self, text="Logo Path:").grid(row=3, column=0, sticky="w", pady=2)
        self.logo_path_var = tk.StringVar()
        self.logo_path_entry = ttk.Entry(self, textvariable=self.logo_path_var, width=30)
        self.logo_path_entry.grid(row=3, column=1, sticky="ew", padx=(10, 0), pady=2)
        self.logo_path_var.trace('w', self._on_field_change)
        
        # Home Variant
        ttk.Label(self, text="Home Variant:").grid(row=4, column=0, sticky="w", pady=2)
        self.home_variant_var = tk.StringVar()
        self.home_variant_combo = ttk.Combobox(self, textvariable=self.home_variant_var,
                                                values=['dashboard', 'simple', 'member', 'custom'],
                                                state='readonly', width=27)
        self.home_variant_combo.grid(row=4, column=1, sticky="w", padx=(10, 0), pady=2)
        self.home_variant_combo.bind('<<ComboboxSelected>>', self._on_home_variant_change)
        
        # Home tabs button (only show for member variant)
        self.home_tabs_button = ttk.Button(self, text="Manage Home Tabs", 
                                           command=self._manage_home_tabs,
                                           state='disabled')
        self.home_tabs_button.grid(row=5, column=0, columnspan=2, sticky="ew", pady=(5, 0))
        
        # Configure grid weights
        self.columnconfigure(1, weight=1)
    
    def _on_field_change(self, *args):
        """Callback when any field changes."""
        if self.on_change:
            self.on_change()
    
    def _on_home_variant_change(self, *args):
        """Handle home variant change."""
        variant = self.home_variant_var.get()
        # Enable home tabs button only for member variant
        if variant == 'member':
            self.home_tabs_button.config(state='normal')
        else:
            self.home_tabs_button.config(state='disabled')
        self._on_field_change()
    
    def _manage_home_tabs(self):
        """Open dialog to manage home tabs."""
        from tkinter import simpledialog, messagebox
        
        # Get current tabs
        current_tabs = getattr(self, '_home_tabs', [])
        
        # Simple dialog to edit tabs as JSON
        dialog = tk.Toplevel(self)
        dialog.title("Manage Home Tabs")
        dialog.geometry("500x400")
        dialog.transient(self)
        dialog.grab_set()
        
        ttk.Label(dialog, text="Home Tabs (JSON format):").pack(pady=5)
        
        import json
        text_widget = tk.Text(dialog, height=15, width=60)
        text_widget.pack(padx=10, pady=5, fill='both', expand=True)
        text_widget.insert('1.0', json.dumps(current_tabs, indent=2))
        
        def save_tabs():
            try:
                content = text_widget.get('1.0', tk.END).strip()
                if content:
                    tabs = json.loads(content)
                    # Validate tabs structure
                    if not isinstance(tabs, list):
                        messagebox.showerror("Error", "Tabs must be an array")
                        return
                    for tab in tabs:
                        if not isinstance(tab, dict) or 'id' not in tab or 'label' not in tab:
                            messagebox.showerror("Error", "Each tab must have 'id' and 'label'")
                            return
                    self._home_tabs = tabs
                    dialog.destroy()
                    self._on_field_change()
                else:
                    self._home_tabs = []
                    dialog.destroy()
                    self._on_field_change()
            except json.JSONDecodeError as e:
                messagebox.showerror("Error", f"Invalid JSON: {str(e)}")
        
        button_frame = ttk.Frame(dialog)
        button_frame.pack(pady=5)
        ttk.Button(button_frame, text="Save", command=save_tabs).pack(side='left', padx=5)
        ttk.Button(button_frame, text="Cancel", command=dialog.destroy).pack(side='left', padx=5)
        
        # Example button
        def insert_example():
            example = [
                {"id": "services", "label": "Services", "visible": True, "order": 1},
                {"id": "promotions", "label": "Promotions", "visible": True, "order": 2},
                {"id": "profile", "label": "Profile", "visible": True, "order": 3}
            ]
            text_widget.delete('1.0', tk.END)
            text_widget.insert('1.0', json.dumps(example, indent=2))
        
        ttk.Button(button_frame, text="Insert Example", command=insert_example).pack(side='left', padx=5)
    
    def load_tenant(self, tenant: Dict):
        """Load tenant data into fields."""
        self.tenant_id = tenant.get('id', '')
        self.company_initial_var.set(tenant.get('companyInitial', ''))
        self.app_name_var.set(tenant.get('appName') or tenant.get('name', ''))
        self.package_name_var.set(tenant.get('packageName', ''))
        self.logo_path_var.set(tenant.get('logoPath', ''))
        
        home_variant = tenant.get('homeVariant', 'member')
        self.home_variant_var.set(home_variant)
        self._home_tabs = tenant.get('homeTabs', [])
        
        # Enable/disable home tabs button
        if home_variant == 'member':
            self.home_tabs_button.config(state='normal')
        else:
            self.home_tabs_button.config(state='disabled')
    
    def get_tenant_data(self) -> Dict:
        """Get current field values as tenant dict."""
        data = {
            'id': self.tenant_id,
            'companyInitial': self.company_initial_var.get().strip(),
            'appName': self.app_name_var.get().strip(),
            'packageName': self.package_name_var.get().strip(),
            'logoPath': self.logo_path_var.get().strip(),
            'homeVariant': self.home_variant_var.get(),
            'enabledFeatures': []  # Will be set separately from plugin matrix
        }
        
        # Add homeTabs if variant is member
        if data['homeVariant'] == 'member':
            data['homeTabs'] = getattr(self, '_home_tabs', [])
        
        return data
    
    def clear(self):
        """Clear all fields."""
        self.tenant_id = None
        self.company_initial_var.set("")
        self.app_name_var.set("")
        self.package_name_var.set("")
        self.logo_path_var.set("")
        self.home_variant_var.set("member")
        self._home_tabs = []
        self.home_tabs_button.config(state='disabled')


class PluginMatrixFrame(ttk.LabelFrame):
    """Frame with checkboxes for each plugin."""
    
    def __init__(self, parent, plugins: Dict, on_change: Optional[Callable] = None):
        super().__init__(parent, text="Plugins", padding="10")
        self.plugins = plugins
        self.on_change = on_change
        self.checkboxes: Dict[str, tk.BooleanVar] = {}
        
        self._create_widgets()
    
    def _create_widgets(self):
        """Create checkboxes for each plugin."""
        # Create a scrollable frame
        canvas = tk.Canvas(self, height=150)
        scrollbar = ttk.Scrollbar(self, orient="vertical", command=canvas.yview)
        scrollable_frame = ttk.Frame(canvas)
        
        scrollable_frame.bind(
            "<Configure>",
            lambda e: canvas.configure(scrollregion=canvas.bbox("all"))
        )
        
        canvas.create_window((0, 0), window=scrollable_frame, anchor="nw")
        canvas.configure(yscrollcommand=scrollbar.set)
        
        # Create checkboxes
        row = 0
        for plugin_id in sorted(self.plugins.keys()):
            plugin_info = self.plugins[plugin_id]
            label_text = plugin_info.get('label', plugin_id)
            description = plugin_info.get('description', '')
            
            var = tk.BooleanVar()
            self.checkboxes[plugin_id] = var
            
            checkbox = ttk.Checkbutton(
                scrollable_frame,
                text=f"{label_text} ({plugin_id})",
                variable=var,
                command=self._on_checkbox_change
            )
            checkbox.grid(row=row, column=0, sticky="w", pady=2)
            
            if description:
                desc_label = ttk.Label(
                    scrollable_frame,
                    text=f"  └ {description}",
                    foreground="gray",
                    font=("TkDefaultFont", 8)
                )
                desc_label.grid(row=row, column=1, sticky="w", padx=(10, 0), pady=2)
            
            row += 1
        
        canvas.grid(row=0, column=0, sticky="nsew")
        scrollbar.grid(row=0, column=1, sticky="ns")
        
        self.columnconfigure(0, weight=1)
        self.rowconfigure(0, weight=1)
    
    def _on_checkbox_change(self):
        """Callback when checkbox is toggled."""
        if self.on_change:
            self.on_change()
    
    def set_enabled_features(self, enabled_features: list):
        """Set checkboxes based on enabled features list."""
        for plugin_id, var in self.checkboxes.items():
            var.set(plugin_id in enabled_features)
    
    def get_enabled_features(self) -> list:
        """Get list of enabled plugin IDs."""
        return [plugin_id for plugin_id, var in self.checkboxes.items() if var.get()]

