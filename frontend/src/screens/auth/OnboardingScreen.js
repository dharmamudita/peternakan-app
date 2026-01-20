/**
 * Onboarding Screen
 * Halaman pengenalan aplikasi dengan desain premium putih + coklat
 */

import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Dimensions,
    TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    useAnimatedScrollHandler,
    interpolate,
    Extrapolate,
    FadeInDown,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

const slides = [
    {
        id: '1',
        title: 'Kelola Peternakan',
        description: 'Pantau kesehatan, jadwal pakan, dan perkembangan hewan ternak Anda dengan mudah dalam satu aplikasi.',
        emoji: '🐄',
        badge: 'Manajemen Ternak',
        features: ['Mudah', 'Aman', 'Cepat'],
        gradient: ['#964b00', '#7c3f06'],
    },
    {
        id: '2',
        title: 'Jual Beli Online',
        description: 'Temukan dan jual berbagai produk peternakan dengan harga terbaik langsung dari peternak.',
        emoji: '🛒',
        badge: 'Marketplace',
        features: ['Terpercaya', 'Murah', 'Lengkap'],
        gradient: ['#7c3f06', '#5d3a1a'],
    },
    {
        id: '3',
        title: 'Belajar Beternak',
        description: 'Akses ribuan kursus dan artikel dari pakar untuk meningkatkan skill beternak Anda.',
        emoji: '📚',
        badge: 'Edukasi',
        features: ['Gratis', 'Berkualitas', 'Praktis'],
        gradient: ['#b87333', '#964b00'],
    },
];

const OnboardingScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef(null);
    const scrollX = useSharedValue(0);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollX.value = event.contentOffset.x;
        },
    });

    const onViewableItemsChanged = useRef(({ viewableItems }) => {
        if (viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index);
        }
    }).current;

    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 50,
    }).current;

    const handleNext = () => {
        if (currentIndex < slides.length - 1) {
            flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
        } else {
            navigation.replace('Login');
        }
    };

    const handleSkip = () => {
        navigation.replace('Login');
    };

    const renderSlide = ({ item, index }) => {
        return <OnboardingSlide item={item} index={index} scrollX={scrollX} />;
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Skip Button */}
            <Animated.View entering={FadeInDown.duration(500).delay(200)} style={styles.skipContainer}>
                <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                    <Text style={styles.skipText}>Lewati</Text>
                    <Ionicons name="arrow-forward" size={16} color="#964b00" />
                </TouchableOpacity>
            </Animated.View>

            {/* Slides */}
            <Animated.FlatList
                ref={flatListRef}
                data={slides}
                renderItem={renderSlide}
                keyExtractor={(item) => item.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
            />

            {/* Bottom Section */}
            <View style={[styles.bottomSection, { paddingBottom: insets.bottom + 20 }]}>
                {/* Pagination */}
                <View style={styles.pagination}>
                    {slides.map((_, index) => (
                        <PaginationDot key={index} index={index} scrollX={scrollX} />
                    ))}
                </View>

                {/* Next Button */}
                <TouchableOpacity style={styles.nextButton} onPress={handleNext} activeOpacity={0.9}>
                    <LinearGradient
                        colors={['#964b00', '#7c3f06']}
                        style={styles.nextButtonGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <Text style={styles.nextButtonText}>
                            {currentIndex === slides.length - 1 ? 'Mulai' : 'Lanjut'}
                        </Text>
                        <View style={styles.nextButtonIcon}>
                            <Ionicons name="arrow-forward" size={18} color="#964b00" />
                        </View>
                    </LinearGradient>
                </TouchableOpacity>

                {/* Login Link */}
                <View style={styles.loginLink}>
                    <Text style={styles.loginText}>Sudah punya akun? </Text>
                    <TouchableOpacity onPress={() => navigation.replace('Login')}>
                        <Text style={styles.loginLinkText}>Masuk</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const OnboardingSlide = ({ item, index, scrollX }) => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

    const animatedStyle = useAnimatedStyle(() => {
        const scale = interpolate(
            scrollX.value,
            inputRange,
            [0.8, 1, 0.8],
            Extrapolate.CLAMP
        );
        const opacity = interpolate(
            scrollX.value,
            inputRange,
            [0.5, 1, 0.5],
            Extrapolate.CLAMP
        );

        return { transform: [{ scale }], opacity };
    });

    return (
        <View style={styles.slide}>
            <Animated.View style={[styles.slideContent, animatedStyle]}>
                {/* Illustration Card */}
                <View style={styles.illustrationContainer}>
                    <LinearGradient
                        colors={item.gradient}
                        style={styles.illustrationGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <View style={styles.illustrationDecor1} />
                        <View style={styles.illustrationDecor2} />
                        <Text style={styles.emoji}>{item.emoji}</Text>
                    </LinearGradient>
                </View>

                {/* Badge */}
                <View style={styles.badgeContainer}>
                    <View style={styles.badge}>
                        <Ionicons name="leaf" size={14} color="#964b00" />
                        <Text style={styles.badgeText}>{item.badge}</Text>
                    </View>
                </View>

                {/* Title */}
                <Text style={styles.title}>{item.title}</Text>

                {/* Description */}
                <Text style={styles.description}>{item.description}</Text>

                {/* Feature Pills */}
                <View style={styles.featurePills}>
                    {item.features.map((feature, idx) => (
                        <View key={idx} style={styles.featurePill}>
                            <Ionicons
                                name={idx === 0 ? 'checkmark-circle' : idx === 1 ? 'shield-checkmark' : 'flash'}
                                size={14}
                                color="#964b00"
                            />
                            <Text style={styles.featurePillText}>{feature}</Text>
                        </View>
                    ))}
                </View>
            </Animated.View>
        </View>
    );
};

const PaginationDot = ({ index, scrollX }) => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

    const animatedStyle = useAnimatedStyle(() => {
        const dotWidth = interpolate(
            scrollX.value,
            inputRange,
            [8, 24, 8],
            Extrapolate.CLAMP
        );
        const opacity = interpolate(
            scrollX.value,
            inputRange,
            [0.4, 1, 0.4],
            Extrapolate.CLAMP
        );

        return { width: dotWidth, opacity };
    });

    return <Animated.View style={[styles.dot, animatedStyle]} />;
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    skipContainer: {
        position: 'absolute',
        top: 60,
        right: 20,
        zIndex: 10,
    },
    skipButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#faf8f5',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#f0ebe3',
    },
    skipText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#964b00',
    },
    slide: {
        width,
        paddingHorizontal: SIZES.padding,
        justifyContent: 'center',
    },
    slideContent: {
        alignItems: 'center',
    },
    illustrationContainer: {
        marginBottom: 32,
        ...SHADOWS.large,
    },
    illustrationGradient: {
        width: width * 0.55,
        height: width * 0.55,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    illustrationDecor1: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.1)',
        top: -20,
        right: -20,
    },
    illustrationDecor2: {
        position: 'absolute',
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255,255,255,0.08)',
        bottom: 20,
        left: 10,
    },
    emoji: {
        fontSize: 80,
    },
    badgeContainer: {
        marginBottom: 16,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#faf8f5',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#f0ebe3',
    },
    badgeText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#964b00',
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#111827',
        textAlign: 'center',
        marginBottom: 12,
        letterSpacing: -0.5,
    },
    description: {
        fontSize: 15,
        color: '#6b7280',
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    featurePills: {
        flexDirection: 'row',
        gap: 10,
    },
    featurePill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#faf8f5',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#f0ebe3',
    },
    featurePillText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#7c3f06',
    },
    bottomSection: {
        paddingHorizontal: SIZES.padding,
        paddingTop: 20,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 24,
    },
    dot: {
        height: 8,
        borderRadius: 4,
        backgroundColor: '#964b00',
    },
    nextButton: {
        marginBottom: 20,
        ...SHADOWS.medium,
    },
    nextButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 16,
        gap: 10,
    },
    nextButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#ffffff',
    },
    nextButtonIcon: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loginLink: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    loginText: {
        fontSize: 14,
        color: '#6b7280',
    },
    loginLinkText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#964b00',
    },
});

export default OnboardingScreen;
