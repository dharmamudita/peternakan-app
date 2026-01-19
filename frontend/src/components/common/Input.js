/**
 * Animated Input Component
 * Input dengan animasi focus dan floating label
 */

import React, { useState } from 'react';
import {
    View,
    TextInput,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    interpolate,
    Extrapolation,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';

const Input = ({
    label,
    value,
    onChangeText,
    placeholder,
    secureTextEntry,
    keyboardType = 'default',
    autoCapitalize = 'none',
    error,
    leftIcon,
    rightIcon,
    onRightIconPress,
    multiline = false,
    numberOfLines = 1,
    style,
    inputStyle,
    editable = true,
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const focusAnim = useSharedValue(value ? 1 : 0);

    const handleFocus = () => {
        setIsFocused(true);
        focusAnim.value = withTiming(1, { duration: 200 });
    };

    const handleBlur = () => {
        setIsFocused(false);
        if (!value) {
            focusAnim.value = withTiming(0, { duration: 200 });
        }
    };

    const labelStyle = useAnimatedStyle(() => ({
        transform: [
            {
                translateY: interpolate(
                    focusAnim.value,
                    [0, 1],
                    [0, -24],
                    Extrapolation.CLAMP
                ),
            },
            {
                scale: interpolate(
                    focusAnim.value,
                    [0, 1],
                    [1, 0.85],
                    Extrapolation.CLAMP
                ),
            },
        ],
    }));

    const containerStyle = useAnimatedStyle(() => ({
        borderColor: withTiming(
            error ? COLORS.error : isFocused ? COLORS.primary : COLORS.lightGray,
            { duration: 200 }
        ),
    }));

    return (
        <View style={[styles.wrapper, style]}>
            <Animated.View style={[styles.container, containerStyle, SHADOWS.small]}>
                {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

                <View style={styles.inputWrapper}>
                    {label && (
                        <Animated.Text style={[styles.label, labelStyle]}>
                            {label}
                        </Animated.Text>
                    )}

                    <TextInput
                        style={[
                            styles.input,
                            leftIcon && styles.inputWithLeftIcon,
                            (rightIcon || secureTextEntry) && styles.inputWithRightIcon,
                            multiline && styles.multilineInput,
                            inputStyle,
                        ]}
                        value={value}
                        onChangeText={onChangeText}
                        placeholder={isFocused ? placeholder : ''}
                        placeholderTextColor={COLORS.gray}
                        secureTextEntry={secureTextEntry && !showPassword}
                        keyboardType={keyboardType}
                        autoCapitalize={autoCapitalize}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        multiline={multiline}
                        numberOfLines={numberOfLines}
                        editable={editable}
                    />
                </View>

                {secureTextEntry && (
                    <TouchableOpacity
                        style={styles.rightIcon}
                        onPress={() => setShowPassword(!showPassword)}
                    >
                        <Ionicons
                            name={showPassword ? 'eye-off' : 'eye'}
                            size={20}
                            color={COLORS.gray}
                        />
                    </TouchableOpacity>
                )}

                {rightIcon && !secureTextEntry && (
                    <TouchableOpacity
                        style={styles.rightIcon}
                        onPress={onRightIconPress}
                    >
                        {rightIcon}
                    </TouchableOpacity>
                )}
            </Animated.View>

            {error && <Text style={styles.error}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        marginBottom: 16,
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius,
        borderWidth: 2,
        paddingHorizontal: 16,
        minHeight: 56,
    },
    inputWrapper: {
        flex: 1,
        justifyContent: 'center',
    },
    label: {
        position: 'absolute',
        left: 0,
        top: 16,
        fontSize: SIZES.body,
        color: COLORS.gray,
        backgroundColor: COLORS.white,
        paddingHorizontal: 4,
    },
    input: {
        flex: 1,
        fontSize: SIZES.body,
        color: COLORS.text,
        paddingVertical: 16,
    },
    inputWithLeftIcon: {
        paddingLeft: 8,
    },
    inputWithRightIcon: {
        paddingRight: 8,
    },
    multilineInput: {
        textAlignVertical: 'top',
        paddingTop: 16,
    },
    leftIcon: {
        marginRight: 8,
    },
    rightIcon: {
        marginLeft: 8,
        padding: 4,
    },
    error: {
        color: COLORS.error,
        fontSize: SIZES.caption,
        marginTop: 4,
        marginLeft: 16,
    },
});

export default Input;
