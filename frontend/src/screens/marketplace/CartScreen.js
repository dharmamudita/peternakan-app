
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../../constants/theme';

const CartScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    // Dummy cart data
    const [cartItems, setCartItems] = React.useState([
        // Initialize with empty or dummy data
    ]);

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.black} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Keranjang Saya</Text>
                <View style={{ width: 40 }} />
            </View>

            {cartItems.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="cart-outline" size={80} color={COLORS.gray} />
                    <Text style={styles.emptyText}>Keranjang Anda masih kosong</Text>
                    <TouchableOpacity style={styles.shopButton} onPress={() => navigation.navigate('MarketTab')}>
                        <Text style={styles.shopButtonText}>Mulai Belanja</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <Text>List Keranjang akan tampil di sini</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        backgroundColor: '#f5f5f5',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    emptyText: {
        fontSize: 16,
        color: COLORS.gray,
        marginTop: 16,
        textAlign: 'center',
    },
    shopButton: {
        marginTop: 24,
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        ...SHADOWS.medium,
    },
    shopButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default CartScreen;
