/**
 * Onboarding Screen
 * Screen onboarding dengan slide animasi
 */

import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    FlatList,
    TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    interpolate,
    Extrapolation,
    FadeIn,
    SlideInRight,
} from 'react-native-reanimated';
import { COLORS, GRADIENTS, SIZES, SHADOWS } from '../../constants/theme';
import { Button } from '../../components/common';

const { width, height } = Dimensions.get('window');

const slides = [
    {
        id: '1',
        emoji: '🐄',
        title: 'Kelola Peternakan',
        description: 'Manajemen hewan ternak dengan mudah. Lacak kesehatan, jadwal makan, dan perkembangan hewan Anda.',
        color: COLORS.primary,
    },
    {
        id: '2',
        emoji: '🛒',
        title: 'Jual Beli Online',
        description: 'Marketplace untuk membeli dan menjual produk peternakan dengan aman dan terpercaya.',
        color: COLORS.accent,
    },
    {
        id: '3',
        emoji: '📚',
        title: 'Belajar & Berkembang',
        description: 'Akses materi edukasi dan kursus pelatihan untuk meningkatkan keahlian beternak Anda.',
        color: COLORS.success,
    },
];

const OnboardingScreen = ({ navigation }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef(null);
    const scrollX = useSharedValue(0);

    const handleScroll = (event) => {
        scrollX.value = event.nativeEvent.contentOffset.x;
        const index = Math.round(event.nativeEvent.contentOffset.x / width);
        setCurrentIndex(index);
    };

    const goToNext = () => {
        if (currentIndex < slides.length - 1) {
            flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
        } else {
            navigation.replace('Login');
        }
    };

    const goToLogin = () => {
        navigation.replace('Login');
    };

    const renderSlide = ({ item, index }) => (
        <SlideItem item={item} index={index} scrollX={scrollX} />
    );

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={GRADIENTS.light}
                style={StyleSheet.absoluteFill}
            />

            {/* Skip Button */}
            <TouchableOpacity style={styles.skipButton} onPress={goToLogin}>
                <Text style={styles.skipText}>Lewati</Text>
            </TouchableOpacity>

            {/* Slides */}
            <FlatList
                ref={flatListRef}
                data={slides}
                renderItem={renderSlide}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                keyExtractor={(item) => item.id}
                scrollEventThrottle={16}
            />

            {/* Pagination */}
            <View style={styles.pagination}>
                {slides.map((_, index) => (
                    <PaginationDot key={index} index={index} scrollX={scrollX} />
                ))}
            </View>

            {/* Button */}
            <View style={styles.buttonContainer}>
                <Button
                    title={currentIndex === slides.length - 1 ? 'Mulai Sekarang' : 'Lanjut'}
                    onPress={goToNext}
                    size="large"
                    fullWidth
                />
            </View>
        </View>
    );
};

const SlideItem = ({ item, index, scrollX }) => {
    const animatedStyle = useAnimatedStyle(() => {
        const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

        const scale = interpolate(
            scrollX.value,
            inputRange,
            [0.8, 1, 0.8],
            Extrapolation.CLAMP
        );

        const opacity = interpolate(
            scrollX.value,
            inputRange,
            [0.5, 1, 0.5],
            Extrapolation.CLAMP
        );

        const translateY = interpolate(
            scrollX.value,
            inputRange,
            [50, 0, 50],
            Extrapolation.CLAMP
        );

        return {
            transform: [{ scale }, { translateY }],
            opacity,
        };
    });

    return (
        <View style={styles.slide}>
            <Animated.View style={[styles.slideContent, animatedStyle]}>
                {/* Emoji Container */}
                <View style={[styles.emojiContainer, { backgroundColor: item.color + '20' }]}>
                    <Text style={styles.emoji}>{item.emoji}</Text>
                </View>

                {/* Title */}
                <Text style={styles.title}>{item.title}</Text>

                {/* Description */}
                <Text style={styles.description}>{item.description}</Text>
            </Animated.View>
        </View>
    );
};

const PaginationDot = ({ index, scrollX }) => {
    const animatedStyle = useAnimatedStyle(() => {
        const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

        const dotWidth = interpolate(
            scrollX.value,
            inputRange,
            [8, 24, 8],
            Extrapolation.CLAMP
        );

        const opacity = interpolate(
            scrollX.value,
            inputRange,
            [0.4, 1, 0.4],
            Extrapolation.CLAMP
        );

        return {
            width: dotWidth,
            opacity,
        };
    });

    return <Animated.View style={[styles.dot, animatedStyle]} />;
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    skipButton: {
        position: 'absolute',
        top: 60,
        right: 24,
        zIndex: 10,
        padding: 8,
    },
    skipText: {
        fontSize: SIZES.body,
        color: COLORS.textLight,
        fontWeight: '600',
    },
    slide: {
        width,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: SIZES.paddingLarge,
    },
    slideContent: {
        alignItems: 'center',
        paddingTop: 100,
    },
    emojiContainer: {
        width: 160,
        height: 160,
        borderRadius: 80,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
        ...SHADOWS.large,
    },
    emoji: {
        fontSize: 80,
    },
    title: {
        fontSize: SIZES.h1,
        fontWeight: '800',
        color: COLORS.text,
        textAlign: 'center',
        marginBottom: 16,
    },
    description: {
        fontSize: SIZES.body,
        color: COLORS.textLight,
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 20,
    },
    pagination: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 32,
    },
    dot: {
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.primary,
    },
    buttonContainer: {
        paddingHorizontal: SIZES.paddingLarge,
        paddingBottom: 48,
    },
});

export default OnboardingScreen;
