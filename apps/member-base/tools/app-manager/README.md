# App Manager - Member Base App

This is the app management tool for **Member Base App** app.

## Quick Start

**Windows:**
```batch
tools\app-manager\manage.bat status
tools\app-manager\manage.bat sync member-base
```

**Linux/Mac:**
```bash
tools/app-manager/manage.sh status
tools/app-manager/manage.sh sync member-base
```

## Usage

This app manager is configured specifically for this app. The `tenants.json` contains only this app's configuration.


A Python desktop GUI application to manage multi-tenant and plugin configuration for Closepay core.

## Requirements

- Python 3.x
- Standard library only (Tkinter is included with Python)

## Files

- `main.py` - GUI application entry point
- `app_manager.py` - CLI management tool (comprehensive)
- `config_io.py` - JSON file loading/saving utilities
- `ui_components.py` - Reusable UI component classes
- `repo_generator.py` - Repository generation utilities
- `tenants.json` - Tenant configuration file (must exist)
- `plugins.json` - Plugin registry file (must exist)

## Usage

1. Ensure `tenants.json` and `plugins.json` exist in the same directory as `main.py`
2. Run the application using one of these methods:

   **Windows (Easiest):**
   ```batch
   run.bat
   ```
   Or double-click `run.bat` in Windows Explorer.

   **Linux/Mac:**
   ```bash
   chmod +x run.sh
   ./run.sh
   ```

   **Manual (All Platforms):**
   ```bash
   python main.py
   ```

## Features

- **View and Edit Tenants**: Select a tenant from the list to view and edit its properties
- **Enable/Disable Plugins**: Use checkboxes to enable or disable plugins for each tenant
- **Add Tenant**: Create a new tenant (duplicates DEFAULT tenant as base template)
- **Delete Tenant**: Remove a tenant (DEFAULT tenant cannot be deleted)
- **Generate Repo**: Generate a new app repository from template based on tenant configuration
- **Save Changes**: Save all changes to `tenants.json`
- **Reload**: Reload configuration from disk (with confirmation if unsaved changes exist)

## Generate Repository

The **Generate Repo** button creates a new app directory in `apps/{tenant-id}/` based on the `merchant-base` template. This feature:

1. **Copies Template**: Copies the entire `apps/merchant-base/` directory structure
2. **Updates Code**: Automatically updates `index.tsx` with tenant-specific values:
   - Replaces `merchant-base` with your tenant ID
   - Updates function names to match tenant ID (PascalCase)
   - Uncomments config import and usage
3. **Generates Config**: Creates `config/app.config.ts` with:
   - Tenant ID and name
   - Enabled features from tenant configuration
   - Menu configuration based on enabled features
   - Theme colors from tenant configuration
   - Segment ID based on tenant role
4. **Updates README**: Updates README.md with tenant-specific information

### Usage

1. Select a tenant from the list (cannot be DEFAULT)
2. Click **Generate Repo** button
3. If repository already exists, you'll be prompted to overwrite it
4. Repository will be created at `apps/{tenant-id}/`

### Generated Structure

```
apps/{tenant-id}/
├── config/
│   └── app.config.ts          # Auto-generated from tenant config
├── index.tsx                  # Updated with tenant ID
├── src/                       # Copied from template
│   ├── components/
│   └── screens/
└── README.md                  # Updated with tenant info
```

## Configuration Format

### tenants.json

```json
{
  "DEFAULT": {
    "id": "DEFAULT",
    "name": "Closepay Default",
    "role": "merchant",
    "enabledFeatures": ["balance", "payment"],
    "theme": {
      "primary": "#0066CC",
      "primaryDark": "#0052A3",
      "primaryLight": "#E6F2FF"
    },
    "homeVariant": "analytics"
  }
}
```

### plugins.json

```json
{
  "balance": {
    "id": "balance",
    "label": "Balance Ledger",
    "description": "Core ledger plugin"
  }
}
```

## Validation

The application validates:
- Tenant ID must be unique and non-empty
- Tenant name must be non-empty
- Role must be one of: `merchant`, `member`, `admin`
- Theme colors must be valid hex format (#RRGGBB)
- Enabled features must only contain plugin IDs that exist in `plugins.json`

## CLI Management Tool

The `app_manager.py` provides a comprehensive CLI for managing all aspects of tenants and apps.

### Quick Start

**Windows:**
```batch
manage.bat list tenants
manage.bat create-tenant my-tenant "My Tenant" --role merchant --features balance payment
manage.bat generate my-tenant
manage.bat sync my-tenant
```

**Linux/Mac:**
```bash
chmod +x manage.sh
./manage.sh list tenants
./manage.sh create-tenant my-tenant "My Tenant" --role merchant --features balance payment
./manage.sh generate my-tenant
./manage.sh sync my-tenant
```

### Usage

```bash
python app_manager.py <command> [options]
```

### Commands

#### List
```bash
# List all tenants
python app_manager.py list tenants

# List all generated apps
python app_manager.py list apps

# List both
python app_manager.py list all
```

#### Create Tenant
```bash
python app_manager.py create-tenant <tenant_id> <name> [options]

# Example
python app_manager.py create-tenant my-tenant "My Tenant" --role merchant --features balance payment
```

#### Update Tenant
```bash
python app_manager.py update-tenant <tenant_id> [options]

# Examples
python app_manager.py update-tenant my-tenant --name "New Name"
python app_manager.py update-tenant my-tenant --features balance payment catalog
python app_manager.py update-tenant my-tenant --primary-color "#FF0000"
```

#### Delete Tenant
```bash
python app_manager.py delete-tenant <tenant_id> [--delete-app]

# Example (also deletes app directory)
python app_manager.py delete-tenant my-tenant --delete-app
```

#### Generate App
```bash
python app_manager.py generate <tenant_id> [--overwrite]

# Example
python app_manager.py generate my-tenant --overwrite
```

#### Sync Config
```bash
# Sync config for specific tenant
python app_manager.py sync <tenant_id>

# Sync all configs
python app_manager.py sync
```

#### Validate
```bash
python app_manager.py validate
```

#### Status
```bash
python app_manager.py status
```

### Example Workflow

```bash
# 1. Create a new tenant
python app_manager.py create-tenant company-abc "Company ABC" --role merchant --features balance payment

# 2. Generate app repository
python app_manager.py generate company-abc

# 3. Update tenant config
python app_manager.py update-tenant company-abc --features balance payment catalog

# 4. Sync config to app
python app_manager.py sync company-abc

# 5. Check status
python app_manager.py status

# 6. Validate everything
python app_manager.py validate
```

## Error Handling

- Missing files: Application will exit with an error message
- Invalid JSON: Application will exit with an error message
- Validation errors: Will show error dialog when saving
- Unsaved changes: Will prompt for confirmation before reloading or exiting


