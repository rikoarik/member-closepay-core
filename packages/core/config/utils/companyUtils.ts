/**
 * Core Config - Company Utility Functions
 * Utility functions for company identifier management (companyId, companyInitial)
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Convert companyInitial (uppercase) to companyId (kebab-case)
 * 
 * @example
 * toCompanyId('TKIFTP') => 'tki-ftp'
 * toCompanyId('MB') => 'mb'
 * toCompanyId('P2L') => 'p2l'
 */
export function toCompanyId(companyInitial: string): string {
  if (!companyInitial) {
    return '';
  }

  // Convert to lowercase
  let result = companyInitial.toLowerCase();

  // Handle common patterns:
  // - If all uppercase, split on word boundaries (e.g., TKIFTP -> tki-ftp)
  // - If contains numbers, preserve numbers (e.g., P2L -> p2l)
  
  // Simple approach: split on capital letters (if original was camelCase/mixed)
  // But if already uppercase, just lowercase it and add dashes before numbers/capital transitions
  
  // For uppercase strings, try to detect word boundaries
  // This is a simple heuristic - assumes uppercase means separate words
  if (companyInitial === companyInitial.toUpperCase()) {
    // Split on number boundaries and consecutive caps
    result = companyInitial
      .replace(/([A-Z])([A-Z]+)/g, (_, first, rest) => {
        // If 2+ consecutive caps, keep first, split rest
        return first + '-' + rest.slice(0, -1).split('').join('-') + rest.slice(-1);
      })
      .replace(/([A-Z]+)([0-9])/g, '$1-$2')
      .replace(/([0-9])([A-Z]+)/g, '$1-$2')
      .toLowerCase();
    
    // Clean up multiple dashes
    result = result.replace(/--+/g, '-').replace(/^-|-$/g, '');
  }

  return result;
}

/**
 * Convert companyId (kebab-case) to companyInitial (uppercase)
 * 
 * @example
 * toCompanyInitial('tki-ftp') => 'TKIFTP'
 * toCompanyInitial('member-base') => 'MEMBERBASE'
 * toCompanyInitial('p2l') => 'P2L'
 */
export function toCompanyInitial(companyId: string): string {
  if (!companyId) {
    return '';
  }

  // Remove dashes/underscores and convert to uppercase
  return companyId
    .replace(/[-_]/g, '')
    .toUpperCase();
}

/**
 * Validate companyInitial format
 * 
 * Rules:
 * - Must be 1-20 characters
 * - Must contain only alphanumeric characters and underscores
 * - Must start with a letter
 * 
 * @example
 * validateCompanyInitial('TKIFTP') => { isValid: true }
 * validateCompanyInitial('MB') => { isValid: true }
 * validateCompanyInitial('P2L') => { isValid: true }
 * validateCompanyInitial('123ABC') => { isValid: false, error: '...' }
 */
export function validateCompanyInitial(companyInitial: string): ValidationResult {
  if (!companyInitial) {
    return {
      isValid: false,
      error: 'Company initial is required. Expected: Uppercase alphanumeric string (e.g., "TKIFTP", "MB", "P2L")',
    };
  }

  if (typeof companyInitial !== 'string') {
    return {
      isValid: false,
      error: 'Company initial must be a string. Expected: Uppercase alphanumeric string (e.g., "TKIFTP", "MB", "P2L")',
    };
  }

  const trimmed = companyInitial.trim();
  
  if (trimmed.length === 0) {
    return {
      isValid: false,
      error: 'Company initial cannot be empty. Expected: Uppercase alphanumeric string (e.g., "TKIFTP", "MB", "P2L")',
    };
  }

  if (trimmed.length > 20) {
    return {
      isValid: false,
      error: `Company initial is too long (${trimmed.length} characters). Maximum length is 20 characters. Expected format: Uppercase alphanumeric string (e.g., "TKIFTP", "MB", "P2L")`,
    };
  }

  // Must contain only alphanumeric characters and underscores
  if (!/^[A-Z0-9_]+$/.test(trimmed)) {
    return {
      isValid: false,
      error: `Company initial contains invalid characters. Only uppercase letters, numbers, and underscores are allowed. Expected format: Uppercase alphanumeric string (e.g., "TKIFTP", "MB", "P2L"). Got: "${trimmed}"`,
    };
  }

  // Must start with a letter
  if (!/^[A-Z]/.test(trimmed)) {
    return {
      isValid: false,
      error: `Company initial must start with a letter. Expected format: Uppercase alphanumeric string starting with a letter (e.g., "TKIFTP", "MB", "P2L"). Got: "${trimmed}"`,
    };
  }

  return { isValid: true };
}

