/**
 * FilterIcon Component
 * SVG icon untuk filter/search
 * Responsive untuk semua device termasuk EDC
 */
import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { getIconSize } from '../../utils/responsive';

interface FilterIconProps {
  /**
   * Ukuran icon (default: 'medium')
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * Warna icon (default: current text color)
   */
  color?: string;
}

export const FilterIcon: React.FC<FilterIconProps> = ({
  size = 'medium',
  color = '#6B7280',
}) => {
  const iconSize = getIconSize(size);
  
  return (
    <Svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 20 20"
      fill="none">
      <Path
        d="M2.5 5H17.5M5 10H15M7.5 15H12.5"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

