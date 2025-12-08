/**
 * ErrorIcon Component
 * SVG icon untuk error/warning dengan design modern
 * Responsive untuk semua device termasuk EDC
 */
import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';
import { getIconSize } from '../../utils/responsive';

interface ErrorIconProps {
  /**
   * Ukuran icon (default: 'large')
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * Warna icon (default: '#EF4444')
   */
  color?: string;
}

export const ErrorIcon: React.FC<ErrorIconProps> = ({
  size = 'large',
  color = '#EF4444',
}) => {
  const iconSize = getIconSize(size);

  return (
    <Svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
      {/* Outer circle with background */}
      <Circle cx="12" cy="12" r="11" fill={color} opacity="0.1" />
      {/* Main circle */}
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none" />
      {/* X mark - diagonal lines */}
      <Path
        d="M9 9L15 15M15 9L9 15"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

