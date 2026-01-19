/**
 * Animated Button Component
 * Button dengan animasi press dan glow effect
 */

import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { COLORS, GRADIENTS, SIZES, SHADOWS } from '../../constants/theme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const Button = ({
    title,
    onPress,
    variant = 'primary', // primary, secondary, outline, ghost
    size = 'medium', // small, medium, large
    loading = false,
    disabled = false,
    icon,
    iconPosition = 'left',
    fullWidth = false,
    style,
    textStyle,
}) => {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    const handlePressIn = () => {
        scale.value = withSpring(0.95);
        opacity.value = withTiming(0.9);
    };

    const handlePressOut = () => {
        scale.value = withSpring(1);
        opacity.value = withTiming(1);
    };

    const getSizeStyle = () => {
        switch (size) {
            case 'small':
                return styles.sizeSmall;
            case 'large':
                return styles.sizeLarge;
            default:
                return styles.sizeMedium;
        }
    };

    const getTextSize = () => {
        switch (size) {
            case 'small':
                return styles.textSmall;
            case 'large':
                return styles.textLarge;
            default:
                return styles.textMedium;
        }
    };

    const renderContent = () => (
        <>
            {loading ? (
                <ActivityIndicator
                    color={variant === 'outline' || variant === 'ghost' ? COLORS.primary : COLORS.white}
                    size="small"
                />
            ) : (
                <>
                    {icon && iconPosition === 'left' && icon}
                    <Text
                        style={[
                            styles.text,
                            getTextSize(),
                            variant === 'outline' && styles.textOutline,
                            variant === 'ghost' && styles.textGhost,
                            textStyle,
                        ]}
                    >
                        {title}
                    </Text>
                    {icon && iconPosition === 'right' && icon}
                </>
            )}
        </>
    );

    if (variant === 'primary' || variant === 'secondary') {
        const gradientColors = variant === 'primary' ? GRADIENTS.primary : GRADIENTS.secondary;

        return (
            <AnimatedTouchable
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={disabled || loading}
                style={[animatedStyle, fullWidth && styles.fullWidth, style]}
                activeOpacity={0.9}
            >
                <LinearGradient
                    colors={gradientColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[
                        styles.button,
                        getSizeStyle(),
                        disabled && styles.disabled,
                    ]}
                >
                    {renderContent()}
                </LinearGradient>
            </AnimatedTouchable>
        );
    }

    return (
        <AnimatedTouchable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled || loading}
            style={[
                animatedStyle,
                styles.button,
                getSizeStyle(),
                variant === 'outline' && styles.outline,
                variant === 'ghost' && styles.ghost,
                disabled && styles.disabled,
                fullWidth && styles.fullWidth,
                style,
            ]}
            activeOpacity={0.8}
        >
            {renderContent()}
        </AnimatedTouchable>
    );
};

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: SIZES.radius,
        gap: 8,
    },
    sizeSmall: {
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    sizeMedium: {
        paddingVertical: 14,
        paddingHorizontal: 24,
    },
    sizeLarge: {
        paddingVertical: 18,
        paddingHorizontal: 32,
    },
    text: {
        color: COLORS.white,
        fontWeight: '600',
    },
    textSmall: {
        fontSize: SIZES.bodySmall,
    },
    textMedium: {
        fontSize: SIZES.body,
    },
    textLarge: {
        fontSize: SIZES.h4,
    },
    textOutline: {
        color: COLORS.primary,
    },
    textGhost: {
        color: COLORS.primary,
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    ghost: {
        backgroundColor: 'transparent',
    },
    disabled: {
        opacity: 0.5,
    },
    fullWidth: {
        width: '100%',
    },
});

export default Button;
