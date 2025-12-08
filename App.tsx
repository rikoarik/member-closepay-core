/**
 * Merchant Closepay V2 App
 * Root component - loads merchant-base app
 * In a multi-tenant setup, this could dynamically load different apps based on tenant ID
 */
import MemberbaseApp from './apps/member-base';

// For now, we use merchant-base as the default app
// In the future, this could be dynamic based on tenant detection
export default MemberbaseApp;
