/**
 * Welcome/Splash Screen
 * Animasi teks "Peternakan" yang keren
 */

import React, { useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    StatusBar,
    Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withDelay,
    withSequence,
    withSpring,
    Easing,
    FadeIn,
    SlideInDown,
} from 'react-native-reanimated';
import { COLORS, SHADOWS } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

const WelcomeScreen = ({ navigation }) => {
    // Animasi untuk setiap huruf
    const letterAnimations = 'PETERNAKAN'.split('').map(() => ({
        opacity: useSharedValue(0),
        translateY: useSharedValue(50),
        scale: useSharedValue(0.5),
        rotate: useSharedValue(15),
    }));

    // Animasi logo
    const logoScale = useSharedValue(0);
    const logoRotate = useSharedValue(-180);
    const logoOpacity = useSharedValue(0);

    // Animasi subtitle
    const subtitleOpacity = useSharedValue(0);
    const subtitleTranslateY = useSharedValue(20);

    // Animasi loading bar
    const loadingWidth = useSharedValue(0);
    const loadingOpacity = useSharedValue(0);

    // Animasi glow
    const glowOpacity = useSharedValue(0);
    const glowScale = useSharedValue(1);

    useEffect(() => {
        // 1. Logo muncul dengan rotasi
        logoOpacity.value = withDelay(200, withTiming(1, { duration: 600 }));
        logoScale.value = withDelay(200, withSpring(1, { damping: 10, stiffness: 80 }));
        logoRotate.value = withDelay(200, withSpring(0, { damping: 12 }));

        // 2. Animasi setiap huruf secara berurutan
        letterAnimations.forEach((anim, index) => {
            const delay = 600 + index * 100;
            anim.opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
            anim.translateY.value = withDelay(delay, withSpring(0, { damping: 8 }));
            anim.scale.value = withDelay(delay, withSpring(1, { damping: 10 }));
            anim.rotate.value = withDelay(delay, withSpring(0, { damping: 12 }));
        });

        // 3. Glow effect setelah huruf selesai
        glowOpacity.value = withDelay(1800,
            withSequence(
                withTiming(0.6, { duration: 400 }),
                withTiming(0.3, { duration: 400 })
            )
        );
        glowScale.value = withDelay(1800,
            withSequence(
                withTiming(1.2, { duration: 400 }),
                withTiming(1, { duration: 400 })
            )
        );

        // 4. Subtitle muncul
        subtitleOpacity.value = withDelay(2000, withTiming(1, { duration: 500 }));
        subtitleTranslateY.value = withDelay(2000, withSpring(0, { damping: 10 }));

        // 5. Loading bar
        loadingOpacity.value = withDelay(2300, withTiming(1, { duration: 300 }));
        loadingWidth.value = withDelay(2400,
            withTiming(100, {
                duration: 1200,
                easing: Easing.bezier(0.4, 0, 0.2, 1)
            })
        );

        // Navigate setelah animasi selesai
        const timer = setTimeout(() => {
            navigation.replace('Onboarding');
        }, 4000);

        return () => clearTimeout(timer);
    }, []);

    // Animated style untuk logo
    const logoStyle = useAnimatedStyle(() => ({
        opacity: logoOpacity.value,
        transform: [
            { scale: logoScale.value },
            { rotate: `${logoRotate.value}deg` },
        ],
    }));

    // Animated style untuk glow
    const glowStyle = useAnimatedStyle(() => ({
        opacity: glowOpacity.value,
        transform: [{ scale: glowScale.value }],
    }));

    // Animated style untuk subtitle
    const subtitleStyle = useAnimatedStyle(() => ({
        opacity: subtitleOpacity.value,
        transform: [{ translateY: subtitleTranslateY.value }],
    }));

    // Animated style untuk loading bar
    const loadingContainerStyle = useAnimatedStyle(() => ({
        opacity: loadingOpacity.value,
    }));

    const loadingBarStyle = useAnimatedStyle(() => ({
        width: `${loadingWidth.value}%`,
    }));

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            {/* Background putih bersih */}
            <View style={styles.background}>
                {/* Decorative circles */}
                <View style={[styles.decorCircle, styles.decorCircle1]} />
                <View style={[styles.decorCircle, styles.decorCircle2]} />
                <View style={[styles.decorCircle, styles.decorCircle3]} />
            </View>

            {/* Content */}
            <View style={styles.content}>
                {/* Logo */}
                <Animated.View style={[styles.logoContainer, logoStyle]}>
                    <LinearGradient
                        colors={['#964b00', '#7c3f06']}
                        style={styles.logoGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <Text style={styles.logoEmoji}>🐄</Text>
                    </LinearGradient>
                </Animated.View>

                {/* Glow Effect */}
                <Animated.View style={[styles.glowContainer, glowStyle]}>
                    <View style={styles.glow} />
                </Animated.View>

                {/* Animated Text "PETERNAKAN" */}
                <View style={styles.titleContainer}>
                    {'PETERNAKAN'.split('').map((letter, index) => {
                        const animatedLetterStyle = useAnimatedStyle(() => ({
                            opacity: letterAnimations[index].opacity.value,
                            transform: [
                                { translateY: letterAnimations[index].translateY.value },
                                { scale: letterAnimations[index].scale.value },
                                { rotate: `${letterAnimations[index].rotate.value}deg` },
                            ],
                        }));

                        return (
                            <Animated.Text
                                key={index}
                                style={[styles.titleLetter, animatedLetterStyle]}
                            >
                                {letter}
                            </Animated.Text>
                        );
                    })}
                </View>

                {/* Subtitle */}
                <Animated.View style={[styles.subtitleContainer, subtitleStyle]}>
                    <View style={styles.subtitleBadge}>
                        <View style={styles.subtitleDot} />
                        <Text style={styles.subtitleText}>Aplikasi Manajemen Ternak</Text>
                        <View style={styles.subtitleDot} />
                    </View>
                </Animated.View>

                {/* Loading Bar */}
                <Animated.View style={[styles.loadingContainer, loadingContainerStyle]}>
                    <View style={styles.loadingTrack}>
                        <Animated.View style={[styles.loadingBar, loadingBarStyle]}>
                            <LinearGradient
                                colors={['#964b00', '#7c3f06']}
                                style={StyleSheet.absoluteFill}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            />
                        </Animated.View>
                    </View>
                    <Text style={styles.loadingText}>Memuat...</Text>
                </Animated.View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>v1.0.0</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    background: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#ffffff',
    },
    decorCircle: {
        position: 'absolute',
        borderRadius: 1000,
    },
    decorCircle1: {
        width: width * 0.8,
        height: width * 0.8,
        top: -width * 0.3,
        right: -width * 0.3,
        backgroundColor: '#964b00',
        opacity: 0.04,
    },
    decorCircle2: {
        width: width * 0.6,
        height: width * 0.6,
        bottom: -width * 0.2,
        left: -width * 0.2,
        backgroundColor: '#7c3f06',
        opacity: 0.03,
    },
    decorCircle3: {
        width: width * 0.4,
        height: width * 0.4,
        top: height * 0.5,
        right: -width * 0.1,
        backgroundColor: '#964b00',
        opacity: 0.02,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    logoContainer: {
        marginBottom: 32,
        ...SHADOWS.large,
    },
    logoGradient: {
        width: 100,
        height: 100,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoEmoji: {
        fontSize: 56,
    },
    glowContainer: {
        position: 'absolute',
        top: height * 0.35,
    },
    glow: {
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: '#964b00',
        opacity: 0.15,
    },
    titleContainer: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    titleLetter: {
        fontSize: 36,
        fontWeight: '900',
        color: '#964b00',
        letterSpacing: 2,
        textShadowColor: 'rgba(150, 75, 0, 0.2)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    subtitleContainer: {
        marginBottom: 48,
    },
    subtitleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: '#faf8f5',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#f0ebe3',
    },
    subtitleDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#964b00',
    },
    subtitleText: {
        fontSize: 14,
        color: '#7c3f06',
        fontWeight: '500',
    },
    loadingContainer: {
        alignItems: 'center',
        gap: 12,
    },
    loadingTrack: {
        width: 200,
        height: 6,
        backgroundColor: '#f0ebe3',
        borderRadius: 3,
        overflow: 'hidden',
    },
    loadingBar: {
        height: '100%',
        borderRadius: 3,
        overflow: 'hidden',
    },
    loadingText: {
        fontSize: 12,
        color: '#9ca3af',
        fontWeight: '500',
    },
    footer: {
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        color: '#d1d5db',
    },
});

export default WelcomeScreen;
