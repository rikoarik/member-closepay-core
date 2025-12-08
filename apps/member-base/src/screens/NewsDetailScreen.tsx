/**
 * NewsDetailScreen
 * Screen untuk menampilkan detail berita
 */
import React from 'react';
import { View, Text, ScrollView, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp } from '@react-navigation/native';
import {
    scale,
    moderateVerticalScale,
    getHorizontalPadding,
    getResponsiveFontSize,
    FontFamily,
    ScreenHeader,
} from '@core/config';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import type { RootStackParamList } from '@core/navigation';
import type { News } from '../components/home';

// Extend RootStackParamList for app-specific route params
type AppRootStackParamList = RootStackParamList & {
    NewsDetail: { news: News };
};

type NewsDetailScreenRouteProp = RouteProp<AppRootStackParamList, 'NewsDetail'>;

export const NewsDetailScreen = () => {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const route = useRoute<NewsDetailScreenRouteProp>();
    const { news } = route.params;
    const horizontalPadding = getHorizontalPadding();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            {/* Header */}
            <ScreenHeader
                title={t('news.detailTitle')}
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Hero Image */}
                <Image
                    source={{ uri: news.imageUrl || 'https://picsum.photos/400/300' }}
                    style={styles.heroImage}
                    resizeMode="cover"
                />

                <View style={[styles.content, { paddingHorizontal: horizontalPadding }]}>
                    {/* Title Section */}
                    <Text style={[styles.title, { color: colors.text }]}>
                        {news.title}
                    </Text>

                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                        Kue ulang tahun Custom
                    </Text>

                    <Text style={[styles.date, { color: colors.textTertiary || colors.textSecondary }]}>
                        {news.date}
                    </Text>

                    {/* Body Text */}
                    <Text style={[styles.bodyText, { color: colors.text }]}>
                        Bolu ini mempunyai rasa manis, gurih, dengan paduan rasa pisang yang legit. Produk ini dapat kadaluwarsa <Text style={{ fontFamily: FontFamily.monasans.bold }}>6 hari setelah tanggal produksi</Text>
                        {'\n\n'}
                        Bolu ini mempunyai rasa manis, gurih, dengan paduan rasa pisang yang legit. Produk ini dapat kadaluwarsa <Text style={{ fontFamily: FontFamily.monasans.bold }}>6 hari setelah tanggal produksi</Text> Bolu ini mempunyai rasa manis, gurih, dengan paduan rasa pisang yang legit.
                        {'\n\n'}
                        Produk ini dapat kadaluwarsa <Text style={{ fontFamily: FontFamily.monasans.bold }}>6 hari setelah tanggal produksi</Text>
                        {'\n'}
                        Bolu ini mempunyai rasa manis, gurih, dengan paduan rasa pisang yang legit.
                        {'\n\n'}
                        Produk ini dapat kadaluwarsa <Text style={{ fontFamily: FontFamily.monasans.bold }}>6 hari setelah tanggal produksi</Text> Bolu ini mempunyai rasa manis, gurih, dengan paduan rasa pisang yang legit.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: moderateVerticalScale(24),
    },
    heroImage: {
        width: '100%',
        height: scale(250),
        marginBottom: moderateVerticalScale(24),
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: getResponsiveFontSize('xlarge'),
        fontFamily: FontFamily.monasans.bold,
        marginBottom: moderateVerticalScale(8),
        lineHeight: getResponsiveFontSize('xlarge') * 1.3,
    },
    subtitle: {
        fontSize: getResponsiveFontSize('medium'),
        fontFamily: FontFamily.monasans.medium,
        marginBottom: moderateVerticalScale(4),
    },
    date: {
        fontSize: getResponsiveFontSize('small'),
        fontFamily: FontFamily.monasans.regular,
        marginBottom: moderateVerticalScale(24),
    },
    bodyText: {
        fontSize: getResponsiveFontSize('medium'),
        fontFamily: FontFamily.monasans.regular,
        lineHeight: getResponsiveFontSize('medium') * 1.6,
    },
});
