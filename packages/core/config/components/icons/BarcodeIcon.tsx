/**
 * BarcodeIcon Component
 * SVG icon untuk barcode/scan
 * Responsive untuk semua device termasuk EDC
 */
import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { getIconSize } from '../../utils/responsive';

interface BarcodeIconProps {
  /**
   * Ukuran icon (default: 'medium')
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * Warna icon (default: current text color)
   */
  color?: string;
}

export const BarcodeIcon: React.FC<BarcodeIconProps> = ({
  size = 'medium',
  color = '#6B7280',
}) => {
  const iconSize = getIconSize(size);
  
  return (
    <Svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 24 24"
      fill="none"
    >
      <Path
        d="M2 6H4V18H2V6ZM6 6H7V18H6V6ZM9 6H10V18H9V6ZM12 6H14V18H12V6ZM16 6H17V18H16V6ZM19 6H21V18H19V6Z"
        fill={color}
      />
    </Svg>
  );
};

