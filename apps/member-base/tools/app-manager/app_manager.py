"""
Closepay App Manager
Comprehensive management tool for managing tenants, apps, configs, and repositories
"""

import os
import sys
import json
import shutil
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import argparse

# Import existing modules
from config_io import load_tenants, load_plugins, save_tenants, validate_tenant, validate_all_tenants, normalize_tenant_id
from repo_generator import generate_repo, list_generated_apps, get_repo_root


class AppManager:
    """Main manager class for app operations."""
    
    def __init__(self):
        self.repo_root = get_repo_root()
        if not self.repo_root:
            raise RuntimeError("Could not find repository root directory")
        
        self.tenants_file = Path(__file__).parent / 'tenants.json'
        self.plugins_file = Path(__file__).parent / 'plugins.json'
        self.apps_dir = self.repo_root / 'apps'
        
        # Load data
        self.tenants, error = load_tenants()
        if error:
            raise RuntimeError(f"Error loading tenants: {error}")
        
        self.plugins, error = load_plugins()
        if error:
            raise RuntimeError(f"Error loading plugins: {error}")
    
    def list_tenants(self) -> List[str]:
        """List all tenant IDs."""
        return sorted(self.tenants.keys())
    
    def list_apps(self) -> List[str]:
        """List all generated app directories."""
        return list_generated_apps()
    
    def get_tenant(self, tenant_id: str) -> Optional[Dict]:
        """Get tenant configuration."""
        return self.tenants.get(tenant_id)
    
    def create_tenant(self, tenant_id: str, name: str, role: str = 'member', 
                     enabled_features: List[str] = None, theme: Dict = None,
                     home_variant: str = 'member') -> Tuple[bool, str]:
        """Create a new tenant."""
        # Normalize tenant ID: lowercase, kebab-case format
        tenant_id = normalize_tenant_id(tenant_id)
        
        if not tenant_id:
            return False, "Tenant ID cannot be empty"
        
        if tenant_id in self.tenants:
            return False, f"Tenant '{tenant_id}' already exists"
        
        if not tenant_id.replace('-', '').isalnum():
            return False, "Invalid tenant ID. Must be alphanumeric with dashes only"
        
        # Default theme
        if not theme:
            theme = {
                "primary": "#0066CC",
                "primaryDark": "#0052A3",
                "primaryLight": "#E6F2FF"
            }
        
        new_tenant = {
            "id": tenant_id,
            "name": name,
            "role": role,
            "theme": theme,
            "homeVariant": home_variant,
            "enabledFeatures": enabled_features or [],
            "homeTabs": [] if home_variant == 'member' else None
        }
        
        # Validate
        is_valid, error = validate_tenant(new_tenant, tenant_id, self.plugins)
        if not is_valid:
            return False, f"Validation error: {error}"
        
        self.tenants[tenant_id] = new_tenant
        success, error = save_tenants(self.tenants, self.plugins)
        if not success:
            return False, f"Error saving: {error}"
        
        return True, f"Tenant '{tenant_id}' created successfully"
    
    def update_tenant(self, tenant_id: str, **updates) -> Tuple[bool, str]:
        """Update tenant configuration."""
        if tenant_id not in self.tenants:
            return False, f"Tenant '{tenant_id}' not found"
        
        if tenant_id == 'DEFAULT' and 'id' in updates:
            return False, "Cannot change DEFAULT tenant ID"
        
        # Update tenant
        tenant = self.tenants[tenant_id]
        for key, value in updates.items():
            if key == 'enabledFeatures':
                # Validate features
                invalid_features = [f for f in value if f not in self.plugins]
                if invalid_features:
                    return False, f"Invalid features: {', '.join(invalid_features)}"
            tenant[key] = value
        
        # Validate
        is_valid, error = validate_tenant(tenant, tenant_id, self.plugins)
        if not is_valid:
            return False, f"Validation error: {error}"
        
        self.tenants[tenant_id] = tenant
        success, error = save_tenants(self.tenants, self.plugins)
        if not success:
            return False, f"Error saving: {error}"
        
        return True, f"Tenant '{tenant_id}' updated successfully"
    
    def delete_tenant(self, tenant_id: str, delete_app: bool = False) -> Tuple[bool, str]:
        """Delete a tenant."""
        if tenant_id not in self.tenants:
            return False, f"Tenant '{tenant_id}' not found"
        
        if tenant_id == 'DEFAULT':
            return False, "Cannot delete DEFAULT tenant"
        
        # Delete app directory if requested
        if delete_app:
            app_dir = self.apps_dir / tenant_id
            if app_dir.exists():
                try:
                    shutil.rmtree(app_dir)
                except Exception as e:
                    return False, f"Error deleting app directory: {str(e)}"
        
        # Delete tenant
        del self.tenants[tenant_id]
        success, error = save_tenants(self.tenants, self.plugins)
        if not success:
            return False, f"Error saving: {error}"
        
        return True, f"Tenant '{tenant_id}' deleted successfully"
    
    def generate_app(self, tenant_id: str, overwrite: bool = False, 
                    app_folder_name: Optional[str] = None,
                    output_path: Optional[str] = None,
                    template_variant: Optional[str] = None) -> Tuple[bool, str]:
        """Generate app repository for a tenant."""
        if tenant_id not in self.tenants:
            return False, f"Tenant '{tenant_id}' not found"
        
        tenant = self.tenants[tenant_id]
        return generate_repo(tenant_id, tenant, overwrite=overwrite, 
                           app_folder_name=app_folder_name, 
                           output_path=output_path,
                           template_variant=template_variant)
    
    def sync_config(self, tenant_id: str) -> Tuple[bool, str]:
        """Sync tenant config to app config file."""
        if tenant_id not in self.tenants:
            return False, f"Tenant '{tenant_id}' not found"
        
        app_dir = self.apps_dir / tenant_id
        if not app_dir.exists():
            return False, f"App directory for '{tenant_id}' does not exist. Generate it first."
        
        # Regenerate config
        from repo_generator import generate_config_from_tenant
        tenant = self.tenants[tenant_id]
        config_content = generate_config_from_tenant(tenant, tenant_id)
        
        config_file = app_dir / 'config' / 'app.config.ts'
        config_file.parent.mkdir(exist_ok=True)
        
        try:
            with open(config_file, 'w', encoding='utf-8') as f:
                f.write(config_content)
            return True, f"Config synced for '{tenant_id}'"
        except Exception as e:
            return False, f"Error syncing config: {str(e)}"
    
    def sync_all_configs(self) -> Tuple[bool, List[str]]:
        """Sync configs for all generated apps."""
        apps = list_generated_apps()
        results = []
        all_success = True
        
        for app_id in apps:
            if app_id in self.tenants:
                success, msg = self.sync_config(app_id)
                results.append(f"{app_id}: {msg}")
                if not success:
                    all_success = False
        
        return all_success, results
    
    def validate_all(self) -> Tuple[bool, str]:
        """Validate all tenants."""
        is_valid, error = validate_all_tenants(self.tenants, self.plugins)
        if is_valid:
            return True, "All tenants are valid"
        else:
            return False, f"Validation errors: {error}"
    
    def get_status(self) -> Dict:
        """Get status of all tenants and apps."""
        apps = list_generated_apps()
        
        # Check homeVariant usage
        home_variants_used = {}
        for tenant_id, tenant in self.tenants.items():
            variant = tenant.get('homeVariant', 'dashboard')
            if variant not in home_variants_used:
                home_variants_used[variant] = []
            home_variants_used[variant].append(tenant_id)
        
        status = {
            "tenants": {
                "total": len(self.tenants),
                "ids": list(self.tenants.keys())
            },
            "apps": {
                "total": len(apps),
                "ids": apps
            },
            "orphaned_apps": [app for app in apps if app not in self.tenants],
            "missing_apps": [tenant for tenant in self.tenants.keys() 
                            if tenant != 'DEFAULT' and tenant not in apps],
            "home_variants": {
                "used": home_variants_used,
                "note": "⚠️  homeVariant belum diimplementasikan di HomeScreen. Lihat HOME_VARIANT.md untuk detail."
            }
        }
        return status


def main():
    """CLI entry point."""
    parser = argparse.ArgumentParser(description='Closepay App Manager')
    subparsers = parser.add_subparsers(dest='command', help='Commands')
    
    # List command
    list_parser = subparsers.add_parser('list', help='List tenants or apps')
    list_parser.add_argument('type', choices=['tenants', 'apps', 'all'], 
                            help='What to list')
    
    # Create tenant
    create_parser = subparsers.add_parser('create-tenant', help='Create a new tenant')
    create_parser.add_argument('tenant_id', help='Tenant ID')
    create_parser.add_argument('name', help='Tenant name')
    create_parser.add_argument('--role', default='member', 
                              choices=['merchant', 'member', 'admin', 'pos'],
                              help='Tenant role (default: member)')
    create_parser.add_argument('--features', nargs='+', 
                              help='Enabled features')
    create_parser.add_argument('--home-variant', default='member',
                              choices=['dashboard', 'simple', 'member', 'custom'],
                              help='Home variant (default: member)')
    
    # Update tenant
    update_parser = subparsers.add_parser('update-tenant', help='Update tenant')
    update_parser.add_argument('tenant_id', help='Tenant ID')
    update_parser.add_argument('--name', help='Tenant name')
    update_parser.add_argument('--role', choices=['merchant', 'member', 'admin', 'pos'],
                              help='Tenant role')
    update_parser.add_argument('--features', nargs='+', 
                              help='Enabled features')
    update_parser.add_argument('--primary-color', help='Primary color (hex)')
    
    # Delete tenant
    delete_parser = subparsers.add_parser('delete-tenant', help='Delete tenant')
    delete_parser.add_argument('tenant_id', help='Tenant ID')
    delete_parser.add_argument('--delete-app', action='store_true',
                              help='Also delete app directory')
    
    # Generate app
    generate_parser = subparsers.add_parser('generate', help='Generate app repository')
    generate_parser.add_argument('tenant_id', help='Tenant ID')
    generate_parser.add_argument('--folder', '--app-folder', dest='app_folder_name',
                                help='Folder name for app (defaults to tenant_id)')
    generate_parser.add_argument('--output', '--path', dest='output_path',
                                help='Output directory path (defaults to apps/{folder_name})')
    generate_parser.add_argument('--overwrite', action='store_true',
                                help='Overwrite existing app')
    
    # Sync config
    sync_parser = subparsers.add_parser('sync', help='Sync config to app')
    sync_parser.add_argument('tenant_id', nargs='?', help='Tenant ID (optional, syncs all if omitted)')
    
    # Validate
    validate_parser = subparsers.add_parser('validate', help='Validate all tenants')
    
    # Status
    status_parser = subparsers.add_parser('status', help='Show status')
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return
    
    try:
        manager = AppManager()
        
        if args.command == 'list':
            if args.type == 'tenants':
                tenants = manager.list_tenants()
                print(f"Tenants ({len(tenants)}):")
                for tenant_id in tenants:
                    tenant = manager.get_tenant(tenant_id)
                    features = ', '.join(tenant.get('enabledFeatures', [])) or 'none'
                    print(f"  - {tenant_id}: {tenant.get('name')} ({tenant.get('role')}) - Features: {features}")
            elif args.type == 'apps':
                apps = manager.list_apps()
                print(f"Generated Apps ({len(apps)}):")
                for app_id in apps:
                    print(f"  - {app_id}")
            elif args.type == 'all':
                tenants = manager.list_tenants()
                apps = manager.list_apps()
                print(f"Tenants ({len(tenants)}):")
                for tenant_id in tenants:
                    print(f"  - {tenant_id}")
                print(f"\nGenerated Apps ({len(apps)}):")
                for app_id in apps:
                    print(f"  - {app_id}")
        
        elif args.command == 'create-tenant':
            success, msg = manager.create_tenant(
                args.tenant_id,
                args.name,
                role=args.role,
                enabled_features=args.features,
                home_variant=args.home_variant
            )
            print(msg)
            sys.exit(0 if success else 1)
        
        elif args.command == 'update-tenant':
            updates = {}
            if args.name:
                updates['name'] = args.name
            if args.role:
                updates['role'] = args.role
            if args.features:
                updates['enabledFeatures'] = args.features
            if args.primary_color:
                if 'theme' not in updates:
                    tenant = manager.get_tenant(args.tenant_id)
                    updates['theme'] = tenant.get('theme', {}).copy()
                updates['theme']['primary'] = args.primary_color
            
            if not updates:
                print("No updates specified")
                sys.exit(1)
            
            success, msg = manager.update_tenant(args.tenant_id, **updates)
            print(msg)
            sys.exit(0 if success else 1)
        
        elif args.command == 'delete-tenant':
            success, msg = manager.delete_tenant(args.tenant_id, delete_app=args.delete_app)
            print(msg)
            sys.exit(0 if success else 1)
        
        elif args.command == 'generate':
            success, msg = manager.generate_app(
                args.tenant_id, 
                overwrite=args.overwrite,
                app_folder_name=args.app_folder_name,
                output_path=args.output_path
            )
            print(msg)
            sys.exit(0 if success else 1)
        
        elif args.command == 'sync':
            if args.tenant_id:
                success, msg = manager.sync_config(args.tenant_id)
                print(msg)
                sys.exit(0 if success else 1)
            else:
                success, results = manager.sync_all_configs()
                print("Syncing all configs:")
                for result in results:
                    print(f"  {result}")
                sys.exit(0 if success else 1)
        
        elif args.command == 'validate':
            success, msg = manager.validate_all()
            print(msg)
            sys.exit(0 if success else 1)
        
        elif args.command == 'status':
            status = manager.get_status()
            print("Status:")
            print(f"  Tenants: {status['tenants']['total']} ({', '.join(status['tenants']['ids'])})")
            print(f"  Apps: {status['apps']['total']} ({', '.join(status['apps']['ids'])})")
            if status['orphaned_apps']:
                print(f"  ⚠️  Orphaned apps (no tenant): {', '.join(status['orphaned_apps'])}")
            if status['missing_apps']:
                print(f"  ⚠️  Missing apps (tenant exists but no repo): {', '.join(status['missing_apps'])}")
            
            # Show homeVariant usage
            print(f"\n  Home Variants:")
            variants = status.get('home_variants', {}).get('used', {})
            for variant, tenant_ids in variants.items():
                print(f"    - {variant}: {len(tenant_ids)} tenant(s) - {', '.join(tenant_ids)}")
            if status.get('home_variants', {}).get('note'):
                print(f"  {status['home_variants']['note']}")
    
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()

