"""
Config I/O Module
Handles loading and saving of tenants.json and plugins.json files
"""

import json
import os
from typing import Dict, List, Tuple, Optional


# File paths - configurable at the top
TENANTS_FILE = "tenants.json"
PLUGINS_FILE = "plugins.json"


def normalize_tenant_id(tenant_id: str) -> str:
    """Normalize tenant ID to lowercase kebab-case format."""
    if not tenant_id:
        return tenant_id
    # Convert to lowercase
    normalized = tenant_id.lower()
    # Replace spaces and underscores with dashes
    normalized = normalized.replace(' ', '-').replace('_', '-')
    # Remove multiple consecutive dashes
    while '--' in normalized:
        normalized = normalized.replace('--', '-')
    # Remove leading/trailing dashes
    normalized = normalized.strip('-')
    return normalized


def load_tenants(file_path: Optional[str] = None) -> Tuple[Dict, Optional[str]]:
    """
    Load tenants from JSON file.
    Normalizes tenant IDs to lowercase kebab-case format.
    
    Returns:
        Tuple of (tenants_dict, error_message)
        If successful, error_message is None
    """
    path = file_path or TENANTS_FILE
    
    if not os.path.exists(path):
        return {}, f"File not found: {path}"
    
    try:
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            if not isinstance(data, dict):
                return {}, f"Invalid format: {path} must contain a JSON object"
            
            # Normalize tenant IDs (keys) and update id field in each tenant
            normalized_data = {}
            for key, tenant in data.items():
                # Normalize the key
                normalized_key = normalize_tenant_id(key)
                # Update tenant's id field to match normalized key
                if isinstance(tenant, dict):
                    tenant['id'] = normalized_key
                # Use normalized key
                normalized_data[normalized_key] = tenant
            
            return normalized_data, None
    except json.JSONDecodeError as e:
        return {}, f"Invalid JSON in {path}: {str(e)}"
    except Exception as e:
        return {}, f"Error reading {path}: {str(e)}"


def load_plugins(file_path: Optional[str] = None) -> Tuple[Dict, Optional[str]]:
    """
    Load plugins from JSON file.
    
    Returns:
        Tuple of (plugins_dict, error_message)
        If successful, error_message is None
    """
    path = file_path or PLUGINS_FILE
    
    if not os.path.exists(path):
        return {}, f"File not found: {path}"
    
    try:
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            if not isinstance(data, dict):
                return {}, f"Invalid format: {path} must contain a JSON object"
            return data, None
    except json.JSONDecodeError as e:
        return {}, f"Invalid JSON in {path}: {str(e)}"
    except Exception as e:
        return {}, f"Error reading {path}: {str(e)}"


def validate_hex_color(color: str) -> bool:
    """Validate hex color format (#RRGGBB)."""
    if not color or not isinstance(color, str):
        return False
    color = color.strip().upper()
    if not color.startswith('#'):
        return False
    if len(color) != 7:
        return False
    try:
        int(color[1:], 16)
        return True
    except ValueError:
        return False


def validate_tenant(tenant: Dict, tenant_id: str, available_plugins: Dict) -> Tuple[bool, Optional[str]]:
    """
    Validate a tenant configuration.
    
    Returns:
        Tuple of (is_valid, error_message)
    """
    # Required fields
    if 'id' not in tenant or not tenant['id']:
        return False, "Tenant ID is required"
    
    if tenant['id'] != tenant_id:
        return False, f"Tenant ID mismatch: key '{tenant_id}' but id field is '{tenant['id']}'"
    
    if 'name' not in tenant or not tenant.get('name'):
        return False, f"Tenant '{tenant_id}': name is required"
    
    if 'role' not in tenant:
        return False, f"Tenant '{tenant_id}': role is required"
    
    if tenant['role'] not in ['merchant', 'member', 'admin']:
        return False, f"Tenant '{tenant_id}': role must be 'merchant', 'member', or 'admin'"
    
    # Theme validation
    if 'theme' not in tenant or not isinstance(tenant['theme'], dict):
        return False, f"Tenant '{tenant_id}': theme object is required"
    
    theme = tenant['theme']
    required_theme_fields = ['primary', 'primaryDark', 'primaryLight']
    for field in required_theme_fields:
        if field not in theme:
            return False, f"Tenant '{tenant_id}': theme.{field} is required"
        if not validate_hex_color(theme[field]):
            return False, f"Tenant '{tenant_id}': theme.{field} must be a valid hex color (#RRGGBB)"
    
    # Enabled features validation
    if 'enabledFeatures' not in tenant:
        return False, f"Tenant '{tenant_id}': enabledFeatures is required"
    
    if not isinstance(tenant['enabledFeatures'], list):
        return False, f"Tenant '{tenant_id}': enabledFeatures must be an array"
    
    # Validate all enabled features exist in plugins
    for feature in tenant['enabledFeatures']:
        if not isinstance(feature, str):
            return False, f"Tenant '{tenant_id}': enabledFeatures must contain only strings"
        if feature not in available_plugins:
            return False, f"Tenant '{tenant_id}': enabledFeatures contains unknown plugin '{feature}'"
    
    return True, None


def validate_all_tenants(tenants: Dict, plugins: Dict) -> Tuple[bool, Optional[str]]:
    """
    Validate all tenants in the dictionary.
    
    Returns:
        Tuple of (is_valid, error_message)
    """
    if not tenants:
        return False, "No tenants found"
    
    for tenant_id, tenant in tenants.items():
        is_valid, error = validate_tenant(tenant, tenant_id, plugins)
        if not is_valid:
            return False, error
    
    return True, None


def save_tenants(tenants: Dict, plugins: Dict, file_path: Optional[str] = None) -> Tuple[bool, Optional[str]]:
    """
    Save tenants to JSON file with validation.
    Normalizes tenant IDs to lowercase kebab-case format before saving.
    
    Returns:
        Tuple of (success, error_message)
    """
    path = file_path or TENANTS_FILE
    
    # Normalize tenant IDs before validation
    normalized_tenants = {}
    for key, tenant in tenants.items():
        normalized_key = normalize_tenant_id(key)
        if isinstance(tenant, dict):
            tenant['id'] = normalized_key
        normalized_tenants[normalized_key] = tenant
    
    # Validate before saving
    is_valid, error = validate_all_tenants(normalized_tenants, plugins)
    if not is_valid:
        return False, error
    
    try:
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(normalized_tenants, f, indent=2, ensure_ascii=False)
        return True, None
    except PermissionError:
        return False, f"Permission denied: Cannot write to {path}"
    except Exception as e:
        return False, f"Error writing to {path}: {str(e)}"


def get_plugin_ids(plugins: Dict) -> List[str]:
    """Get list of plugin IDs from plugins dictionary."""
    return list(plugins.keys()) if plugins else []

