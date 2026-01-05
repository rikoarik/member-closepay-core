/**
 * Withdraw Icon Component
 * Icon untuk tombol Pencairan
 */
import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

interface WithdrawIconProps {
  width?: number;
  height?: number;
  color?: string;
}

export const WithdrawIcon: React.FC<WithdrawIconProps> = ({
  width = 21,
  height = 20,
  color = '#FAFAFA',
}) => {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 21 20"
      fill="none">
      <Path
        d="M12.25 8.33317L19.25 1.6665M19.25 1.6665L14 1.6665M19.25 1.6665L19.25 6.6665"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.3438 1.6665C13.3438 1.32133 13.6376 1.0415 14 1.0415L19.25 1.0415C19.6124 1.0415 19.9063 1.32133 19.9063 1.6665L19.9063 6.6665C19.9063 7.01168 19.6124 7.2915 19.25 7.2915C18.8876 7.2915 18.5938 7.01168 18.5938 6.6665L18.5938 3.17539L12.714 8.77511C12.4578 9.01919 12.0422 9.01919 11.786 8.77511C11.5297 8.53103 11.5297 8.13531 11.786 7.89123L17.6657 2.2915L14 2.2915C13.6376 2.2915 13.3438 2.01168 13.3438 1.6665Z"
        fill={color}
      />
      <Path
        d="M10.5 1.66683C5.66751 1.66683 1.75 5.39779 1.75 10.0002C1.75 14.6025 5.66751 18.3335 10.5 18.3335C15.3325 18.3335 19.25 14.6025 19.25 10.0002C19.25 9.50116 19.204 9.0124 19.1157 8.53753C18.091 8.47178 17.2813 7.65937 17.2813 6.66683L17.2813 6.19348L13.6421 9.65932C12.8733 10.3916 11.6267 10.3916 10.8579 9.65932C10.089 8.92709 10.089 7.7399 10.8579 7.00767L14.497 3.54183L14 3.54183C12.9578 3.54183 12.1048 2.77063 12.0358 1.79476C11.5372 1.71069 11.024 1.66683 10.5 1.66683Z"
        fill={color}
      />
    </Svg>
  );
};

