/**
 * Welcome/Splash Screen - Teks keren dengan efek
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, StatusBar, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withDelay,
    withSequence,
    withSpring,
    Easing,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const WelcomeScreen = ({ navigation }) => {
    // Animasi untuk setiap huruf
    const letters = 'PETERNAKAN'.split('');
    const letterAnimations = letters.map(() => ({
        opacity: useSharedValue(0),
        translateY: useSharedValue(30),
    }));

    const subtitleOpacity = useSharedValue(0);
    const lineWidth = useSharedValue(0);
    const loadingOpacity = useSharedValue(0);
    const loadingWidth = useSharedValue(0);

    useEffect(() => {
        // Animasi setiap huruf secara berurutan
        letterAnimations.forEach((anim, index) => {
            const delay = 200 + index * 80;
            anim.opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
            anim.translateY.value = withDelay(delay, withSpring(0, { damping: 12, stiffness: 100 }));
        });

        // Garis dekoratif
        lineWidth.value = withDelay(1200, withTiming(1, { duration: 600, easing: Easing.out(Easing.ease) }));

        // Subtitle
        subtitleOpacity.value = withDelay(1400, withTiming(1, { duration: 500 }));

        // Loading bar
        loadingOpacity.value = withDelay(1800, withTiming(1, { duration: 300 }));
        loadingWidth.value = withDelay(2000, withTiming(100, { duration: 1200, easing: Easing.bezier(0.4, 0, 0.2, 1) }));

        // Navigate
        const timer = setTimeout(() => {
            navigation.replace('Onboarding');
        }, 3800);

        return () => clearTimeout(timer);
    }, []);

    const subtitleStyle = useAnimatedStyle(() => ({
        opacity: subtitleOpacity.value,
    }));

    const lineStyle = useAnimatedStyle(() => ({
        transform: [{ scaleX: lineWidth.value }],
    }));

    const loadingContainerStyle = useAnimatedStyle(() => ({
        opacity: loadingOpacity.value,
    }));

    const loadingBarStyle = useAnimatedStyle(() => ({
        width: `${loadingWidth.value}%`,
    }));

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#964b00" />

            <LinearGradient
                colors={['#964b00', '#7c3f06', '#5d3a1a']}
                style={styles.background}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            {/* Decorative elements */}
            <View style={styles.decorTop} />
            <View style={styles.decorBottom} />

            <View style={styles.content}>
                {/* Animated Letters */}
                <View style={styles.titleContainer}>
                    {letters.map((letter, index) => {
                        const animatedLetterStyle = useAnimatedStyle(() => ({
                            opacity: letterAnimations[index].opacity.value,
                            transform: [{ translateY: letterAnimations[index].translateY.value }],
                        }));

                        return (
                            <Animated.Text
                                key={index}
                                style={[styles.letter, animatedLetterStyle]}
                            >
                                {letter}
                            </Animated.Text>
                        );
                    })}
                </View>

                {/* Decorative Line */}
                <View style={styles.lineContainer}>
                    <Animated.View style={[styles.line, lineStyle]} />
                </View>

                {/* Subtitle */}
                <Animated.View style={[styles.subtitleContainer, subtitleStyle]}>
                    <Text style={styles.subtitle}>Aplikasi Manajemen Ternak</Text>
                </Animated.View>

                {/* Loading Bar */}
                <Animated.View style={[styles.loadingContainer, loadingContainerStyle]}>
                    <View style={styles.loadingTrack}>
                        <Animated.View style={[styles.loadingBar, loadingBarStyle]} />
                    </View>
                    <Text style={styles.loadingText}>Memuat aplikasi...</Text>
                </Animated.View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.version}>v1.0.0</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        ...StyleSheet.absoluteFillObject,
    },
    decorTop: {
        position: 'absolute',
        top: -100,
        right: -100,
        width: 250,
        height: 250,
        borderRadius: 125,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    decorBottom: {
        position: 'absolute',
        bottom: -80,
        left: -80,
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(255,255,255,0.03)',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    titleContainer: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    letter: {
        fontSize: 38,
        fontWeight: '900',
        color: '#ffffff',
        letterSpacing: 2,
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 3 },
        textShadowRadius: 6,
    },
    lineContainer: {
        width: 80,
        height: 4,
        marginBottom: 20,
        overflow: 'hidden',
    },
    line: {
        width: '100%',
        height: '100%',
        backgroundColor: '#ffffff',
        borderRadius: 2,
    },
    subtitleContainer: {
        marginBottom: 80,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.85)',
        fontWeight: '500',
        letterSpacing: 1,
    },
    loadingContainer: {
        position: 'absolute',
        bottom: 100,
        alignItems: 'center',
        gap: 12,
    },
    loadingTrack: {
        width: 200,
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    loadingBar: {
        height: '100%',
        backgroundColor: '#ffffff',
        borderRadius: 2,
    },
    loadingText: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.6)',
        fontWeight: '500',
    },
    footer: {
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
        alignItems: 'center',
    },
    version: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.4)',
    },
});

export default WelcomeScreen;
