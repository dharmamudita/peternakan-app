/**
 * Welcome/Splash Screen
 * Screen pertama dengan animasi menarik
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
    withSequence,
    withDelay,
    Easing,
    runOnJS,
} from 'react-native-reanimated';
import { COLORS, GRADIENTS, SIZES } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

const WelcomeScreen = ({ navigation }) => {
    const logoScale = useSharedValue(0);
    const logoOpacity = useSharedValue(0);
    const titleY = useSharedValue(50);
    const titleOpacity = useSharedValue(0);
    const subtitleY = useSharedValue(30);
    const subtitleOpacity = useSharedValue(0);
    const circleScale1 = useSharedValue(0);
    const circleScale2 = useSharedValue(0);
    const circleScale3 = useSharedValue(0);

    useEffect(() => {
        // Animate logo
        logoScale.value = withDelay(300, withSpring(1, { damping: 8 }));
        logoOpacity.value = withDelay(300, withTiming(1, { duration: 500 }));

        // Animate title
        titleY.value = withDelay(600, withSpring(0, { damping: 10 }));
        titleOpacity.value = withDelay(600, withTiming(1, { duration: 500 }));

        // Animate subtitle
        subtitleY.value = withDelay(800, withSpring(0, { damping: 10 }));
        subtitleOpacity.value = withDelay(800, withTiming(1, { duration: 500 }));

        // Animate background circles
        circleScale1.value = withDelay(0, withTiming(1, { duration: 1500, easing: Easing.out(Easing.cubic) }));
        circleScale2.value = withDelay(200, withTiming(1, { duration: 1500, easing: Easing.out(Easing.cubic) }));
        circleScale3.value = withDelay(400, withTiming(1, { duration: 1500, easing: Easing.out(Easing.cubic) }));

        // Navigate to next screen
        const timer = setTimeout(() => {
            navigation.replace('Onboarding');
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    const logoAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: logoScale.value }],
        opacity: logoOpacity.value,
    }));

    const titleAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: titleY.value }],
        opacity: titleOpacity.value,
    }));

    const subtitleAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: subtitleY.value }],
        opacity: subtitleOpacity.value,
    }));

    const circle1Style = useAnimatedStyle(() => ({
        transform: [{ scale: circleScale1.value }],
    }));

    const circle2Style = useAnimatedStyle(() => ({
        transform: [{ scale: circleScale2.value }],
    }));

    const circle3Style = useAnimatedStyle(() => ({
        transform: [{ scale: circleScale3.value }],
    }));

    return (
        <LinearGradient
            colors={GRADIENTS.dark}
            style={styles.container}
        >
            {/* Animated Background Circles */}
            <Animated.View style={[styles.circle, styles.circle1, circle1Style]} />
            <Animated.View style={[styles.circle, styles.circle2, circle2Style]} />
            <Animated.View style={[styles.circle, styles.circle3, circle3Style]} />

            {/* Logo */}
            <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
                <LinearGradient
                    colors={GRADIENTS.primary}
                    style={styles.logoGradient}
                >
                    <Text style={styles.logoEmoji}>🐄</Text>
                </LinearGradient>
            </Animated.View>

            {/* Title */}
            <Animated.Text style={[styles.title, titleAnimatedStyle]}>
                Peternakan App
            </Animated.Text>

            {/* Subtitle */}
            <Animated.Text style={[styles.subtitle, subtitleAnimatedStyle]}>
                Manajemen • Marketplace • Edukasi
            </Animated.Text>

            {/* Loading indicator */}
            <View style={styles.loadingContainer}>
                <View style={styles.loadingDots}>
                    {[0, 1, 2].map((index) => (
                        <LoadingDot key={index} delay={index * 200} />
                    ))}
                </View>
            </View>
        </LinearGradient>
    );
};

const LoadingDot = ({ delay }) => {
    const opacity = useSharedValue(0.3);

    useEffect(() => {
        opacity.value = withDelay(
            delay,
            withSequence(
                withTiming(1, { duration: 500 }),
                withTiming(0.3, { duration: 500 })
            )
        );

        const interval = setInterval(() => {
            opacity.value = withDelay(
                delay,
                withSequence(
                    withTiming(1, { duration: 500 }),
                    withTiming(0.3, { duration: 500 })
                )
            );
        }, 1500);

        return () => clearInterval(interval);
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    return <Animated.View style={[styles.dot, animatedStyle]} />;
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    circle: {
        position: 'absolute',
        borderRadius: 1000,
        backgroundColor: COLORS.primary,
        opacity: 0.1,
    },
    circle1: {
        width: width * 1.5,
        height: width * 1.5,
        top: -width * 0.5,
        right: -width * 0.5,
    },
    circle2: {
        width: width * 1.2,
        height: width * 1.2,
        bottom: -width * 0.3,
        left: -width * 0.4,
    },
    circle3: {
        width: width * 0.8,
        height: width * 0.8,
        bottom: height * 0.2,
        right: -width * 0.3,
    },
    logoContainer: {
        marginBottom: 24,
    },
    logoGradient: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: COLORS.primaryNeon,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 20,
    },
    logoEmoji: {
        fontSize: 60,
    },
    title: {
        fontSize: SIZES.h1,
        fontWeight: '800',
        color: COLORS.white,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: SIZES.body,
        color: COLORS.primaryLight,
        fontWeight: '500',
    },
    loadingContainer: {
        position: 'absolute',
        bottom: 80,
    },
    loadingDots: {
        flexDirection: 'row',
        gap: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.primary,
    },
});

export default WelcomeScreen;
