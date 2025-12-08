/**
 * MapView Component
 * Komponen untuk menampilkan map dengan location pin di phone mockup
 */
import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { SvgXml } from 'react-native-svg';
import { scale } from '../../../utils/responsive';
import { getThemedMapSvg } from '../../onboarding/assets';
import type { ScreenContentStyles } from '../styles';

interface MapViewProps {
  colors: {
    error: string;
    surfaceSecondary: string;
  };
  isDark: boolean;
  styles: ScreenContentStyles;
}

export const MapView: React.FC<MapViewProps> = ({ colors, isDark, styles: screenStyles }) => {
  return (
    <View style={[screenStyles.mapScreen, { backgroundColor: colors.surfaceSecondary }]}>
      <View style={screenStyles.mapContent}>
        <SvgXml
          xml={getThemedMapSvg(isDark, { surface: colors.surfaceSecondary, error: colors.error })}
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMin meet"
        />
        {/* Location Pin Icon - Custom SVG */}
        <View style={screenStyles.mapPinContainer}>
          <Svg width={scale(28)} height={scale(30)} viewBox="0 0 24 30" style={screenStyles.mapPinSvg}>
            <Path
              d="M12 0C7.58 0 4 3.58 4 8c0 6.5 8 14 8 14s8-7.5 8-14c0-4.42-3.58-8-8-8zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"
              fill={colors.error}
            />
            <Path
              d="M12 2C8.69 2 6 4.69 6 8c0 5.25 6 12 6 12s6-6.75 6-12c0-3.31-2.69-6-6-6zm0 9c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"
              fill={colors.error}
            />
          </Svg>
        </View>
      </View>
    </View>
  );
};

