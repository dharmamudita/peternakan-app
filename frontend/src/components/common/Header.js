/**
 * Header Component
 * Header dengan gradient dan animasi
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS, SIZES, SHADOWS } from '../../constants/theme';

const Header = ({
    title,
    subtitle,
    leftIcon,
    rightIcon,
    onLeftPress,
    onRightPress,
    transparent = false,
    dark = false,
    showBack = false,
    navigation,
}) => {
    const insets = useSafeAreaInsets();

    const handleBack = () => {
        if (onLeftPress) {
            onLeftPress();
        } else if (navigation?.goBack) {
            navigation.goBack();
        }
    };

    const textColor = dark ? COLORS.white : COLORS.text;

    const content = (
        <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
            <View style={styles.leftContainer}>
                {(showBack || leftIcon) && (
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={handleBack}
                    >
                        {leftIcon || (
                            <Ionicons
                                name="chevron-back"
                                size={28}
                                color={textColor}
                            />
                        )}
                    </TouchableOpacity>
                )}
            </View>

            <Animated.View
                entering={FadeIn.duration(300)}
                style={styles.titleContainer}
            >
                <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>
                    {title}
                </Text>
                {subtitle && (
                    <Text style={[styles.subtitle, { color: dark ? COLORS.offWhite : COLORS.textLight }]}>
                        {subtitle}
                    </Text>
                )}
            </Animated.View>

            <View style={styles.rightContainer}>
                {rightIcon && (
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={onRightPress}
                    >
                        {rightIcon}
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    if (transparent) {
        return (
            <>
                <StatusBar
                    barStyle={dark ? 'light-content' : 'dark-content'}
                    translucent
                    backgroundColor="transparent"
                />
                {content}
            </>
        );
    }

    return (
        <>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            <LinearGradient
                colors={GRADIENTS.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.gradient, SHADOWS.medium]}
            >
                <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
                    <View style={styles.leftContainer}>
                        {(showBack || leftIcon) && (
                            <TouchableOpacity
                                style={styles.iconButton}
                                onPress={handleBack}
                            >
                                {leftIcon || (
                                    <Ionicons
                                        name="chevron-back"
                                        size={28}
                                        color={COLORS.white}
                                    />
                                )}
                            </TouchableOpacity>
                        )}
                    </View>

                    <Animated.View
                        entering={FadeIn.duration(300)}
                        style={styles.titleContainer}
                    >
                        <Text style={[styles.title, { color: COLORS.white }]} numberOfLines={1}>
                            {title}
                        </Text>
                        {subtitle && (
                            <Text style={[styles.subtitle, { color: COLORS.offWhite }]}>
                                {subtitle}
                            </Text>
                        )}
                    </Animated.View>

                    <View style={styles.rightContainer}>
                        {rightIcon && (
                            <TouchableOpacity
                                style={styles.iconButton}
                                onPress={onRightPress}
                            >
                                {rightIcon}
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </LinearGradient>
        </>
    );
};

const styles = StyleSheet.create({
    gradient: {
        borderBottomLeftRadius: SIZES.radiusLarge,
        borderBottomRightRadius: SIZES.radiusLarge,
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SIZES.padding,
        paddingBottom: 16,
    },
    leftContainer: {
        width: 48,
        alignItems: 'flex-start',
    },
    rightContainer: {
        width: 48,
        alignItems: 'flex-end',
    },
    titleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    title: {
        fontSize: SIZES.h3,
        fontWeight: '700',
    },
    subtitle: {
        fontSize: SIZES.caption,
        marginTop: 2,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
});

export default Header;
