/**
 * Theme Colors - Peternakan App
 * Kombinasi Coklat Neon + Putih yang Modern
 */

export const COLORS = {
    // Primary Colors - Coklat Neon
    primary: '#D4A574',        // Coklat Muda/Neon
    primaryDark: '#8B6914',    // Coklat Tua
    primaryLight: '#E8C8A0',   // Coklat Sangat Muda
    primaryNeon: '#FFB347',    // Orange Neon (Aksen)

    // Secondary Colors
    secondary: '#2C1810',      // Coklat Gelap
    secondaryLight: '#5D4037', // Coklat Medium

    // Accent Colors - Neon
    accent: '#FF6B35',         // Orange Neon Terang
    accentGold: '#FFD700',     // Gold Neon
    accentGreen: '#4CAF50',    // Hijau untuk Success

    // Neutral Colors
    white: '#FFFFFF',
    offWhite: '#FFF8F0',       // Putih Cream
    cream: '#FDF5E6',
    lightGray: '#F5F5F5',
    gray: '#9E9E9E',
    darkGray: '#424242',
    black: '#1A1A1A',

    // Background
    background: '#FFF8F0',     // Cream Putih
    backgroundDark: '#2C1810', // Coklat Gelap
    card: '#FFFFFF',

    // Status Colors
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3',

    // Text Colors
    text: '#2C1810',           // Coklat Gelap
    textLight: '#8B6914',      // Coklat Medium
    textMuted: '#9E9E9E',
    textOnPrimary: '#FFFFFF',

    // Gradient Colors
    gradientStart: '#D4A574',
    gradientEnd: '#8B6914',

    // Shadow
    shadow: '#2C1810',

    // Overlay
    overlay: 'rgba(44, 24, 16, 0.7)',
};

export const GRADIENTS = {
    primary: ['#D4A574', '#8B6914'],
    secondary: ['#FFB347', '#FF6B35'],
    dark: ['#5D4037', '#2C1810'],
    light: ['#FFF8F0', '#E8C8A0'],
    gold: ['#FFD700', '#FF8C00'],
    sunset: ['#FF6B35', '#D4A574'],
};

export const FONTS = {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    light: 'System',
};

export const SIZES = {
    // Global sizes
    base: 8,
    font: 14,
    radius: 12,
    radiusLarge: 24,
    padding: 16,
    paddingLarge: 24,

    // Font sizes
    largeTitle: 40,
    h1: 32,
    h2: 24,
    h3: 20,
    h4: 18,
    body: 16,
    bodySmall: 14,
    caption: 12,
    small: 10,

    // Icon sizes
    iconSmall: 20,
    icon: 24,
    iconLarge: 32,
    iconXLarge: 48,

    // Screen dimensions
    width: null,
    height: null,
};

export const SHADOWS = {
    small: {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    medium: {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    large: {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
    },
    glow: {
        shadowColor: COLORS.primaryNeon,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
        elevation: 10,
    },
};

export default {
    COLORS,
    GRADIENTS,
    FONTS,
    SIZES,
    SHADOWS,
};
