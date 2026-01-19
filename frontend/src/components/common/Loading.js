/**
 * Loading Component
 * Loading indicator dengan animasi
 */

import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENTS, SIZES } from '../../constants/theme';

const Loading = ({
    size = 'medium', // small, medium, large, fullscreen
    message,
    overlay = false,
}) => {
    const rotation = useSharedValue(0);

    React.useEffect(() => {
        rotation.value = withRepeat(
            withTiming(360, { duration: 1500, easing: Easing.linear }),
            -1,
            false
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotation.value}deg` }],
    }));

    const getSize = () => {
        switch (size) {
            case 'small':
                return 24;
            case 'large':
                return 64;
            case 'fullscreen':
                return 80;
            default:
                return 40;
        }
    };

    const indicatorSize = getSize();

    const content = (
        <View style={styles.container}>
            <Animated.View
                style={[
                    styles.spinner,
                    { width: indicatorSize, height: indicatorSize },
                    animatedStyle,
                ]}
            >
                <LinearGradient
                    colors={GRADIENTS.primary}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[
                        styles.gradient,
                        { borderRadius: indicatorSize / 2 },
                    ]}
                />
            </Animated.View>
            {message && <Text style={styles.message}>{message}</Text>}
        </View>
    );

    if (size === 'fullscreen' || overlay) {
        return (
            <View style={styles.fullscreen}>
                <View style={styles.overlay} />
                {content}
            </View>
        );
    }

    return content;
};

// Simple loading for inline use
export const LoadingIndicator = ({ color = COLORS.primary, size = 'small' }) => (
    <ActivityIndicator color={color} size={size} />
);

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: SIZES.padding,
    },
    fullscreen: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: COLORS.overlay,
    },
    spinner: {
        borderWidth: 4,
        borderColor: COLORS.lightGray,
        borderTopColor: 'transparent',
        borderRadius: 100,
        overflow: 'hidden',
    },
    gradient: {
        flex: 1,
    },
    message: {
        marginTop: 16,
        fontSize: SIZES.body,
        color: COLORS.textLight,
        textAlign: 'center',
    },
});

export default Loading;
