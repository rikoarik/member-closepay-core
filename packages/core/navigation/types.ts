/**
 * Navigation Types
 * Type definitions for navigation system
 */

import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

/**
 * Root navigation param list
 * Define all possible routes here
 */
export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  Home: undefined;
  Onboarding: undefined;
  Profile: undefined;
  EditProfile: undefined;
  LanguageSelection: undefined;
  QuickMenuSettings: undefined;
  ThemeSettings: undefined;
  NewsDetail: { newsId?: string; news?: any };
  Notifications: undefined;
  // Plugin routes will be added dynamically
  [key: string]: any;
};

/**
 * Navigation prop type helper
 */
export type NavigationProp<T extends keyof RootStackParamList> = NativeStackNavigationProp<
  RootStackParamList,
  T
>;
