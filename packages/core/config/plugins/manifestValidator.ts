/**
 * Plugin Manifest Validator
 * Validate plugin manifests for correctness
 */

import { PluginManifest } from './types';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

/**
 * Validate a plugin manifest
 */
export function validateManifest(manifest: any): ValidationResult {
  const errors: ValidationError[] = [];

  // Handle null/undefined manifest
  if (!manifest || typeof manifest !== 'object') {
    errors.push({ field: 'manifest', message: 'Manifest is required and must be an object' });
    return { valid: false, errors };
  }

  // Required fields
  if (!manifest.id || typeof manifest.id !== 'string') {
    errors.push({ field: 'id', message: 'Plugin ID is required and must be a string' });
  }

  if (!manifest.name || typeof manifest.name !== 'string') {
    errors.push({ field: 'name', message: 'Plugin name is required and must be a string' });
  }

  if (!manifest.version || typeof manifest.version !== 'string') {
    errors.push({ field: 'version', message: 'Plugin version is required and must be a string' });
  } else if (!isValidSemanticVersion(manifest.version)) {
    errors.push({ field: 'version', message: 'Plugin version must be valid semantic version (e.g., 1.0.0)' });
  }

  if (!manifest.type || !['core-plugin', 'segment-plugin', 'company-plugin'].includes(manifest.type)) {
    errors.push({ field: 'type', message: 'Plugin type must be core-plugin, segment-plugin, or company-plugin' });
  }

  if (!manifest.description || typeof manifest.description !== 'string') {
    errors.push({ field: 'description', message: 'Plugin description is required and must be a string' });
  }

  // Dependencies must be an array
  if (!Array.isArray(manifest.dependencies)) {
    errors.push({ field: 'dependencies', message: 'Dependencies must be an array' });
  }

  // Exports must be an object
  if (!manifest.exports || typeof manifest.exports !== 'object') {
    errors.push({ field: 'exports', message: 'Exports must be an object' });
  }

  // Permissions must be an array
  if (!Array.isArray(manifest.permissions)) {
    errors.push({ field: 'permissions', message: 'Permissions must be an array' });
  }

  // Validate routes if present
  if (manifest.routes) {
    if (!Array.isArray(manifest.routes)) {
      errors.push({ field: 'routes', message: 'Routes must be an array' });
    } else {
      manifest.routes.forEach((route: any, index: number) => {
        if (!route.name) {
          errors.push({ field: `routes[${index}].name`, message: 'Route name is required' });
        }
        if (!route.path) {
          errors.push({ field: `routes[${index}].path`, message: 'Route path is required' });
        }
        if (!route.component) {
          errors.push({ field: `routes[${index}].component`, message: 'Route component is required' });
        }
        if (!Array.isArray(route.permissions)) {
          errors.push({ field: `routes[${index}].permissions`, message: 'Route permissions must be an array' });
        }
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Check if version string is valid semantic version
 */
function isValidSemanticVersion(version: string): boolean {
  const semverRegex = /^\d+\.\d+\.\d+(-[\w.]+)?(\+[\w.]+)?$/;
  return semverRegex.test(version);
}

/**
 * Validate and throw if invalid
 */
export function validateManifestOrThrow(manifest: any): asserts manifest is PluginManifest {
  const result = validateManifest(manifest);
  if (!result.valid) {
    const errorMessages = result.errors.map(e => `${e.field}: ${e.message}`).join('\n');
    throw new Error(`Invalid plugin manifest:\n${errorMessages}`);
  }
}
