/**
 * ScreenHeader Component
 * Reusable header component dengan back button dan title di left
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft2 } from 'iconsax-react-nativejs';
import {
  getIconSize,
  scale,
  moderateVerticalScale,
  getHorizontalPadding,
  getResponsiveFontSize,
  FontFamily,
  getMinTouchTarget,
} from '@core/config';
import { useTheme } from '@core/theme';

export interface ScreenHeaderProps {
  /**
   * Title text untuk header
   */
  title: string;
  
  /**
   * Custom back button handler
   * Jika tidak diisi, akan menggunakan navigation.goBack()
   */
  onBackPress?: () => void;
  
  /**
   * Custom right component (optional)
   * Bisa digunakan untuk menambahkan action button di kanan
   */
  rightComponent?: React.ReactNode;
  
  /**
   * Show border bottom (default: false)
   */
  showBorder?: boolean;
  
  /**
   * Custom padding horizontal (default: dari getHorizontalPadding())
   */
  paddingHorizontal?: number;
  
  /**
   * Custom padding vertical (default: moderateVerticalScale(14))
   */
  paddingVertical?: number;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  onBackPress,
  rightComponent,
  showBorder = false,
  paddingHorizontal,
  paddingVertical,
}) => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const minTouchTarget = getMinTouchTarget();
  const horizontalPadding = paddingHorizontal ?? getHorizontalPadding();
  const verticalPadding = paddingVertical ?? moderateVerticalScale(14);

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  return (
    <View
      style={[
        styles.header,
        {
          paddingHorizontal: horizontalPadding,
          paddingVertical: verticalPadding,
           borderBottomColor: showBorder ? colors.border : 'transparent',
           borderBottomWidth: showBorder ? StyleSheet.hairlineWidth : 0,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.backButton}
        onPress={handleBackPress}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <ArrowLeft2
          size={getIconSize('medium')}
          color={colors.text}
          variant="Linear"
        />
      </TouchableOpacity>
      
      <Text
        style={[
          styles.title,
          {
            color: colors.text,
          },
        ]}
        
      >
        {title}
      </Text>
      
      {rightComponent ? (
        <View style={styles.rightComponent}>
          {rightComponent}
        </View>
      ) : (
        null
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  backButton: {
    padding: scale(8),
    minWidth: getMinTouchTarget(),
    minHeight: getMinTouchTarget(),
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: getResponsiveFontSize('xlarge'),
    fontFamily: FontFamily.monasans.bold,
    flex: 1,
  },
  rightComponent: {
    minWidth: getIconSize('medium'),
    alignItems: 'flex-end',
  },
});

