/**
 * App Navigator
 * Konfigurasi navigasi utama
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
} from 'react-native-reanimated';

import { COLORS, GRADIENTS, SHADOWS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { Loading } from '../components/common';

// Auth Screens
import {
    WelcomeScreen,
    OnboardingScreen,
    LoginScreen,
    RegisterScreen,
    HomeScreen,
    FarmDashboardScreen,
    MarketplaceScreen,
    EducationScreen,
    MaterialDetailScreen,
    CourseDetailScreen,
    ProfileScreen,
    SellerRegistrationScreen,
    SellerDashboardScreen,
    AnimalDetailScreen,
    EditProfileScreen,
    ChangePasswordScreen,
    HelpScreen,
    AdminDashboardScreen,
    EducationManagementScreen,
    BroadcastScreen,
    NotificationScreen,
} from '../screens';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Placeholder screens
// Custom Tab Bar Button
const TabBarButton = ({ children, onPress, focused }) => {
    const scale = useSharedValue(1);

    React.useEffect(() => {
        scale.value = withSpring(focused ? 1.1 : 1, { damping: 10 });
    }, [focused]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <Animated.View style={[styles.tabButton, animatedStyle]}>
            {focused && (
                <LinearGradient
                    colors={GRADIENTS.primary}
                    style={styles.tabButtonGradient}
                />
            )}
            {children}
        </Animated.View>
    );
};

// Bottom Tab Navigator
const MainTabs = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarShowLabel: true,
                tabBarStyle: styles.tabBar,
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.gray,
                tabBarLabelStyle: styles.tabLabel,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    switch (route.name) {
                        case 'HomeTab':
                            iconName = focused ? 'home' : 'home-outline';
                            break;
                        case 'FarmTab':
                            iconName = focused ? 'leaf' : 'leaf-outline';
                            break;
                        case 'MarketTab':
                            iconName = focused ? 'cart' : 'cart-outline';
                            break;
                        case 'EducationTab':
                            iconName = focused ? 'book' : 'book-outline';
                            break;
                        case 'ProfileTab':
                            iconName = focused ? 'person' : 'person-outline';
                            break;
                        default:
                            iconName = 'ellipse';
                    }

                    return (
                        <View style={focused ? styles.activeIconContainer : null}>
                            <Ionicons name={iconName} size={24} color={focused ? COLORS.primary : color} />
                        </View>
                    );
                },
            })}
        >
            <Tab.Screen
                name="HomeTab"
                component={HomeScreen}
                options={{ tabBarLabel: 'Beranda' }}
            />
            <Tab.Screen
                name="FarmTab"
                component={FarmDashboardScreen}
                options={{ tabBarLabel: 'Peternakan' }}
            />
            <Tab.Screen
                name="MarketTab"
                component={MarketplaceScreen}
                options={{ tabBarLabel: 'Market' }}
            />
            <Tab.Screen
                name="EducationTab"
                component={EducationScreen}
                options={{ tabBarLabel: 'Edukasi' }}
            />
            <Tab.Screen
                name="ProfileTab"
                component={ProfileScreen}
                options={{ tabBarLabel: 'Profil' }}
            />
        </Tab.Navigator>
    );
};

// Auth Stack
const AuthStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                animation: 'fade',
            }}
        >
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
    );
};

// Root Navigator
const AppNavigator = () => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Loading size="large" message="Memuat..." />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                    animation: 'fade',
                }}
            >
                {isAuthenticated ? (
                    <>
                        <Stack.Screen name="MainTabs" component={MainTabs} />
                        <Stack.Screen name="SellerRegistration" component={SellerRegistrationScreen} />
                        <Stack.Screen name="SellerDashboard" component={SellerDashboardScreen} />
                        <Stack.Screen name="AnimalDetail" component={AnimalDetailScreen} />
                        <Stack.Screen name="MaterialDetail" component={MaterialDetailScreen} />
                        <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
                        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
                        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
                        <Stack.Screen name="Help" component={HelpScreen} />
                        <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
                        <Stack.Screen name="EducationManagement" component={EducationManagementScreen} />
                        <Stack.Screen name="Broadcast" component={BroadcastScreen} />
                        <Stack.Screen name="Notification" component={NotificationScreen} />
                    </>
                ) : (
                    <Stack.Screen name="Auth" component={AuthStack} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.background,
    },
    placeholder: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.background,
    },
    tabBar: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        height: 70,
        backgroundColor: COLORS.white,
        borderRadius: 35,
        paddingBottom: 0,
        paddingTop: 10,
        ...SHADOWS.large,
    },
    tabLabel: {
        fontSize: 10,
        fontWeight: '600',
        marginTop: 2,
    },
    tabButton: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabButtonGradient: {
        position: 'absolute',
        width: 48,
        height: 48,
        borderRadius: 24,
        opacity: 0.1,
    },
    activeIconContainer: {
        backgroundColor: COLORS.primary + '15',
        padding: 8,
        borderRadius: 12,
    },
});

export default AppNavigator;
