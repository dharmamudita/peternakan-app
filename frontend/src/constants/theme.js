/**
 * Theme Colors - Peternakan App
 * Tema Putih + Coklat Premium (#964b00 dan #7c3f06)
 */

export const COLORS = {
    // Primary Colors - Coklat
    primary: '#964b00',        // Coklat Utama
    primaryDark: '#7c3f06',    // Coklat Tua
    primaryLight: '#b87333',   // Coklat Muda
    primaryAccent: '#c9a86c',  // Aksen Coklat

    // Secondary Colors
    secondary: '#5d3a1a',      // Coklat Gelap
    secondaryLight: '#8b5a2b', // Coklat Medium

    // Accent Colors
    accent: '#964b00',         // Sama dengan primary
    accentGold: '#c9a86c',     // Gold Coklat
    accentGreen: '#4CAF50',    // Hijau untuk Success

    // Neutral Colors
    white: '#FFFFFF',
    offWhite: '#faf8f5',       // Putih Cream
    cream: '#f5f2ed',
    lightGray: '#F5F5F5',
    gray: '#9E9E9E',
    darkGray: '#424242',
    black: '#1A1A1A',

    // Background
    background: '#ffffff',     // Putih Bersih
    backgroundDark: '#7c3f06', // Coklat Gelap
    card: '#FFFFFF',

    // Status Colors
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#dc2626',
    info: '#2196F3',

    // Text Colors
    text: '#1f1f1f',           // Hitam
    textLight: '#6b7280',      // Abu
    textMuted: '#9ca3af',
    textOnPrimary: '#FFFFFF',

    // Gradient Colors
    gradientStart: '#964b00',
    gradientEnd: '#7c3f06',

    // Shadow
    shadow: '#000000',

    // Overlay
    overlay: 'rgba(0, 0, 0, 0.5)',
};

export const GRADIENTS = {
    primary: ['#964b00', '#7c3f06'],
    secondary: ['#b87333', '#964b00'],
    dark: ['#5d3a1a', '#3d2510'],
    light: ['#ffffff', '#faf8f5'],
    gold: ['#c9a86c', '#964b00'],
    sunset: ['#b87333', '#7c3f06'],
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
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    medium: {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 4,
    },
    large: {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.16,
        shadowRadius: 16,
        elevation: 8,
    },
    glow: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
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
