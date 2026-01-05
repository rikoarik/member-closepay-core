"""
Repo Generator Module
Generate new app repository from template based on tenant configuration
"""

import os
import shutil
import json
from typing import Dict, Optional, Tuple
from pathlib import Path


def get_repo_root() -> Optional[Path]:
    """Find the repository root directory (contains apps/, packages/, etc.)."""
    current = Path(__file__).resolve()
    
    # If we're in a standalone app repo (tools/app-manager/), go up to app root
    # Expected structure: app_root/tools/app-manager/repo_generator.py
    if current.parent.name == 'app-manager' and current.parent.parent.name == 'tools':
        app_root = current.parent.parent.parent
        # Check if this looks like an app directory (has src/, config/, etc.)
        if (app_root / 'src').exists() or (app_root / 'config').exists():
            return app_root
    
    # Original logic: Go up from tools/closepay-core-manager/ to repo root
    # Expected structure: repo_root/tools/closepay-core-manager/repo_generator.py
    repo_root = current.parent.parent.parent
    
    # Verify it's the repo root by checking for apps/ and packages/ directories
    if (repo_root / 'apps').exists() and (repo_root / 'packages').exists():
        return repo_root
    
    # Try one more level up (in case we're in a subdirectory)
    repo_root = repo_root.parent
    if (repo_root / 'apps').exists() and (repo_root / 'packages').exists():
        return repo_root
    
    return None


def normalize_company_initial(company_initial: str) -> str:
    """
    Normalize company initial to uppercase alphanumeric format.
    
    Args:
        company_initial: Company initial string (may be mixed case)
    
    Returns:
        Normalized uppercase string
    
    Examples:
        normalize_company_initial('tki-ftp') -> 'TKIFTP'
        normalize_company_initial('mb') -> 'MB'
        normalize_company_initial('P2L') -> 'P2L'
    """
    if not company_initial:
        return company_initial
    
    # Remove dashes/underscores and convert to uppercase
    normalized = company_initial.replace('-', '').replace('_', '').upper()
    return normalized


def to_company_id(company_initial: str) -> str:
    """
    Convert companyInitial (uppercase) to companyId (kebab-case).
    
    Args:
        company_initial: Company initial in uppercase format (e.g., 'TKIFTP', 'MB')
    
    Returns:
        Company ID in kebab-case format (e.g., 'tki-ftp', 'mb')
    
    Examples:
        to_company_id('TKIFTP') -> 'tki-ftp'
        to_company_id('MB') -> 'mb'
        to_company_id('P2L') -> 'p2l'
    """
    if not company_initial:
        return ''
    
    # Simple conversion: lowercase
    # Note: Smart word splitting (TKIFTP -> tki-ftp) is complex and error-prone
    # For now, just lowercase - users can provide kebab-case tenant_id if needed
    return company_initial.lower()


def get_template_path(variant: str = 'member') -> Optional[Path]:
    """
    Get the path to the template.
    
    For standalone apps, return None (no template needed).
    """
    current = Path(__file__).resolve()
    
    # If we're in a standalone app, no template needed
    if current.parent.name == 'app-manager' and current.parent.parent.name == 'tools':
        return None
    
    # Original logic for main repo
    repo_root = get_repo_root()
    if not repo_root:
        return None
    
    # Try member-base first (default), then merchant-base as fallback
    if variant == 'member':
        template_path = repo_root / 'apps' / 'member-base'
        if template_path.exists():
            return template_path
        
        # Fallback to merchant-base if member-base doesn't exist
        template_path = repo_root / 'apps' / 'merchant-base'
        if template_path.exists():
            return template_path
    else:
        # For merchant variant, use merchant-base
        template_path = repo_root / 'apps' / 'merchant-base'
        if template_path.exists():
            return template_path
    
    return None
    
    # Try member-base first (default), then merchant-base as fallback
    if variant == 'member':
        template_path = repo_root / 'apps' / 'member-base'
        if template_path.exists():
            return template_path
        
        # Fallback to merchant-base if member-base doesn't exist
        template_path = repo_root / 'apps' / 'merchant-base'
        if template_path.exists():
            return template_path
    else:
        # For merchant variant, use merchant-base
        template_path = repo_root / 'apps' / 'merchant-base'
        if template_path.exists():
            return template_path
    
    return None


def generate_config_from_tenant(tenant: Dict, tenant_id: str) -> str:
    """Generate app.config.ts content from tenant configuration."""
    enabled_features = tenant.get('enabledFeatures', [])
    theme = tenant.get('theme', {})
    home_variant = tenant.get('homeVariant', 'dashboard')
    home_tabs = tenant.get('homeTabs', [])
    
    # Get companyInitial from tenant config, or normalize from tenant_id
    company_initial = tenant.get('companyInitial')
    if not company_initial:
        # Auto-generate from tenant_id: convert kebab-case to uppercase
        company_initial = normalize_company_initial(tenant_id)
    else:
        # Normalize the provided companyInitial
        company_initial = normalize_company_initial(company_initial)
    
    # Generate companyId from companyInitial (kebab-case)
    # Use tenant_id as fallback for backward compatibility
    company_id = to_company_id(company_initial) or tenant_id
    
    # Build menu config from enabled features
    menu_config = []
    menu_order = 1
    
    # Always add home
    menu_config.append({
        'id': 'home',
        'label': 'Home',
        'icon': 'home',
        'route': 'Home',
        'visible': True,
        'order': menu_order,
    })
    menu_order += 1
    
    # Add menu items based on enabled features
    feature_menu_map = {
        'balance': {
            'id': 'balance',
            'label': 'Balance',
            'icon': 'wallet',
            'route': 'TransactionHistory',
        },
        'payment': {
            'id': 'payment',
            'label': 'Payment',
            'icon': 'creditcard',
            'route': 'TopUp',
        },
        'catalog': {
            'id': 'catalog',
            'label': 'Catalog',
            'icon': 'shopping',
            'route': 'Catalog',
        },
        'order': {
            'id': 'order',
            'label': 'Order',
            'icon': 'list',
            'route': 'OrderList',
        },
        'reporting': {
            'id': 'reporting',
            'label': 'Reports',
            'icon': 'chart',
            'route': 'Reports',
        },
    }
    
    for feature in enabled_features:
        if feature in feature_menu_map:
            menu_item = feature_menu_map[feature].copy()
            menu_item['visible'] = True
            menu_item['order'] = menu_order
            menu_config.append(menu_item)
            menu_order += 1
    
    # Determine segment ID (default to balance-management for member apps)
    segment_id = tenant.get('segmentId', 'balance-management')
    
    # Format enabled features as TypeScript array
    def format_ts_array(items):
        if not items:
            return '[]'
        items_str = ', '.join([f"'{item}'" for item in items])
        return f'[{items_str}]'
    
    # Format menu config as TypeScript array
    def format_menu_config(menu_items):
        if not menu_items:
            return '[]'
        lines = ['[']
        for i, item in enumerate(menu_items):
            lines.append('    {')
            for key, value in item.items():
                if isinstance(value, str):
                    lines.append(f"      {key}: '{value}',")
                elif isinstance(value, bool):
                    lines.append(f"      {key}: {str(value).lower()},")
                else:
                    lines.append(f"      {key}: {value},")
            lines.append('    }' + (',' if i < len(menu_items) - 1 else ''))
        lines.append('  ]')
        return '\n'.join(lines)
    
    # Format home tabs config
    def format_home_tabs_config(tabs):
        if not tabs:
            return 'undefined'
        return format_menu_config(tabs)
    
    # Build config content
    config_content = f"""/**
 * {tenant.get('name', tenant_id)} App Configuration
 * Auto-generated from tenant configuration
 */

import type {{ AppConfig }} from '../../../packages/core/config/types/AppConfig';
import Config from '../../../packages/core/native/Config';

export const appConfig: AppConfig = {{
  companyInitial: '{company_initial}',
  companyId: '{company_id}',
  companyName: '{tenant.get('appName') or tenant.get('name', tenant_id)}',
  segmentId: '{segment_id}',
  
  // Enabled features (feature flags)
  enabledFeatures: {format_ts_array(enabled_features)},
  
  // Enabled modules/plugins
  enabledModules: {format_ts_array(enabled_features)},
  
  // Home variant from tenant config
  homeVariant: '{home_variant}',
  
  // Home tabs configuration (for member variant)
  homeTabs: {format_home_tabs_config(home_tabs)},
  
  // Menu configuration
  menuConfig: {format_menu_config(menu_config)},
  
  // Payment methods
  paymentMethods: ['balance', 'bank_transfer', 'virtual_account'],
  
  // Branding
  branding: {{
    logo: '{tenant.get('logoPath', '')}',
    appName: '{tenant.get('appName') or tenant.get('name', tenant_id)}',
  }},
  
  // Service configuration
  services: {{
    api: {{
      // Use environment variable from .env.staging or .env.production
      baseUrl: Config.API_BASE_URL || 'https://api.solusiuntuknegeri.com',
      timeout: 30000,
    }},
    auth: {{
      useMock: __DEV__, // Use mock in development, real API in production
    }},
    features: {{
      pushNotification: true,
      analytics: true,
      crashReporting: false,
    }},
  }},
}};
"""
    return config_content


def update_ios_config(ios_dir: Path, app_name: str, display_name: str, tenant_id: str, tenant: Optional[Dict] = None) -> None:
    """
    Update iOS configuration files for the generated app.
    
    Args:
        ios_dir: Path to ios directory
        app_name: App folder name (e.g., 'member-base')
        display_name: Display name for the app (e.g., 'Member Base')
        tenant_id: Tenant ID (for fallback)
        tenant: Optional tenant dict for additional config (packageName, etc.)
    """
    import re
    
    # Generate app identifier from app name (PascalCase, no dashes)
    # Example: member-base -> MemberBase
    app_name_clean = app_name.replace('-', '').replace('_', '').title()
    app_identifier = app_name_clean
    
    # Use display name if it's cleaner and shorter
    if display_name:
        display_clean = ''.join(word.title() for word in display_name.split() if word.isalnum())
        # Only use display name if it's reasonable length
        if len(display_clean) < 30 and len(display_clean) > 3:
            # Use display name if it's cleaner
            if len(display_clean) <= len(app_identifier) + 5:
                app_identifier = display_clean
    
    # Get bundle identifier from tenant config (packageName)
    # Fallback to auto-generated if not provided (backward compatibility)
    bundle_id = tenant.get('packageName') if tenant else None
    if not bundle_id:
        bundle_id = f"com.closepay.{tenant_id.replace('-', '.').lower()}"
    
    # 1. Update Info.plist
    info_plist = ios_dir / app_identifier / 'Info.plist'
    if not info_plist.exists():
        # Try with original name
        info_plist = ios_dir / 'MemberBaseApp' / 'Info.plist'
        if info_plist.exists():
            # Rename directory
            old_dir = ios_dir / 'MemberBaseApp'
            new_dir = ios_dir / app_identifier
            old_dir.rename(new_dir)
            info_plist = new_dir / 'Info.plist'
    
    if info_plist.exists():
        try:
            with open(info_plist, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Update CFBundleDisplayName
            content = re.sub(
                r'<key>CFBundleDisplayName</key>\s*<string>.*?</string>',
                f'<key>CFBundleDisplayName</key>\n\t<string>{display_name}</string>',
                content
            )
            
            with open(info_plist, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"      ✓ Updated Info.plist")
        except Exception as e:
            print(f"      ⚠ Warning: Could not update Info.plist: {str(e)}")
    
    # 2. Update AppDelegate.swift
    app_delegate = ios_dir / app_identifier / 'AppDelegate.swift'
    if not app_delegate.exists():
        app_delegate = ios_dir / 'MemberBaseApp' / 'AppDelegate.swift'
    
    if app_delegate.exists():
        try:
            with open(app_delegate, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Update module name
            content = re.sub(
                r'withModuleName:\s*"[^"]+"',
                f'withModuleName: "{app_identifier}"',
                content
            )
            
            with open(app_delegate, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"      ✓ Updated AppDelegate.swift")
        except Exception as e:
            print(f"      ⚠ Warning: Could not update AppDelegate.swift: {str(e)}")
    
    # 3. Update Podfile
    podfile = ios_dir / 'Podfile'
    if podfile.exists():
        try:
            with open(podfile, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Update target name
            content = re.sub(
                r"target\s+'[^']+'",
                f"target '{app_identifier}'",
                content
            )
            
            with open(podfile, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"      ✓ Updated Podfile")
        except Exception as e:
            print(f"      ⚠ Warning: Could not update Podfile: {str(e)}")
    
    # 4. Update project.pbxproj (complex, use regex replacements)
    pbxproj_files = list(ios_dir.glob('*.xcodeproj/project.pbxproj'))
    for pbxproj in pbxproj_files:
        try:
            with open(pbxproj, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Replace all occurrences of MerchantClosepayV2 with app_identifier
            content = content.replace('MerchantClosepayV2', app_identifier)
            
            # Update PRODUCT_BUNDLE_IDENTIFIER
            content = re.sub(
                r'PRODUCT_BUNDLE_IDENTIFIER\s*=\s*"[^"]+";',
                f'PRODUCT_BUNDLE_IDENTIFIER = "{bundle_id}";',
                content
            )
            
            # Update PRODUCT_NAME
            content = re.sub(
                r'PRODUCT_NAME\s*=\s*[^;]+;',
                f'PRODUCT_NAME = {app_identifier};',
                content
            )
            
            with open(pbxproj, 'w', encoding='utf-8') as f:
                f.write(content)
            
            # Rename .xcodeproj directory if needed
            xcodeproj_dir = pbxproj.parent.parent
            if xcodeproj_dir.name == 'MerchantClosepayV2.xcodeproj' or xcodeproj_dir.name == 'memberBaseApp.xcodeproj':
                new_xcodeproj = xcodeproj_dir.parent / f'{app_identifier}.xcodeproj'
                xcodeproj_dir.rename(new_xcodeproj)
            
            print(f"      ✓ Updated project.pbxproj")
        except Exception as e:
            print(f"      ⚠ Warning: Could not update project.pbxproj: {str(e)}")
    
    # 5. Update app.json if exists
    app_json = ios_dir.parent / 'app.json'
    if app_json.exists():
        try:
            import json
            with open(app_json, 'r', encoding='utf-8') as f:
                app_config = json.load(f)
            
            app_config['name'] = app_identifier
            app_config['displayName'] = display_name
            
            with open(app_json, 'w', encoding='utf-8') as f:
                json.dump(app_config, f, indent=2, ensure_ascii=False)
            print(f"      ✓ Updated app.json")
        except Exception as e:
            print(f"      ⚠ Warning: Could not update app.json: {str(e)}")


def update_index_tsx(content: str, tenant_id: str, tenant_name: str) -> str:
    """Update index.tsx content with tenant-specific values."""
    # Convert tenant_id to PascalCase for function names
    def to_pascal_case(s: str) -> str:
        return ''.join(word.capitalize() for word in s.replace('-', '_').split('_'))
    
    pascal_name = to_pascal_case(tenant_id)
    
    # Replace tenant ID in createAppNavigator call
    content = content.replace("tenantId: 'merchant-base'", f"tenantId: '{tenant_id}'")
    content = content.replace('tenantId: "merchant-base"', f'tenantId: "{tenant_id}"')
    
    # Replace function names
    content = content.replace('MerchantBaseAppContent', f'{pascal_name}AppContent')
    content = content.replace('MerchantBaseApp', f'{pascal_name}App')
    
    # Replace comments
    content = content.replace('Merchant Base App Entry Point', f'{tenant_name} App Entry Point')
    
    # Process line by line for more precise replacements
    lines = content.split('\n')
    result_lines = []
    skip_next = False
    
    for i, line in enumerate(lines):
        if skip_next:
            skip_next = False
            continue
        
        # Uncomment config import (change from template to actual config)
        if '// import { appConfig }' in line and 'app.config.template' in line:
            # Change to import from app.config.ts
            new_line = line.replace('// ', '').replace('app.config.template', 'app.config')
            result_lines.append(new_line)
            continue
        
        # Uncomment configService.setConfig (if commented)
        if '// configService.setConfig(appConfig);' in line:
            result_lines.append('        configService.setConfig(appConfig);')
            continue
        
        # Comment out loadConfig() fallback and replace with configService.setConfig
        if 'await configService.loadConfig();' in line:
            # Replace with configService.setConfig(appConfig)
            result_lines.append('        configService.setConfig(appConfig);')
            # Skip the comment line if it exists
            if i + 1 < len(lines) and '// This will use default config' in lines[i + 1]:
                skip_next = True
            continue
        
        # Replace merchant-base in comments and strings
        if '//' in line:
            line = line.replace('merchant-base', tenant_id)
        if "'merchant-base'" in line:
            line = line.replace("'merchant-base'", f"'{tenant_id}'")
        if '"merchant-base"' in line:
            line = line.replace('"merchant-base"', f'"{tenant_id}"')
        
        result_lines.append(line)
    
    return '\n'.join(result_lines)


def generate_repo(tenant_id: str, tenant: Dict, overwrite: bool = False, 
                 app_folder_name: Optional[str] = None, 
                 output_path: Optional[str] = None,
                 template_variant: Optional[str] = None) -> Tuple[bool, str]:
    """
    Generate a new app repository from template.
    
    Args:
        tenant_id: The tenant ID (used in config, not necessarily folder name)
        tenant: Tenant configuration dictionary
        overwrite: Whether to overwrite existing directory
        app_folder_name: Optional folder name for app (defaults to tenant_id if not provided)
        output_path: Optional full path where to save (if not provided, uses apps/{folder_name})
        
    Returns:
        Tuple of (success: bool, message: str)
    """
        # Determine template variant based on homeVariant
    if not template_variant:
        home_variant = tenant.get('homeVariant', 'member')
        if home_variant == 'member':
            template_variant = 'member'
        else:
            template_variant = 'merchant'
    
    template_path = get_template_path(template_variant)
    if not template_path:
        return False, f"Could not find template directory (apps/{template_variant}-base or apps/merchant-base)"
    
    # Use app_folder_name if provided, otherwise use tenant_id
    folder_name = app_folder_name if app_folder_name else tenant_id
    
    # Validate folder_name (must be valid directory name)
    if not folder_name or not folder_name.replace('-', '').replace('_', '').isalnum():
        return False, f"Invalid folder name: {folder_name}. Must be alphanumeric with dashes/underscores only"
    
    # Determine target path
    if output_path:
        # Use custom output path - create standalone repo structure
        output_path_obj = Path(output_path)
        # If output_path is a directory, use it as repo root
        if output_path_obj.is_dir() or not output_path_obj.exists():
            output_dir = output_path_obj
        else:
            # If it's a file path, use parent as repo root
            output_dir = output_path_obj.parent
        
        # Create apps/{app-name}/ structure in output_dir
        target_path = output_dir / 'apps' / folder_name
    else:
        # Default: use apps/ folder in main repo
        repo_root = get_repo_root()
        if not repo_root:
            return False, "Could not find repository root directory"
        target_path = repo_root / 'apps' / folder_name
        output_dir = None  # Not a standalone repo
    
    # Check if directory already exists
    if target_path.exists() and not overwrite:
        path_str = str(target_path)
        return False, f"Directory '{path_str}' already exists. Use overwrite=True to replace it."
    
    try:
        # Ensure apps directory exists (for standalone repo)
        if output_path and output_dir:
            apps_dir = output_dir / 'apps'
            apps_dir.mkdir(parents=True, exist_ok=True)
        
        # Remove existing directory if overwriting
        if target_path.exists() and overwrite:
            shutil.rmtree(target_path)
        
        # Copy template directory
        shutil.copytree(template_path, target_path)
        
        # Update index.tsx
        index_file = target_path / 'index.tsx'
        if index_file.exists():
            with open(index_file, 'r', encoding='utf-8') as f:
                index_content = f.read()
            
            updated_content = update_index_tsx(index_content, tenant_id, tenant.get('appName') or tenant.get('name', tenant_id))
            
            with open(index_file, 'w', encoding='utf-8') as f:
                f.write(updated_content)
        
        # Generate config file
        config_dir = target_path / 'config'
        config_dir.mkdir(exist_ok=True)
        
        config_content = generate_config_from_tenant(tenant, tenant_id)
        config_file = config_dir / 'app.config.ts'
        
        with open(config_file, 'w', encoding='utf-8') as f:
            f.write(config_content)
        
        # Update README if exists
        readme_file = target_path / 'README.md'
        if readme_file.exists():
            with open(readme_file, 'r', encoding='utf-8') as f:
                readme_content = f.read()
            
            readme_content = readme_content.replace('merchant-base', tenant_id)
            readme_content = readme_content.replace('Merchant Base', tenant.get('appName') or tenant.get('name', tenant_id))
            
            with open(readme_file, 'w', encoding='utf-8') as f:
                f.write(readme_content)
        
        # Copy all necessary root files for standalone app (only if custom output_path)
        # If output_path is custom, create standalone repo with all dependencies
        if output_path and output_dir:
            repo_root = get_repo_root()
            if repo_root:
                print(f"\n📦 Setting up standalone repo at: {output_dir}")
                print(f"   App folder: {target_path}")
                
                # List of essential config files to copy
                root_config_files = [
                    'package.json',
                    'tsconfig.json',
                    'babel.config.js',
                    'metro.config.js',
                    'react-native.config.js',
                    'tailwind.config.js',
                    'index.js',
                    'App.tsx',
                    'app.json',
                    '.gitignore',
                    'jest.config.js',
                    'jest.setup.js',
                    'nativewind-env.d.ts',
                    'iconsax-react-native.d.ts',
                    'global.css',
                ]
                
                for config_file in root_config_files:
                    src_file = repo_root / config_file
                    if src_file.exists():
                        dest_file = output_dir / config_file
                        try:
                            # Skip if file already exists (don't overwrite)
                            if dest_file.exists() and config_file not in ['App.tsx']:
                                print(f"   Skipping {config_file} (already exists)")
                                continue
                            
                            if config_file == 'App.tsx':
                                # Update App.tsx to import from generated app
                                with open(src_file, 'r', encoding='utf-8') as f:
                                    app_content = f.read()
                                # Replace import to use generated app
                                app_content = app_content.replace(
                                    "import MerchantBaseApp from './apps/merchant-base';",
                                    f"import {tenant_id.replace('-', '').title().replace(' ', '')}App from './apps/{folder_name}';"
                                )
                                app_content = app_content.replace(
                                    "export default MerchantBaseApp;",
                                    f"export default {tenant_id.replace('-', '').title().replace(' ', '')}App;"
                                )
                                with open(dest_file, 'w', encoding='utf-8') as f:
                                    f.write(app_content)
                                print(f"   ✓ Copied {config_file} (updated for {folder_name})")
                            else:
                                shutil.copy2(src_file, dest_file)
                                print(f"   ✓ Copied {config_file}")
                        except Exception as e:
                            print(f"   ⚠ Warning: Could not copy {config_file}: {str(e)}")
                
                # Copy packages/core (essential)
                core_source = repo_root / 'packages' / 'core'
                if core_source.exists():
                    core_target = output_dir / 'packages' / 'core'
                    if not core_target.exists():
                        try:
                            print(f"   Copying packages/core to {core_target}...")
                            shutil.copytree(core_source, core_target, ignore=shutil.ignore_patterns(
                                '__pycache__', '*.pyc', '.git', 'node_modules', '*.test.ts', '*.test.tsx', '__tests__'
                            ))
                            print(f"   ✓ Copied packages/core")
                        except Exception as e:
                            print(f"   ⚠ Warning: Could not copy core packages: {str(e)}")
                    else:
                        print(f"   ⚠ packages/core already exists, skipping...")
                
                # Copy packages/plugins (only enabled ones)
                plugins_source = repo_root / 'packages' / 'plugins'
                if plugins_source.exists():
                    enabled_features = tenant.get('enabledFeatures', [])
                    plugins_target = output_dir / 'packages' / 'plugins'
                    if enabled_features:
                        plugins_target.mkdir(parents=True, exist_ok=True)
                        print(f"   Copying {len(enabled_features)} plugins...")
                        for plugin_id in enabled_features:
                            plugin_source = plugins_source / plugin_id
                            if plugin_source.exists():
                                plugin_target = plugins_target / plugin_id
                                try:
                                    shutil.copytree(plugin_source, plugin_target, ignore=shutil.ignore_patterns(
                                        '__pycache__', '*.pyc', '.git', 'node_modules', '__tests__'
                                    ))
                                    print(f"      ✓ Copied plugin: {plugin_id}")
                                except Exception as e:
                                    print(f"      ⚠ Warning: Could not copy plugin {plugin_id}: {str(e)}")
                            else:
                                print(f"      ⚠ Plugin not found: {plugin_id}")
                
                # Copy android and ios directories
                android_source = repo_root / 'android'
                ios_source = repo_root / 'ios'
                assets_source = repo_root / 'assets'
                
                if android_source.exists():
                    android_target = output_dir / 'android'
                    if not android_target.exists():
                        try:
                            shutil.copytree(android_source, android_target, ignore=shutil.ignore_patterns(
                                'build', '.gradle', 'node_modules', '*.iml', 'local.properties'
                            ))
                        except Exception as e:
                            print(f"Warning: Could not copy Android: {str(e)}")
                
                if ios_source.exists():
                    ios_target = output_dir / 'ios'
                    if not ios_target.exists():
                        try:
                            shutil.copytree(ios_source, ios_target, ignore=shutil.ignore_patterns(
                                'Pods', 'build', 'DerivedData', 'node_modules', '.xcode.env.local'
                            ))
                            print(f"   ✓ Copied iOS directory")
                            
                            # Update iOS configuration files
                            update_ios_config(ios_target, folder_name, tenant.get('appName') or tenant.get('name', tenant_id), tenant_id, tenant)
                        except Exception as e:
                            print(f"   ⚠ Warning: Could not copy iOS: {str(e)}")
                
                if assets_source.exists():
                    assets_target = output_dir / 'assets'
                    if not assets_target.exists():
                        try:
                            shutil.copytree(assets_source, assets_target)
                        except Exception as e:
                            print(f"Warning: Could not copy assets: {str(e)}")
                
                # Create setup script
                setup_script = output_dir / 'setup.sh'
                setup_bat = output_dir / 'setup.bat'
                
                setup_sh_content = """#!/bin/bash
# Setup script for {app_name}
echo "Setting up {app_name}..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Link assets
echo "Linking assets..."
npx react-native-asset

# iOS setup (if on Mac)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "Setting up iOS..."
    cd ios && pod install && cd ..
fi

echo "Setup complete! Run 'npm start' to start Metro bundler."
"""
                
                setup_bat_content = """@echo off
REM Setup script for {app_name}
echo Setting up {app_name}...

REM Install dependencies
echo Installing dependencies...
call npm install

REM Link assets
echo Linking assets...
call npx react-native-asset

echo Setup complete! Run 'npm start' to start Metro bundler.
pause
"""
                
                try:
                    with open(setup_script, 'w', encoding='utf-8') as f:
                        f.write(setup_sh_content.format(app_name=tenant.get('name', tenant_id)))
                    # Make executable on Unix
                    import stat
                    if setup_script.exists():
                        setup_script.chmod(setup_script.stat().st_mode | stat.S_IEXEC)
                    
                    with open(setup_bat, 'w', encoding='utf-8') as f:
                        f.write(setup_bat_content.format(app_name=tenant.get('name', tenant_id)))
                except Exception as e:
                    print(f"Warning: Could not create setup scripts: {str(e)}")
                
                # Create README for standalone repo
                readme_file = output_dir / 'README.md'
                readme_content = f"""# {tenant.get('name', tenant_id)}

{tenant.get('name', tenant_id)} - Closepay Application

## Quick Start

### Prerequisites
- Node.js >= 20
- React Native development environment set up
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Setup

**Windows:**
```batch
setup.bat
```

**Linux/Mac:**
```bash
chmod +x setup.sh
./setup.sh
```

### Running the App

**Start Metro Bundler:**
```bash
npm start
```

**Run on Android:**
```bash
npm run android
```

**Run on iOS:**
```bash
npm run ios
```

## Project Structure

```
{output_dir.name}/
├── apps/
│   └── {folder_name}/          # App source code
│       ├── config/
│       │   └── app.config.ts   # App configuration
│       └── src/
├── packages/
│   ├── core/                   # Core modules
│   └── plugins/                # Enabled plugins
├── android/                    # Android native code
├── ios/                        # iOS native code
├── assets/                     # Assets (fonts, images)
└── tools/
    └── app-manager/            # App management tools
```

## Configuration

App configuration is located in `apps/{folder_name}/config/app.config.ts`.

To update configuration, use the app manager:
```bash
tools/app-manager/manage.bat sync {tenant_id}
```

## Development

See the main repository documentation for development guidelines.

## License

Private - {tenant.get('name', tenant_id)}
"""
                try:
                    with open(readme_file, 'w', encoding='utf-8') as f:
                        f.write(readme_content)
                except Exception as e:
                    print(f"Warning: Could not create README: {str(e)}")
        
        # Copy app manager tools to the new repo
        tools_source = Path(__file__).parent  # tools/closepay-core-manager
        tools_target = target_path / 'tools' / 'app-manager'
        
        # Copy app manager tools to the new repo
        tools_source = Path(__file__).parent  # tools/closepay-core-manager
        tools_target = target_path / 'tools' / 'app-manager'
        
        try:
            # Create tools directory
            tools_target.parent.mkdir(parents=True, exist_ok=True)
            
            # Copy tools directory (exclude __pycache__ and .git)
            if tools_target.exists():
                shutil.rmtree(tools_target)
            
            # Copy files individually to exclude __pycache__
            tools_target.mkdir(parents=True, exist_ok=True)
            for item in tools_source.iterdir():
                if item.name in ['__pycache__', '.git', '.gitignore']:
                    continue
                if item.is_file():
                    shutil.copy2(item, tools_target / item.name)
                elif item.is_dir() and item.name != '__pycache__':
                    shutil.copytree(item, tools_target / item.name, ignore=shutil.ignore_patterns('__pycache__', '*.pyc'))
            
            # Update repo_generator.py to work from new repo location
            repo_generator_file = tools_target / 'repo_generator.py'
            if repo_generator_file.exists():
                with open(repo_generator_file, 'r', encoding='utf-8') as f:
                    repo_gen_content = f.read()
                
                # Update get_repo_root and get_template_path for standalone app
                import re
                
                # Update get_repo_root
                pattern_root = r'def get_repo_root\(\) -> Optional\[Path\]:.*?return None'
                replacement_root = '''def get_repo_root() -> Optional[Path]:
    """Find the repository root directory (contains apps/, packages/, etc.)."""
    current = Path(__file__).resolve()
    
    # If we're in a standalone app repo (tools/app-manager/), go up to app root
    # Expected structure: app_root/tools/app-manager/repo_generator.py
    if current.parent.name == 'app-manager' and current.parent.parent.name == 'tools':
        app_root = current.parent.parent.parent
        # Check if this looks like an app directory (has src/, config/, etc.)
        if (app_root / 'src').exists() or (app_root / 'config').exists():
            return app_root
    
    # Original logic: Go up from tools/closepay-core-manager/ to repo root
    # Expected structure: repo_root/tools/closepay-core-manager/repo_generator.py
    repo_root = current.parent.parent.parent
    
    # Verify it's the repo root by checking for apps/ and packages/ directories
    if (repo_root / 'apps').exists() and (repo_root / 'packages').exists():
        return repo_root
    
    # Try one more level up (in case we're in a subdirectory)
    repo_root = repo_root.parent
    if (repo_root / 'apps').exists() and (repo_root / 'packages').exists():
        return repo_root
    
    return None'''
                
                repo_gen_content = re.sub(pattern_root, replacement_root, repo_gen_content, flags=re.DOTALL)
                
                # Update get_template_path to return None for standalone apps (no template needed)
                pattern_template = r'def get_template_path\(.*?\) -> Optional\[Path\]:.*?return None'
                replacement_template = '''def get_template_path(variant: str = 'member') -> Optional[Path]:
    """
    Get the path to the template.
    
    For standalone apps, return None (no template needed).
    """
    current = Path(__file__).resolve()
    
    # If we're in a standalone app, no template needed
    if current.parent.name == 'app-manager' and current.parent.parent.name == 'tools':
        return None
    
    # Original logic for main repo
    repo_root = get_repo_root()
    if not repo_root:
        return None
    
    # Try member-base first (default), then merchant-base as fallback
    if variant == 'member':
        template_path = repo_root / 'apps' / 'member-base'
        if template_path.exists():
            return template_path
        
        # Fallback to merchant-base if member-base doesn't exist
        template_path = repo_root / 'apps' / 'merchant-base'
        if template_path.exists():
            return template_path
    else:
        # For merchant variant, use merchant-base
        template_path = repo_root / 'apps' / 'merchant-base'
        if template_path.exists():
            return template_path
    
    return None (no template needed).
    """
    current = Path(__file__).resolve()
    
    # If we're in a standalone app, no template needed
    if current.parent.name == 'app-manager' and current.parent.parent.name == 'tools':
        return None
    
    # Original logic for main repo
    repo_root = get_repo_root()
    if not repo_root:
        return None
    
    # Try member-base first (default), then merchant-base as fallback
    if variant == 'member':
        template_path = repo_root / 'apps' / 'member-base'
        if template_path.exists():
            return template_path
        
        # Fallback to merchant-base if member-base doesn't exist
        template_path = repo_root / 'apps' / 'merchant-base'
        if template_path.exists():
            return template_path
    else:
        # For merchant variant, use merchant-base
        template_path = repo_root / 'apps' / 'merchant-base'
        if template_path.exists():
            return template_path
    
    return None'''
                
                repo_gen_content = re.sub(pattern_template, replacement_template, repo_gen_content, flags=re.DOTALL)
                
                with open(repo_generator_file, 'w', encoding='utf-8') as f:
                    f.write(repo_gen_content)
            
            # Create tenants.json for the new app (with just this tenant)
            tenants_file = tools_target / 'tenants.json'
            app_tenant = {
                tenant_id: tenant
            }
            with open(tenants_file, 'w', encoding='utf-8') as f:
                json.dump(app_tenant, f, indent=2, ensure_ascii=False)
            
            # Update README in tools to reflect this is app-specific
            tools_readme = tools_target / 'README.md'
            if tools_readme.exists():
                with open(tools_readme, 'r', encoding='utf-8') as f:
                    tools_readme_content = f.read()
                
                # Extract main content (skip first heading)
                lines = tools_readme_content.split('\n')
                main_content = '\n'.join(lines[1:]) if len(lines) > 1 else tools_readme_content
                
                new_readme = f"""# App Manager - {tenant.get('name', tenant_id)}

This is the app management tool for **{tenant.get('name', tenant_id)}** app.

## Quick Start

**Windows:**
```batch
tools\\app-manager\\manage.bat status
tools\\app-manager\\manage.bat sync {tenant_id}
```

**Linux/Mac:**
```bash
tools/app-manager/manage.sh status
tools/app-manager/manage.sh sync {tenant_id}
```

## Usage

This app manager is configured specifically for this app. The `tenants.json` contains only this app's configuration.

{main_content}
"""
                
                with open(tools_readme, 'w', encoding='utf-8') as f:
                    f.write(new_readme)
        
        except Exception as e:
            # Don't fail if tools copy fails, just log it
            import traceback
            print(f"Warning: Could not copy app manager tools: {str(e)}")
            traceback.print_exc()
        
        # Return relative or absolute path message
        if output_path:
            return True, f"Successfully generated app repository at {target_path}"
        else:
            return True, f"Successfully generated app repository at apps/{folder_name}"
        
    except Exception as e:
        return False, f"Error generating repository: {str(e)}"


def list_generated_apps() -> list:
    """List all generated app directories (excluding merchant-base template)."""
    repo_root = get_repo_root()
    if not repo_root:
        return []
    
    apps_dir = repo_root / 'apps'
    if not apps_dir.exists():
        return []
    
    apps = []
    for item in apps_dir.iterdir():
        if item.is_dir() and item.name != 'merchant-base':
            apps.append(item.name)
    
    return sorted(apps)

