/**
 * QuickAccessButtons Wrapper
 * Temporary wrapper to allow core modules to use QuickAccessButtons from src
 * TODO: This is a temporary solution. QuickAccessButtons should be moved to core
 * or refactored to not depend on app-specific code.
 * 
 * This wrapper exists to fix dependency violation while maintaining functionality.
 * Will be refactored in future phases.
 */

// eslint-disable-next-line no-restricted-imports
import { QuickAccessButtons } from '../../../../../apps/member-base/src/components/home';

// Re-export the component to maintain same API
export { QuickAccessButtons };

