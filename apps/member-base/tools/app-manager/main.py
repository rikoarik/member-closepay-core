"""
Closepay Core Manager
Python GUI application to manage multi-tenant and plugin configuration

Usage:
    python main.py

Requirements:
    - Python 3.x
    - Standard library only (Tkinter)

File Requirements:
    - tenants.json: Must exist in the same directory as this script
    - plugins.json: Must exist in the same directory as this script
"""

import tkinter as tk
from tkinter import ttk, messagebox, simpledialog, filedialog
import os
import sys
from typing import Dict, Optional

# Import local modules
from config_io import (
    normalize_tenant_id,
    load_tenants, load_plugins, save_tenants,
    validate_tenant
)
from ui_components import TenantDetailFrame, PluginMatrixFrame
from repo_generator import generate_repo, list_generated_apps


class ClosepayManagerApp(tk.Tk):
    """Main application window."""
    
    def __init__(self):
        super().__init__()
        
        self.title("Closepay Core Manager")
        self.geometry("800x700")
        self.minsize(600, 500)
        
        # Data storage
        self.tenants: Dict = {}
        self.plugins: Dict = {}
        self.current_tenant_id: Optional[str] = None
        self.unsaved_changes = False
        
        # Change to script directory to find JSON files
        script_dir = os.path.dirname(os.path.abspath(__file__))
        os.chdir(script_dir)
        
        # Load data
        self._load_data()
        
        # Create UI
        self._create_widgets()
        
        # Bind window close event
        self.protocol("WM_DELETE_WINDOW", self._on_closing)
    
    def _load_data(self):
        """Load tenants and plugins from JSON files."""
        # Load plugins first (needed for validation)
        plugins, error = load_plugins()
        if error:
            messagebox.showerror("Error Loading Plugins", error)
            sys.exit(1)
        self.plugins = plugins
        
        # Load tenants
        tenants, error = load_tenants()
        if error:
            messagebox.showerror("Error Loading Tenants", error)
            sys.exit(1)
        self.tenants = tenants
        
        # Validate tenants
        from config_io import validate_all_tenants
        is_valid, error = validate_all_tenants(self.tenants, self.plugins)
        if not is_valid:
            messagebox.showwarning("Validation Warning", 
                                 f"Some tenants have validation errors:\n{error}\n\n"
                                 "You can still edit and save, but please fix errors.")
    
    def _create_widgets(self):
        """Create all UI widgets."""
        # Main container
        main_container = ttk.Frame(self, padding="10")
        main_container.grid(row=0, column=0, sticky="nsew")
        
        # Configure grid weights
        self.columnconfigure(0, weight=1)
        self.rowconfigure(0, weight=1)
        main_container.columnconfigure(1, weight=1)
        main_container.rowconfigure(1, weight=1)
        
        # Left panel: Tenant list
        left_panel = ttk.Frame(main_container, width=200)
        left_panel.grid(row=0, column=0, rowspan=2, sticky="nsew", padx=(0, 10))
        left_panel.columnconfigure(0, weight=1)
        left_panel.rowconfigure(1, weight=1)
        
        ttk.Label(left_panel, text="Tenants", font=("TkDefaultFont", 10, "bold")).grid(
            row=0, column=0, sticky="w", pady=(0, 5)
        )
        
        # Tenant listbox with scrollbar
        list_frame = ttk.Frame(left_panel)
        list_frame.grid(row=1, column=0, sticky="nsew")
        list_frame.columnconfigure(0, weight=1)
        list_frame.rowconfigure(0, weight=1)
        
        self.tenant_listbox = tk.Listbox(list_frame, selectmode=tk.SINGLE)
        self.tenant_listbox.grid(row=0, column=0, sticky="nsew")
        self.tenant_listbox.bind('<<ListboxSelect>>', self._on_tenant_select)
        
        list_scrollbar = ttk.Scrollbar(list_frame, orient="vertical", 
                                       command=self.tenant_listbox.yview)
        list_scrollbar.grid(row=0, column=1, sticky="ns")
        self.tenant_listbox.config(yscrollcommand=list_scrollbar.set)
        
        # Right panel: Tenant detail and plugins
        right_panel = ttk.Frame(main_container)
        right_panel.grid(row=0, column=1, sticky="nsew")
        right_panel.columnconfigure(0, weight=1)
        right_panel.rowconfigure(1, weight=1)
        
        # Tenant detail frame
        self.tenant_detail = TenantDetailFrame(right_panel, on_change=self._on_tenant_change)
        self.tenant_detail.grid(row=0, column=0, sticky="ew", pady=(0, 10))
        
        # Plugin matrix frame
        self.plugin_matrix = PluginMatrixFrame(right_panel, self.plugins, 
                                               on_change=self._on_plugin_change)
        self.plugin_matrix.grid(row=1, column=0, sticky="nsew")
        
        # Button bar
        button_frame = ttk.Frame(main_container)
        button_frame.grid(row=1, column=1, sticky="ew", pady=(10, 0))
        
        ttk.Button(button_frame, text="Save", command=self._save_changes).grid(
            row=0, column=0, padx=(0, 5)
        )
        ttk.Button(button_frame, text="Reload", command=self._reload_data).grid(
            row=0, column=1, padx=(0, 5)
        )
        ttk.Button(button_frame, text="Add Tenant", command=self._add_tenant).grid(
            row=0, column=2, padx=(0, 5)
        )
        ttk.Button(button_frame, text="Delete Tenant", command=self._delete_tenant).grid(
            row=0, column=3, padx=(0, 5)
        )
        ttk.Button(button_frame, text="Generate Repo", command=self._generate_repo).grid(
            row=0, column=4, padx=(0, 5)
        )
        
        # Status bar
        self.status_var = tk.StringVar(value="Ready")
        status_label = ttk.Label(main_container, textvariable=self.status_var, 
                                relief=tk.SUNKEN, anchor="w")
        status_label.grid(row=2, column=0, columnspan=2, sticky="ew", pady=(10, 0))
        
        # Populate tenant list (after all widgets are created)
        self._refresh_tenant_list()
    
    def _refresh_tenant_list(self):
        """Refresh the tenant listbox."""
        self.tenant_listbox.delete(0, tk.END)
        for tenant_id in sorted(self.tenants.keys()):
            self.tenant_listbox.insert(tk.END, tenant_id)
        
        # Select first tenant if available
        if self.tenant_listbox.size() > 0:
            self.tenant_listbox.selection_set(0)
            self._on_tenant_select(None)
    
    def _on_tenant_select(self, event):
        """Handle tenant list selection."""
        # Check if widgets are initialized
        if not hasattr(self, 'tenant_detail') or not hasattr(self, 'plugin_matrix'):
            return
            
        selection = self.tenant_listbox.curselection()
        if not selection:
            return
        
        tenant_id = self.tenant_listbox.get(selection[0])
        if tenant_id in self.tenants:
            self.current_tenant_id = tenant_id
            tenant = self.tenants[tenant_id]
            self.tenant_detail.load_tenant(tenant)
            self.plugin_matrix.set_enabled_features(tenant.get('enabledFeatures', []))
            self.unsaved_changes = False
            self.status_var.set(f"Loaded tenant: {tenant_id}")
    
    def _on_tenant_change(self):
        """Handle changes to tenant detail fields."""
        if self.current_tenant_id:
            self.unsaved_changes = True
            self.status_var.set("Unsaved changes")
    
    def _on_plugin_change(self):
        """Handle plugin checkbox changes."""
        if self.current_tenant_id:
            self.unsaved_changes = True
            self.status_var.set("Unsaved changes")
    
    def _save_current_tenant(self):
        """Save current tenant data from UI to memory."""
        if not self.current_tenant_id:
            return
        
        # Get data from UI
        tenant_data = self.tenant_detail.get_tenant_data()
        enabled_features = self.plugin_matrix.get_enabled_features()
        tenant_data['enabledFeatures'] = enabled_features
        
        # Validate
        is_valid, error = validate_tenant(tenant_data, self.current_tenant_id, self.plugins)
        if not is_valid:
            messagebox.showerror("Validation Error", error)
            return False
        
        # Update in memory
        self.tenants[self.current_tenant_id] = tenant_data
        return True
    
    def _save_changes(self):
        """Save all changes to JSON file."""
        # Save current tenant first
        if self.current_tenant_id:
            if not self._save_current_tenant():
                return
        
        # Save to file
        success, error = save_tenants(self.tenants, self.plugins)
        if success:
            self.unsaved_changes = False
            self.status_var.set("Changes saved successfully")
            messagebox.showinfo("Success", "Configuration saved successfully!")
        else:
            messagebox.showerror("Save Error", error)
            self.status_var.set(f"Error: {error}")
    
    def _reload_data(self):
        """Reload data from disk."""
        if self.unsaved_changes:
            response = messagebox.askyesno(
                "Unsaved Changes",
                "You have unsaved changes. Reload anyway?",
                icon="warning"
            )
            if not response:
                return
        
        # Reload from disk
        self._load_data()
        self._refresh_tenant_list()
        self.unsaved_changes = False
        self.status_var.set("Data reloaded from disk")
    
    def _add_tenant(self):
        """Add a new tenant."""
        # Get tenant ID
        tenant_id = simpledialog.askstring(
            "Add Tenant",
            "Enter tenant ID:",
            parent=self
        )
        
        if not tenant_id:
            return
        
        # Normalize tenant ID: lowercase, kebab-case format
        tenant_id = normalize_tenant_id(tenant_id)
        
        if not tenant_id:
            messagebox.showerror("Error", "Tenant ID cannot be empty")
            return
        
        if tenant_id in self.tenants:
            messagebox.showerror("Error", f"Tenant '{tenant_id}' already exists")
            return
        
        # Get tenant name
        tenant_name = simpledialog.askstring(
            "Add Tenant",
            "Enter tenant name:",
            parent=self
        )
        
        if not tenant_name:
            return
        
        tenant_name = tenant_name.strip()
        
        if not tenant_name:
            messagebox.showerror("Error", "Tenant name cannot be empty")
            return
        
        # Duplicate DEFAULT tenant as base, or create default
        if 'DEFAULT' in self.tenants:
            new_tenant = self.tenants['DEFAULT'].copy()
            new_tenant['id'] = tenant_id
            new_tenant['name'] = tenant_name
            # Clear enabled features for new tenant
            new_tenant['enabledFeatures'] = []
            # Set default to member variant
            if 'homeVariant' not in new_tenant or new_tenant['homeVariant'] == 'dashboard':
                new_tenant['homeVariant'] = 'member'
                new_tenant['homeTabs'] = []
        else:
            # Create default tenant (member-focused)
            new_tenant = {
                'id': tenant_id,
                'name': tenant_name,
                'role': 'member',
                'enabledFeatures': [],
                'theme': {
                    'primary': '#0066CC',
                    'primaryDark': '#0052A3',
                    'primaryLight': '#E6F2FF'
                },
                'homeVariant': 'member',
                'homeTabs': []
            }
        
        # Add to tenants
        self.tenants[tenant_id] = new_tenant
        self._refresh_tenant_list()
        
        # Select the new tenant
        index = sorted(self.tenants.keys()).index(tenant_id)
        self.tenant_listbox.selection_clear(0, tk.END)
        self.tenant_listbox.selection_set(index)
        self._on_tenant_select(None)
        
        self.unsaved_changes = True
        self.status_var.set(f"Added tenant: {tenant_id}")
    
    def _delete_tenant(self):
        """Delete the currently selected tenant."""
        if not self.current_tenant_id:
            messagebox.showwarning("No Selection", "Please select a tenant to delete")
            return
        
        if self.current_tenant_id == 'DEFAULT':
            messagebox.showerror("Error", "Cannot delete DEFAULT tenant")
            return
        
        response = messagebox.askyesno(
            "Confirm Delete",
            f"Are you sure you want to delete tenant '{self.current_tenant_id}'?",
            icon="warning"
        )
        
        if not response:
            return
        
        # Delete tenant
        del self.tenants[self.current_tenant_id]
        self.current_tenant_id = None
        self.tenant_detail.clear()
        self.plugin_matrix.set_enabled_features([])
        
        self._refresh_tenant_list()
        self.unsaved_changes = True
        self.status_var.set("Tenant deleted")
    
    def _generate_repo(self):
        """Generate app repository for current tenant."""
        if not self.current_tenant_id:
            messagebox.showwarning("No Selection", "Please select a tenant to generate repository")
            return
        
        if self.current_tenant_id == 'DEFAULT':
            messagebox.showwarning("Cannot Generate", "Cannot generate repository for DEFAULT tenant")
            return
        
        # Ask for folder name
        folder_name = simpledialog.askstring(
            "Generate Repository",
            f"Enter folder name for app:\n(Leave empty to use tenant ID: {self.current_tenant_id})",
            initialvalue=self.current_tenant_id,
            parent=self
        )
        
        if not folder_name:
            return
        
        folder_name = folder_name.strip()
        
        if not folder_name:
            messagebox.showerror("Error", "Folder name cannot be empty")
            return
        
        # Validate folder name
        if not folder_name.replace('-', '').replace('_', '').isalnum():
            messagebox.showerror("Error", "Invalid folder name. Must be alphanumeric with dashes/underscores only")
            return
        
        # Ask for output location
        response = messagebox.askyesno(
            "Choose Location",
            f"Save to default location (apps/{folder_name})?\n\n"
            "Click 'Yes' for default location\n"
            "Click 'No' to choose custom location",
            icon="question"
        )
        
        output_path = None
        if not response:
            # Ask user to choose directory
            output_dir = filedialog.askdirectory(
                title="Choose output directory",
                parent=self
            )
            if not output_dir:
                return
            output_path = output_dir
        
        # Check if repo already exists
        from repo_generator import get_repo_root
        repo_root = get_repo_root()
        if output_path:
            target_path = os.path.join(output_path, folder_name)
        else:
            target_path = os.path.join(repo_root, 'apps', folder_name) if repo_root else None
        
        overwrite = False
        if target_path and os.path.exists(target_path):
            response = messagebox.askyesno(
                "Repository Exists",
                f"Repository '{target_path}' already exists.\n\n"
                "Do you want to overwrite it?",
                icon="warning"
            )
            if not response:
                return
            overwrite = True
        
        # Save current tenant first to ensure we have latest data
        if self.current_tenant_id:
            if not self._save_current_tenant():
                return
        
        # Get tenant data
        tenant = self.tenants[self.current_tenant_id]
        
        # Determine template variant (prefer member-base for member role/variant)
        home_variant = tenant.get('homeVariant', 'member')
        role = tenant.get('role', 'member')
        template_variant = 'member' if (role == 'member' or home_variant == 'member') else 'merchant'
        
        # Generate repository
        success, message = generate_repo(
            self.current_tenant_id, 
            tenant, 
            overwrite=overwrite, 
            app_folder_name=folder_name,
            output_path=output_path,
            template_variant=template_variant
        )
        
        if success:
            self.status_var.set(message)
            messagebox.showinfo("Success", f"{message}")
        else:
            self.status_var.set(f"Error: {message}")
            messagebox.showerror("Generation Error", message)
    
    def _on_closing(self):
        """Handle window close event."""
        if self.unsaved_changes:
            response = messagebox.askyesno(
                "Unsaved Changes",
                "You have unsaved changes. Exit anyway?",
                icon="warning"
            )
            if not response:
                return
        
        self.destroy()


def main():
    """Main entry point."""
    app = ClosepayManagerApp()
    app.mainloop()


if __name__ == "__main__":
    main()

