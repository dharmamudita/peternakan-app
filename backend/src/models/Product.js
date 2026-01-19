/**
 * Product Model
 * Model untuk produk di marketplace
 */

const { db } = require('../config/firebase');
const { COLLECTIONS, PRODUCT_STATUS } = require('../config/constants');

class Product {
    constructor(data) {
        this.id = data.id || null;
        this.sellerId = data.sellerId || '';
        this.farmId = data.farmId || null; // Opsional, jika produk dari peternakan
        this.categoryId = data.categoryId || '';
        this.name = data.name || '';
        this.slug = data.slug || '';
        this.description = data.description || '';
        this.shortDescription = data.shortDescription || '';
        this.images = data.images || [];
        this.price = data.price || 0;
        this.salePrice = data.salePrice || null;
        this.currency = data.currency || 'IDR';
        this.stock = data.stock || 0;
        this.sku = data.sku || '';
        this.unit = data.unit || 'pcs'; // pcs, kg, liter, ekor, dll
        this.minOrder = data.minOrder || 1;
        this.weight = data.weight || 0; // Berat untuk pengiriman (gram)
        this.dimensions = data.dimensions || {
            length: 0,
            width: 0,
            height: 0,
        };
        this.specifications = data.specifications || {}; // Spesifikasi produk
        this.tags = data.tags || [];
        this.status = data.status || PRODUCT_STATUS.DRAFT;
        this.isFeatured = data.isFeatured || false;
        this.rating = data.rating || 0;
        this.totalReviews = data.totalReviews || 0;
        this.totalSold = data.totalSold || 0;
        this.views = data.views || 0;
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = data.updatedAt || new Date();
    }

    toJSON() {
        return {
            id: this.id,
            sellerId: this.sellerId,
            farmId: this.farmId,
            categoryId: this.categoryId,
            name: this.name,
            slug: this.slug,
            description: this.description,
            shortDescription: this.shortDescription,
            images: this.images,
            price: this.price,
            salePrice: this.salePrice,
            currency: this.currency,
            stock: this.stock,
            sku: this.sku,
            unit: this.unit,
            minOrder: this.minOrder,
            weight: this.weight,
            dimensions: this.dimensions,
            specifications: this.specifications,
            tags: this.tags,
            status: this.status,
            isFeatured: this.isFeatured,
            rating: this.rating,
            totalReviews: this.totalReviews,
            totalSold: this.totalSold,
            views: this.views,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }

    toFirestore() {
        const data = this.toJSON();
        delete data.id;
        return data;
    }

    static generateSlug(name) {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    }

    static async create(productData) {
        const product = new Product(productData);
        if (!product.slug) {
            product.slug = Product.generateSlug(product.name) + '-' + Date.now();
        }
        const docRef = await db.collection(COLLECTIONS.PRODUCTS).add(product.toFirestore());
        product.id = docRef.id;
        return product;
    }

    static async getById(id) {
        const doc = await db.collection(COLLECTIONS.PRODUCTS).doc(id).get();
        if (!doc.exists) return null;
        return new Product({ id: doc.id, ...doc.data() });
    }

    static async getBySlug(slug) {
        const snapshot = await db.collection(COLLECTIONS.PRODUCTS)
            .where('slug', '==', slug)
            .where('status', '==', PRODUCT_STATUS.ACTIVE)
            .limit(1)
            .get();

        if (snapshot.empty) return null;
        const doc = snapshot.docs[0];
        return new Product({ id: doc.id, ...doc.data() });
    }

    static async getAll(page = 1, limit = 10, filters = {}) {
        let query = db.collection(COLLECTIONS.PRODUCTS);

        // Default: hanya produk aktif
        if (filters.status) {
            query = query.where('status', '==', filters.status);
        } else {
            query = query.where('status', '==', PRODUCT_STATUS.ACTIVE);
        }

        if (filters.categoryId) {
            query = query.where('categoryId', '==', filters.categoryId);
        }
        if (filters.sellerId) {
            query = query.where('sellerId', '==', filters.sellerId);
        }
        if (filters.isFeatured !== undefined) {
            query = query.where('isFeatured', '==', filters.isFeatured);
        }
        if (filters.minPrice) {
            query = query.where('price', '>=', filters.minPrice);
        }
        if (filters.maxPrice) {
            query = query.where('price', '<=', filters.maxPrice);
        }

        const countSnapshot = await query.get();
        const total = countSnapshot.size;

        // Sorting
        const sortBy = filters.sortBy || 'createdAt';
        const sortOrder = filters.sortOrder || 'desc';
        query = query.orderBy(sortBy, sortOrder)
            .offset((page - 1) * limit)
            .limit(limit);

        const snapshot = await query.get();
        const products = snapshot.docs.map(doc => new Product({ id: doc.id, ...doc.data() }));

        return {
            data: products,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    static async search(searchTerm, page = 1, limit = 10) {
        // Firestore tidak mendukung full-text search secara native
        // Untuk implementasi yang lebih baik, pertimbangkan Algolia atau Elasticsearch
        const snapshot = await db.collection(COLLECTIONS.PRODUCTS)
            .where('status', '==', PRODUCT_STATUS.ACTIVE)
            .orderBy('name')
            .startAt(searchTerm)
            .endAt(searchTerm + '\uf8ff')
            .limit(limit)
            .get();

        return snapshot.docs.map(doc => new Product({ id: doc.id, ...doc.data() }));
    }

    static async update(id, updateData) {
        updateData.updatedAt = new Date();
        await db.collection(COLLECTIONS.PRODUCTS).doc(id).update(updateData);
        return await Product.getById(id);
    }

    static async delete(id) {
        await db.collection(COLLECTIONS.PRODUCTS).doc(id).update({
            status: PRODUCT_STATUS.DELETED,
            updatedAt: new Date(),
        });
        return true;
    }

    static async updateStock(id, quantity) {
        const product = await Product.getById(id);
        if (!product) return null;

        const newStock = product.stock + quantity;
        await db.collection(COLLECTIONS.PRODUCTS).doc(id).update({
            stock: newStock,
            status: newStock <= 0 ? PRODUCT_STATUS.OUT_OF_STOCK : product.status,
            updatedAt: new Date(),
        });
        return await Product.getById(id);
    }

    static async incrementViews(id) {
        const product = await Product.getById(id);
        if (!product) return;

        await db.collection(COLLECTIONS.PRODUCTS).doc(id).update({
            views: product.views + 1,
        });
    }

    static async updateRating(id, newRating, totalReviews) {
        await db.collection(COLLECTIONS.PRODUCTS).doc(id).update({
            rating: newRating,
            totalReviews: totalReviews,
            updatedAt: new Date(),
        });
    }

    static async getFeaturedProducts(limit = 8) {
        const snapshot = await db.collection(COLLECTIONS.PRODUCTS)
            .where('status', '==', PRODUCT_STATUS.ACTIVE)
            .where('isFeatured', '==', true)
            .orderBy('createdAt', 'desc')
            .limit(limit)
            .get();

        return snapshot.docs.map(doc => new Product({ id: doc.id, ...doc.data() }));
    }

    static async getBestSellers(limit = 8) {
        const snapshot = await db.collection(COLLECTIONS.PRODUCTS)
            .where('status', '==', PRODUCT_STATUS.ACTIVE)
            .orderBy('totalSold', 'desc')
            .limit(limit)
            .get();

        return snapshot.docs.map(doc => new Product({ id: doc.id, ...doc.data() }));
    }
}

module.exports = Product;
