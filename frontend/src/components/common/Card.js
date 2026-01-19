/**
 * Animated Card Component
 * Card dengan animasi dan shadow
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    FadeInDown,
} from 'react-native-reanimated';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const Card = ({
    children,
    onPress,
    style,
    variant = 'default', // default, elevated, outline
    padding = SIZES.padding,
    animate = true,
    animationDelay = 0,
}) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
        if (onPress) {
            scale.value = withSpring(0.98);
        }
    };

    const handlePressOut = () => {
        if (onPress) {
            scale.value = withSpring(1);
        }
    };

    const getVariantStyle = () => {
        switch (variant) {
            case 'elevated':
                return [styles.elevated, SHADOWS.large];
            case 'outline':
                return styles.outline;
            default:
                return [styles.default, SHADOWS.small];
        }
    };

    const cardContent = (
        <View style={[styles.card, getVariantStyle(), { padding }, style]}>
            {children}
        </View>
    );

    if (onPress) {
        return (
            <Animated.View
                entering={animate ? FadeInDown.delay(animationDelay).duration(400) : undefined}
                style={animatedStyle}
            >
                <TouchableOpacity
                    onPress={onPress}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    activeOpacity={0.9}
                >
                    {cardContent}
                </TouchableOpacity>
            </Animated.View>
        );
    }

    return (
        <Animated.View
            entering={animate ? FadeInDown.delay(animationDelay).duration(400) : undefined}
        >
            {cardContent}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.card,
        borderRadius: SIZES.radiusLarge,
        overflow: 'hidden',
    },
    default: {
        backgroundColor: COLORS.card,
    },
    elevated: {
        backgroundColor: COLORS.card,
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: COLORS.primaryLight,
    },
});

export default Card;
