/**
 * Marketplace Service
 * Service untuk marketplace (produk, order, keranjang)
 */

const Product = require('../models/Product');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const User = require('../models/User');
const Shop = require('../models/Shop');
const { ORDER_STATUS, PRODUCT_STATUS, USER_ROLES } = require('../config/constants');

class MarketplaceService {
    // ==================== PRODUCTS ====================

    /**
     * Membuat produk baru
     */
    static async createProduct(sellerId, productData) {
        try {
            // Update role user menjadi seller jika belum
            const user = await User.getById(sellerId);
            if (user && user.role === USER_ROLES.USER) {
                await User.update(sellerId, { role: USER_ROLES.SELLER });
            }

            // Get Shop ID
            let shopId = '';
            const shop = await Shop.getByUserId(sellerId);
            if (shop) {
                shopId = shop.id;
            }

            const product = await Product.create({
                ...productData,
                sellerId,
                shopId,
                status: PRODUCT_STATUS.ACTIVE,
            });

            return product;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Mendapatkan produk berdasarkan ID
     */
    static async getProductById(productId, incrementViews = false) {
        try {
            const product = await Product.getById(productId);
            if (!product) {
                throw new Error('Produk tidak ditemukan');
            }

            if (incrementViews) {
                await Product.incrementViews(productId);
            }

            return product;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Mendapatkan produk berdasarkan slug
     */
    static async getProductBySlug(slug) {
        try {
            const product = await Product.getBySlug(slug);
            if (!product) {
                throw new Error('Produk tidak ditemukan');
            }

            await Product.incrementViews(product.id);
            return product;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Mendapatkan semua produk
     */
    static async getAllProducts(page = 1, limit = 10, filters = {}) {
        try {
            return await Product.getAll(page, limit, filters);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Mencari produk
     */
    static async searchProducts(searchTerm, page = 1, limit = 10) {
        try {
            return await Product.search(searchTerm, page, limit);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Mendapatkan produk featured
     */
    static async getFeaturedProducts(limit = 8) {
        try {
            return await Product.getFeaturedProducts(limit);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Mendapatkan produk best seller
     */
    static async getBestSellers(limit = 8) {
        try {
            return await Product.getBestSellers(limit);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Update produk
     */
    static async updateProduct(productId, sellerId, updateData) {
        try {
            const product = await Product.getById(productId);

            if (!product) {
                throw new Error('Produk tidak ditemukan');
            }

            if (product.sellerId !== sellerId) {
                throw new Error('Anda tidak memiliki akses ke produk ini');
            }

            return await Product.update(productId, updateData);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Publish produk
     */
    static async publishProduct(productId, sellerId) {
        try {
            const product = await Product.getById(productId);

            if (!product) {
                throw new Error('Produk tidak ditemukan');
            }

            if (product.sellerId !== sellerId) {
                throw new Error('Anda tidak memiliki akses ke produk ini');
            }

            return await Product.update(productId, { status: PRODUCT_STATUS.ACTIVE });
        } catch (error) {
            throw error;
        }
    }

    /**
     * Hapus produk
     */
    static async deleteProduct(productId, sellerId) {
        try {
            const product = await Product.getById(productId);

            if (!product) {
                throw new Error('Produk tidak ditemukan');
            }

            if (product.sellerId !== sellerId) {
                throw new Error('Anda tidak memiliki akses ke produk ini');
            }

            await Product.delete(productId);
            return true;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Update stok produk
     */
    static async updateStock(productId, sellerId, quantity) {
        try {
            const product = await Product.getById(productId);

            if (!product) {
                throw new Error('Produk tidak ditemukan');
            }

            if (product.sellerId !== sellerId) {
                throw new Error('Anda tidak memiliki akses ke produk ini');
            }

            return await Product.updateStock(productId, quantity);
        } catch (error) {
            throw error;
        }
    }

    // ==================== CART ====================

    /**
     * Mendapatkan keranjang user
     */
    static async getCart(userId) {
        try {
            return await Cart.getCartWithProducts(userId);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Menambah item ke keranjang
     */
    static async addToCart(userId, productId, quantity = 1) {
        try {
            const product = await Product.getById(productId);

            if (!product) {
                throw new Error('Produk tidak ditemukan');
            }

            if (product.status !== PRODUCT_STATUS.ACTIVE) {
                throw new Error('Produk tidak tersedia');
            }

            if (product.stock < quantity) {
                throw new Error('Stok tidak mencukupi');
            }

            return await Cart.addItem(userId, productId, quantity);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Update jumlah item di keranjang
     */
    static async updateCartItem(userId, productId, quantity) {
        try {
            if (quantity > 0) {
                const product = await Product.getById(productId);
                if (product && product.stock < quantity) {
                    throw new Error('Stok tidak mencukupi');
                }
            }

            return await Cart.updateItemQuantity(userId, productId, quantity);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Hapus item dari keranjang
     */
    static async removeFromCart(userId, productId) {
        try {
            return await Cart.removeItem(userId, productId);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Kosongkan keranjang
     */
    static async clearCart(userId) {
        try {
            return await Cart.clearCart(userId);
        } catch (error) {
            throw error;
        }
    }

    // ==================== ORDERS ====================

    /**
     * Membuat pesanan dari keranjang
     */
    static async createOrder(userId, orderData) {
        try {
            const cart = await Cart.getCartWithProducts(userId);

            if (!cart.items || cart.items.length === 0) {
                throw new Error('Keranjang kosong');
            }

            // Validasi stok dan hitung total
            let subtotal = 0;
            const orderItems = [];
            const productsBySeller = {};

            for (const item of cart.items) {
                const product = item.product;

                if (!product || product.status !== PRODUCT_STATUS.ACTIVE) {
                    throw new Error(`Produk ${product?.name || 'unknown'} tidak tersedia`);
                }

                if (product.stock < item.quantity) {
                    throw new Error(`Stok ${product.name} tidak mencukupi`);
                }

                const itemSubtotal = (product.salePrice || product.price) * item.quantity;
                subtotal += itemSubtotal;

                orderItems.push({
                    productId: product.id,
                    name: product.name,
                    price: product.salePrice || product.price,
                    quantity: item.quantity,
                    subtotal: itemSubtotal,
                    image: product.images[0] || '',
                });

                // Group by seller
                if (!productsBySeller[product.sellerId]) {
                    productsBySeller[product.sellerId] = [];
                }
                productsBySeller[product.sellerId].push(item);
            }

            // Untuk saat ini, buat satu order (bisa dikembangkan untuk multi-seller)
            const sellerId = cart.items[0].product.sellerId;

            const order = await Order.create({
                buyerId: userId,
                sellerId: sellerId,
                items: orderItems,
                subtotal,
                shippingCost: orderData.shippingCost || 0,
                tax: orderData.tax || 0,
                discount: orderData.discount || 0,
                total: subtotal + (orderData.shippingCost || 0) + (orderData.tax || 0) - (orderData.discount || 0),
                shippingAddress: orderData.shippingAddress,
                shippingMethod: orderData.shippingMethod,
                paymentMethod: orderData.paymentMethod,
                notes: orderData.notes,
            });

            // Update stok produk
            for (const item of cart.items) {
                await Product.updateStock(item.productId, -item.quantity);
            }

            // Kosongkan keranjang
            await Cart.clearCart(userId);

            return order;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Mendapatkan pesanan berdasarkan ID
     */
    static async getOrderById(orderId) {
        try {
            const order = await Order.getById(orderId);
            if (!order) {
                throw new Error('Pesanan tidak ditemukan');
            }
            return order;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Mendapatkan pesanan berdasarkan nomor order
     */
    static async getOrderByNumber(orderNumber) {
        try {
            const order = await Order.getByOrderNumber(orderNumber);
            if (!order) {
                throw new Error('Pesanan tidak ditemukan');
            }
            return order;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Mendapatkan pesanan user (buyer)
     */
    static async getOrdersByBuyer(buyerId, page = 1, limit = 10, filters = {}) {
        try {
            return await Order.getByBuyerId(buyerId, page, limit, filters);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Mendapatkan pesanan seller
     */
    static async getOrdersBySeller(sellerId, page = 1, limit = 10, filters = {}) {
        try {
            return await Order.getBySellerId(sellerId, page, limit, filters);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Update status pesanan
     */
    static async updateOrderStatus(orderId, sellerId, status, note = '') {
        try {
            const order = await Order.getById(orderId);

            if (!order) {
                throw new Error('Pesanan tidak ditemukan');
            }

            if (order.sellerId !== sellerId) {
                throw new Error('Anda tidak memiliki akses ke pesanan ini');
            }

            return await Order.updateStatus(orderId, status, note);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Batalkan pesanan
     */
    static async cancelOrder(orderId, userId, reason = '') {
        try {
            const order = await Order.getById(orderId);

            if (!order) {
                throw new Error('Pesanan tidak ditemukan');
            }

            // Hanya buyer atau seller yang bisa membatalkan
            if (order.buyerId !== userId && order.sellerId !== userId) {
                throw new Error('Anda tidak memiliki akses ke pesanan ini');
            }

            // Hanya bisa cancel jika status masih pending atau confirmed
            if (![ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED].includes(order.status)) {
                throw new Error('Pesanan tidak dapat dibatalkan');
            }

            // Return stock
            for (const item of order.items) {
                await Product.updateStock(item.productId, item.quantity);
            }

            return await Order.updateStatus(orderId, ORDER_STATUS.CANCELLED, reason);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Konfirmasi pembayaran
     */
    static async confirmPayment(orderId, paymentDetails) {
        try {
            const order = await Order.getById(orderId);

            if (!order) {
                throw new Error('Pesanan tidak ditemukan');
            }

            await Order.update(orderId, {
                paymentStatus: 'paid',
                paymentDetails,
            });

            await Order.updateStatus(orderId, ORDER_STATUS.CONFIRMED, 'Pembayaran dikonfirmasi');

            return await Order.getById(orderId);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Mendapatkan statistik order seller
     */
    static async getOrderStats(sellerId) {
        try {
            return await Order.getOrderStats(sellerId);
        } catch (error) {
            throw error;
        }
    }
}

module.exports = MarketplaceService;
