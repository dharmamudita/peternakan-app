/**
 * Product Model (FIXED SORTING & FILTERING)
 * Sorting dilakukan in-memory untuk menghindari masalah Firebase Indexing.
 */

const { db } = require('../config/firebase');
const { COLLECTIONS, PRODUCT_STATUS } = require('../config/constants');

class Product {
    constructor(data) {
        this.id = data.id || null;
        this.sellerId = data.sellerId || '';
        this.farmId = data.farmId || null;
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
        this.unit = data.unit || 'pcs';
        this.minOrder = data.minOrder || 1;
        this.weight = data.weight || 0;
        this.dimensions = data.dimensions || { length: 0, width: 0, height: 0 };
        this.specifications = data.specifications || {};
        this.tags = data.tags || [];
        this.status = data.status || PRODUCT_STATUS.DRAFT;
        this.isFeatured = data.isFeatured || false;
        this.rating = data.rating || 0;
        this.totalReviews = data.totalReviews || 0;
        this.totalSold = data.totalSold || 0;
        this.views = data.views || 0;

        // Helper untuk parse date dengan aman
        const parseDate = (d) => {
            if (!d) return new Date();
            if (typeof d.toDate === 'function') return d.toDate();
            const parsed = new Date(d);
            return isNaN(parsed.getTime()) ? new Date() : parsed;
        };

        this.createdAt = parseDate(data.createdAt);
        this.updatedAt = parseDate(data.updatedAt);
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
        return name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
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
            .limit(1)
            .get();

        if (snapshot.empty) return null;
        const doc = snapshot.docs[0];
        return new Product({ id: doc.id, ...doc.data() });
    }

    /**
     * Get All dengan In-Memory Sorting untuk workaround masalah Indexing
     */
    static async getAll(page = 1, limit = 10, filters = {}) {
        let query = db.collection(COLLECTIONS.PRODUCTS);

        // Filter Fundamental (Status)
        // Jika filters.status === 'all', jangan filter.
        if (filters.status !== 'all') {
            const status = filters.status || PRODUCT_STATUS.ACTIVE;
            query = query.where('status', '==', status);
        }

        // Filter Lainnya
        if (filters.categoryId) query = query.where('categoryId', '==', filters.categoryId);
        if (filters.sellerId) query = query.where('sellerId', '==', filters.sellerId);
        if (filters.isFeatured !== undefined) query = query.where('isFeatured', '==', filters.isFeatured);

        // Fetch ALL matching specs (Warning: Data besar might be slow, but safe for startup)
        console.log(`[DEBUG] Executing Query: Products, Filters:`, JSON.stringify(filters));
        const snapshot = await query.get();
        console.log(`[DEBUG] Snapshot size: ${snapshot.size}`);
        let products = snapshot.docs.map(doc => {
            const data = doc.data();
            // console.log(`[DEBUG] Found product: ${doc.id}, Seller: ${data.sellerId}, Status: ${data.status}`);
            return new Product({ id: doc.id, ...data });
        });

        // Price filtering (In-Memory)
        if (filters.minPrice) products = products.filter(p => p.price >= filters.minPrice);
        if (filters.maxPrice) products = products.filter(p => p.price <= filters.maxPrice);

        // Sorting (In-Memory)
        // Default: Newest first
        products.sort((a, b) => b.createdAt - a.createdAt);

        // Pagination (In-Memory)
        const total = products.length;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const slicedProducts = products.slice(startIndex, endIndex);

        return {
            data: slicedProducts,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    static async search(searchTerm, page = 1, limit = 10) {
        // Fallback search: fetch active products and filter name in-memory
        const snapshot = await db.collection(COLLECTIONS.PRODUCTS)
            .where('status', '==', PRODUCT_STATUS.ACTIVE)
            .get();

        let products = snapshot.docs.map(doc => new Product({ id: doc.id, ...doc.data() }));

        const lowerTerm = searchTerm.toLowerCase();
        products = products.filter(p =>
            p.name.toLowerCase().includes(lowerTerm) ||
            p.description.toLowerCase().includes(lowerTerm)
        );

        return products.slice(0, limit);
    }

    static async update(id, updateData) {
        updateData.updatedAt = new Date();
        await db.collection(COLLECTIONS.PRODUCTS).doc(id).update(updateData);
        return await Product.getById(id);
    }

    static async delete(id) {
        await db.collection(COLLECTIONS.PRODUCTS).doc(id).delete(); // Hard delete for dev, or Soft delete
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

    static async incrementViews(id) { /* ... */ }
    static async updateRating(id, newRating, totalReviews) { /* ... */ }

    static async getFeaturedProducts(limit = 8) {
        return (await this.getAll(1, limit, { isFeatured: true })).data;
    }

    static async getBestSellers(limit = 8) {
        return (await this.getAll(1, limit, {})).data; // Placeholder logic
    }

    // Recalculate product rating
    static async recalculateRating(productId) {
        const snapshot = await db.collection(COLLECTIONS.PRODUCTS || 'products').doc(productId).collection('reviews').get();
        // Wait, reviews are in a top-level collection 'reviews' or subcollection?
        // In Order.js: db.collection('reviews').add(...)

        const reviewSnapshot = await db.collection('reviews')
            .where('productId', '==', productId)
            .get();

        if (reviewSnapshot.empty) return;

        const ratings = reviewSnapshot.docs.map(doc => Number(doc.data().rating));
        const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;

        await db.collection(COLLECTIONS.PRODUCTS || 'products').doc(productId).update({
            rating: Number(avg.toFixed(1)),
            totalReviews: ratings.length
        });
    }
}

module.exports = Product;
