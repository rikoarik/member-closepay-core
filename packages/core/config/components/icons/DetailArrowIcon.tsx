/**
 * DetailArrowIcon Component
 * SVG icon untuk detail button dengan arrow
 * Responsive untuk semua device termasuk EDC
 */
import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { getIconSize } from '../../utils/responsive';

interface DetailArrowIconProps {
  /**
   * Ukuran icon (default: 'small')
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * Warna icon (default: current text color)
   */
  color?: string;
}

export const DetailArrowIcon: React.FC<DetailArrowIconProps> = ({
  size = 'small',
  color = '#0A0A0A',
}) => {
  const iconSize = getIconSize(size);
  
  return (
    <Svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 14 14"
      fill="none"
    >
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.66667 13.3333C10.3486 13.3333 13.3333 10.3486 13.3333 6.66667C13.3333 2.98477 10.3486 0 6.66667 0C2.98477 0 0 2.98477 0 6.66667C0 10.3486 2.98477 13.3333 6.66667 13.3333ZM6.97978 4.31311C7.17504 4.11785 7.49162 4.11785 7.68689 4.31311L9.68689 6.31311C9.88215 6.50837 9.88215 6.82496 9.68689 7.02022L7.68689 9.02022C7.49162 9.21548 7.17504 9.21548 6.97978 9.02022C6.78452 8.82496 6.78452 8.50837 6.97978 8.31311L8.12623 7.16667H4C3.72386 7.16667 3.5 6.94281 3.5 6.66667C3.5 6.39052 3.72386 6.16667 4 6.16667H8.12623L6.97978 5.02022C6.78452 4.82496 6.78452 4.50838 6.97978 4.31311Z"
        fill={color}
      />
    </Svg>
  );
};

