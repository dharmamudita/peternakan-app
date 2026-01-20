/**
 * Onboarding Screen - Tanpa tumpukan, tampilan terintegrasi
 */

import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    useAnimatedScrollHandler,
    interpolate,
    Extrapolate,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { SIZES, SHADOWS } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

const slides = [
    {
        id: '1',
        title: 'Kelola Peternakan',
        description: 'Pantau kesehatan, jadwal pakan, dan perkembangan hewan ternak Anda dengan mudah.',
        icon: 'paw',
        color: '#964b00',
        features: ['Pencatatan Lengkap', 'Jadwal Otomatis', 'Laporan Detail'],
    },
    {
        id: '2',
        title: 'Jual Beli Online',
        description: 'Temukan dan jual berbagai produk peternakan dengan harga terbaik.',
        icon: 'cart',
        color: '#7c3f06',
        features: ['Marketplace Aman', 'Transaksi Mudah', 'Pengiriman Cepat'],
    },
    {
        id: '3',
        title: 'Belajar Beternak',
        description: 'Akses kursus dan artikel dari pakar untuk meningkatkan skill beternak.',
        icon: 'school',
        color: '#b87333',
        features: ['Video Kursus', 'Artikel Gratis', 'Konsultasi Ahli'],
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
        <View style={styles.container}>
            {/* Background gradient yang terintegrasi */}
            <LinearGradient
                colors={['#ffffff', '#faf8f5', '#f5f0e8']}
                style={styles.backgroundGradient}
            />

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
                contentContainerStyle={{ paddingTop: insets.top + 80 }}
            />

            {/* Skip Button - posisi lebih rendah */}
            <View style={[styles.skipContainer, { top: insets.top + 16 }]}>
                <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                    <Text style={styles.skipText}>Lewati</Text>
                    <Ionicons name="arrow-forward" size={14} color="#964b00" />
                </TouchableOpacity>
            </View>

            {/* Bottom Section */}
            <View style={[styles.bottomSection, { paddingBottom: insets.bottom + 24 }]}>
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
                            {currentIndex === slides.length - 1 ? 'Mulai Sekarang' : 'Lanjut'}
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
        const scale = interpolate(scrollX.value, inputRange, [0.9, 1, 0.9], Extrapolate.CLAMP);
        const opacity = interpolate(scrollX.value, inputRange, [0.5, 1, 0.5], Extrapolate.CLAMP);
        return { transform: [{ scale }], opacity };
    });

    return (
        <View style={styles.slide}>
            <Animated.View style={[styles.slideContent, animatedStyle]}>
                {/* Icon - terintegrasi dengan background */}
                <View style={styles.iconSection}>
                    <View style={[styles.iconBackground, { backgroundColor: item.color + '10' }]}>
                        <View style={[styles.iconCircle, { backgroundColor: item.color + '20' }]}>
                            <View style={[styles.iconInner, { backgroundColor: item.color }]}>
                                <Ionicons name={item.icon} size={40} color="#ffffff" />
                            </View>
                        </View>
                    </View>
                </View>

                {/* Title */}
                <Text style={styles.title}>{item.title}</Text>

                {/* Description */}
                <Text style={styles.description}>{item.description}</Text>

                {/* Feature List */}
                <View style={styles.featureList}>
                    {item.features.map((feature, idx) => (
                        <View key={idx} style={styles.featureItem}>
                            <View style={[styles.featureCheck, { backgroundColor: item.color + '15' }]}>
                                <Ionicons name="checkmark" size={14} color={item.color} />
                            </View>
                            <Text style={styles.featureText}>{feature}</Text>
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
        const dotWidth = interpolate(scrollX.value, inputRange, [8, 28, 8], Extrapolate.CLAMP);
        const opacity = interpolate(scrollX.value, inputRange, [0.3, 1, 0.3], Extrapolate.CLAMP);
        return { width: dotWidth, opacity };
    });

    return <Animated.View style={[styles.dot, animatedStyle]} />;
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    backgroundGradient: {
        ...StyleSheet.absoluteFillObject,
    },
    skipContainer: {
        position: 'absolute',
        right: 20,
        zIndex: 10,
    },
    skipButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: '#ffffff',
        borderRadius: 24,
        ...SHADOWS.small,
    },
    skipText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#964b00',
    },
    slide: {
        width,
        paddingHorizontal: SIZES.padding,
    },
    slideContent: {
        alignItems: 'center',
    },
    iconSection: {
        marginBottom: 40,
    },
    iconBackground: {
        width: 180,
        height: 180,
        borderRadius: 90,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconCircle: {
        width: 140,
        height: 140,
        borderRadius: 70,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconInner: {
        width: 90,
        height: 90,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.medium,
    },
    title: {
        fontSize: 30,
        fontWeight: '800',
        color: '#111827',
        textAlign: 'center',
        marginBottom: 16,
        letterSpacing: -0.5,
    },
    description: {
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
        lineHeight: 26,
        paddingHorizontal: 16,
        marginBottom: 36,
    },
    featureList: {
        gap: 14,
        width: '100%',
        paddingHorizontal: 40,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    featureCheck: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    featureText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#374151',
    },
    bottomSection: {
        paddingHorizontal: SIZES.padding,
        backgroundColor: '#ffffff',
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 28,
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
        paddingVertical: 18,
        borderRadius: 16,
        gap: 10,
    },
    nextButtonText: {
        fontSize: 17,
        fontWeight: '700',
        color: '#ffffff',
    },
    nextButtonIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loginLink: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    loginText: {
        fontSize: 15,
        color: '#6b7280',
    },
    loginLinkText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#964b00',
    },
});

export default OnboardingScreen;
