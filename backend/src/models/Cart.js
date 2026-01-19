/**
 * Cart Model
 * Model untuk keranjang belanja
 */

const { db } = require('../config/firebase');
const { COLLECTIONS } = require('../config/constants');

class Cart {
    constructor(data) {
        this.id = data.id || null;
        this.userId = data.userId || '';
        this.items = data.items || []; // Array of { productId, quantity, addedAt }
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = data.updatedAt || new Date();
    }

    toJSON() {
        return {
            id: this.id,
            userId: this.userId,
            items: this.items,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }

    toFirestore() {
        const data = this.toJSON();
        delete data.id;
        return data;
    }

    static async getByUserId(userId) {
        const snapshot = await db.collection(COLLECTIONS.CARTS)
            .where('userId', '==', userId)
            .limit(1)
            .get();

        if (snapshot.empty) {
            // Create new cart if not exists
            return await Cart.create({ userId, items: [] });
        }

        const doc = snapshot.docs[0];
        return new Cart({ id: doc.id, ...doc.data() });
    }

    static async create(cartData) {
        const cart = new Cart(cartData);
        const docRef = await db.collection(COLLECTIONS.CARTS).add(cart.toFirestore());
        cart.id = docRef.id;
        return cart;
    }

    static async addItem(userId, productId, quantity = 1) {
        const cart = await Cart.getByUserId(userId);
        const items = cart.items || [];

        const existingItemIndex = items.findIndex(item => item.productId === productId);

        if (existingItemIndex > -1) {
            items[existingItemIndex].quantity += quantity;
        } else {
            items.push({
                productId,
                quantity,
                addedAt: new Date(),
            });
        }

        await db.collection(COLLECTIONS.CARTS).doc(cart.id).update({
            items,
            updatedAt: new Date(),
        });

        return await Cart.getByUserId(userId);
    }

    static async updateItemQuantity(userId, productId, quantity) {
        const cart = await Cart.getByUserId(userId);
        const items = cart.items || [];

        const itemIndex = items.findIndex(item => item.productId === productId);

        if (itemIndex === -1) return cart;

        if (quantity <= 0) {
            items.splice(itemIndex, 1);
        } else {
            items[itemIndex].quantity = quantity;
        }

        await db.collection(COLLECTIONS.CARTS).doc(cart.id).update({
            items,
            updatedAt: new Date(),
        });

        return await Cart.getByUserId(userId);
    }

    static async removeItem(userId, productId) {
        const cart = await Cart.getByUserId(userId);
        const items = (cart.items || []).filter(item => item.productId !== productId);

        await db.collection(COLLECTIONS.CARTS).doc(cart.id).update({
            items,
            updatedAt: new Date(),
        });

        return await Cart.getByUserId(userId);
    }

    static async clearCart(userId) {
        const cart = await Cart.getByUserId(userId);

        await db.collection(COLLECTIONS.CARTS).doc(cart.id).update({
            items: [],
            updatedAt: new Date(),
        });

        return await Cart.getByUserId(userId);
    }

    static async getCartWithProducts(userId) {
        const cart = await Cart.getByUserId(userId);
        const Product = require('./Product');

        const itemsWithProducts = await Promise.all(
            cart.items.map(async (item) => {
                const product = await Product.getById(item.productId);
                return {
                    ...item,
                    product: product ? product.toJSON() : null,
                };
            })
        );

        return {
            ...cart.toJSON(),
            items: itemsWithProducts.filter(item => item.product !== null),
        };
    }
}

module.exports = Cart;
