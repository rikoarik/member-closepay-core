/**
 * Types untuk OnboardingScreen
 */
export type OnboardingStep = 'notifications' | 'camera' | 'theme' | 'location' | 'language';

export interface OnboardingScreenProps {
  onComplete: () => void;
}

