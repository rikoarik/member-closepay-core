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


def validate_package_name(package_name: str) -> Tuple[bool, Optional[str]]:
    """
    Validate package name format (reverse domain notation).
    
    Rules:
    - Must be in reverse domain format (e.g., com.company.app)
    - Must contain at least 2 parts separated by dots
    - Each part must be alphanumeric (lowercase letters, numbers, underscores)
    - Each part must start with a letter
    - Total length should be reasonable (max 100 chars)
    
    Returns:
        Tuple of (is_valid, error_message)
    """
    if not package_name:
        return False, "Package name is required. Expected format: com.company.app (reverse domain notation)"
    
    if not isinstance(package_name, str):
        return False, "Package name must be a string. Expected format: com.company.app (reverse domain notation)"
    
    trimmed = package_name.strip()
    
    if len(trimmed) == 0:
        return False, "Package name cannot be empty. Expected format: com.company.app (reverse domain notation)"
    
    if len(trimmed) > 100:
        return False, f"Package name is too long ({len(trimmed)} characters). Maximum length is 100 characters. Expected format: com.company.app (reverse domain notation). Got: '{trimmed}'"
    
    # Split by dots
    parts = trimmed.split('.')
    
    if len(parts) < 2:
        return False, f"Package name must contain at least 2 parts separated by dots. Expected format: com.company.app (reverse domain notation). Got: '{trimmed}'"
    
    # Validate each part
    for i, part in enumerate(parts):
        if not part:
            return False, f"Package name contains empty part. Expected format: com.company.app (reverse domain notation). Got: '{trimmed}'"
        
        # Must start with a letter
        if not part[0].isalpha():
            return False, f"Package name part '{part}' must start with a letter. Expected format: com.company.app (reverse domain notation). Got: '{trimmed}'"
        
        # Must contain only lowercase letters, numbers, and underscores
        if not all(c.isalnum() or c == '_' for c in part):
            return False, f"Package name part '{part}' contains invalid characters. Only lowercase letters, numbers, and underscores are allowed. Expected format: com.company.app (reverse domain notation). Got: '{trimmed}'"
        
        # Should be lowercase (recommendation)
        if part != part.lower():
            return False, f"Package name part '{part}' should be lowercase. Expected format: com.company.app (reverse domain notation). Got: '{trimmed}'"
    
    return True, None


def validate_logo_path(logo_path: str) -> Tuple[bool, Optional[str]]:
    """
    Validate logo path format (relative path or URL).
    
    Rules:
    - Optional field (empty string is valid)
    - If provided, must be either:
      - Relative path (e.g., assets/logo.png)
      - URL (http:// or https://)
    - Path should not contain invalid characters
    
    Returns:
        Tuple of (is_valid, error_message)
    """
    if not logo_path:
        # Empty is valid (optional field)
        return True, None
    
    if not isinstance(logo_path, str):
        return False, "Logo path must be a string. Expected: relative path (e.g., assets/logo.png) or URL (e.g., https://example.com/logo.png)"
    
    trimmed = logo_path.strip()
    
    if len(trimmed) == 0:
        # Empty is valid
        return True, None
    
    # Check if it's a URL
    if trimmed.startswith('http://') or trimmed.startswith('https://'):
        # Basic URL validation
        if len(trimmed) > 500:
            return False, f"Logo URL is too long ({len(trimmed)} characters). Maximum length is 500 characters. Got: '{trimmed}'"
        return True, None
    
    # Check if it's a relative path
    # Should not contain invalid path characters
    invalid_chars = ['<', '>', '|', '?', '*', '"']
    for char in invalid_chars:
        if char in trimmed:
            return False, f"Logo path contains invalid character '{char}'. Expected: relative path (e.g., assets/logo.png) or URL (e.g., https://example.com/logo.png). Got: '{trimmed}'"
    
    # Should not be an absolute path (on Windows or Unix)
    if trimmed.startswith('/') or (len(trimmed) > 1 and trimmed[1] == ':'):
        return False, f"Logo path should be a relative path, not an absolute path. Expected: relative path (e.g., assets/logo.png) or URL (e.g., https://example.com/logo.png). Got: '{trimmed}'"
    
    if len(trimmed) > 200:
        return False, f"Logo path is too long ({len(trimmed)} characters). Maximum length is 200 characters. Got: '{trimmed}'"
    
    return True, None


def validate_company_initial(company_initial: str) -> Tuple[bool, Optional[str]]:
    """
    Validate companyInitial format.
    
    Rules:
    - Must be 1-20 characters
    - Must contain only alphanumeric characters and underscores
    - Must start with a letter
    
    Returns:
        Tuple of (is_valid, error_message)
    """
    if not company_initial:
        return False, "❌ Company initial is required. Expected: Uppercase alphanumeric string (e.g., 'TKIFTP', 'MB', 'P2L')"
    
    if not isinstance(company_initial, str):
        return False, "❌ Company initial must be a string. Expected: Uppercase alphanumeric string (e.g., 'TKIFTP', 'MB', 'P2L')"
    
    trimmed = company_initial.strip()
    
    if len(trimmed) == 0:
        return False, "❌ Company initial cannot be empty. Expected: Uppercase alphanumeric string (e.g., 'TKIFTP', 'MB', 'P2L')"
    
    if len(trimmed) > 20:
        return False, f"❌ Company initial is too long ({len(trimmed)} characters). Maximum length is 20 characters. Expected format: Uppercase alphanumeric string (e.g., 'TKIFTP', 'MB', 'P2L'). Got: '{trimmed}'"
    
    # Must contain only alphanumeric characters and underscores
    if not all(c.isalnum() or c == '_' for c in trimmed):
        return False, f"❌ Company initial contains invalid characters. Only uppercase letters, numbers, and underscores are allowed. Expected format: Uppercase alphanumeric string (e.g., 'TKIFTP', 'MB', 'P2L'). Got: '{trimmed}'"
    
    # Must start with a letter
    if not trimmed[0].isalpha():
        return False, f"❌ Company initial must start with a letter. Expected format: Uppercase alphanumeric string starting with a letter (e.g., 'TKIFTP', 'MB', 'P2L'). Got: '{trimmed}'"
    
    return True, None


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
    
    # Validate appName (required field, supports backward compatibility with 'name')
    app_name = tenant.get('appName') or tenant.get('name')
    if not app_name or not app_name.strip():
        return False, f"Tenant '{tenant_id}': appName is required"
    
    # Validate companyInitial (required field)
    company_initial = tenant.get('companyInitial')
    if not company_initial:
        # Auto-generate from tenant_id if not provided (backward compatibility)
        # But still validate the format
        import re
        # Normalize tenant_id: remove dashes and convert to uppercase
        auto_initial = tenant_id.replace('-', '').replace('_', '').upper()
        is_valid, error = validate_company_initial(auto_initial)
        if not is_valid:
            return False, f"Tenant '{tenant_id}': {error}"
    else:
        # Validate provided companyInitial
        is_valid, error = validate_company_initial(company_initial)
        if not is_valid:
            return False, f"Tenant '{tenant_id}': {error}"
    
    # Validate packageName (required field)
    package_name = tenant.get('packageName')
    if not package_name:
        return False, f"Tenant '{tenant_id}': packageName is required"
    
    is_valid, error = validate_package_name(package_name)
    if not is_valid:
        return False, f"Tenant '{tenant_id}': {error}"
    
    # Validate logoPath (optional field)
    logo_path = tenant.get('logoPath', '')
    is_valid, error = validate_logo_path(logo_path)
    if not is_valid:
        return False, f"Tenant '{tenant_id}': {error}"
    
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

