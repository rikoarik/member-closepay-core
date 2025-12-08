/**
 * Base Navigator
 * Base navigation wrapper that uses AuthNavigator
 * Apps can extend this with app-specific screens via AuthNavigator props
 */

import React from 'react';
import { AuthNavigator } from './AuthNavigator';

/**
 * Base Navigator Component
 * Default implementation that uses AuthNavigator without app-specific screens
 * Apps should create their own navigator that passes appScreens prop to AuthNavigator
 */
export const BaseNavigator: React.FC = () => {
  return <AuthNavigator />;
};

