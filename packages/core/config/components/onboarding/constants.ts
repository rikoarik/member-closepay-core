/**
 * Constants untuk OnboardingScreen
 */
import type { OnboardingStep } from './types';

export const ONBOARDING_STEPS: OnboardingStep[] = [
  'notifications',
  'camera',
  'theme',
  'location',
  'language',
];

export const TOTAL_STEPS = ONBOARDING_STEPS.length;

