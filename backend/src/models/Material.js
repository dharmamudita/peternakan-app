/**
 * Material Model
 * Model untuk materi edukasi (artikel, video, pdf, dll)
 */

const { db } = require('../config/firebase');
const { COLLECTIONS, MATERIAL_TYPES, DIFFICULTY_LEVELS } = require('../config/constants');

class Material {
    constructor(data) {
        this.id = data.id || null;
        this.authorId = data.authorId || '';
        this.title = data.title || '';
        this.slug = data.slug || '';
        this.content = data.content || ''; // Konten artikel (HTML/Markdown)
        this.excerpt = data.excerpt || '';
        this.type = data.type || MATERIAL_TYPES.ARTICLE;
        this.categoryId = data.categoryId || '';
        this.tags = data.tags || [];
        this.thumbnail = data.thumbnail || '';
        this.mediaUrl = data.mediaUrl || ''; // URL video/pdf/audio
        this.duration = data.duration || 0; // Durasi dalam menit (untuk video/audio)
        this.difficulty = data.difficulty || DIFFICULTY_LEVELS.BEGINNER;
        this.relatedAnimals = data.relatedAnimals || []; // Jenis hewan terkait
        this.views = data.views || 0;
        this.likes = data.likes || 0;
        this.bookmarks = data.bookmarks || 0;
        this.isPublished = data.isPublished || false;
        this.isFeatured = data.isFeatured || false;
        this.isPremium = data.isPremium || false;
        this.publishedAt = data.publishedAt || null;
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = data.updatedAt || new Date();
    }

    toJSON() {
        return {
            id: this.id,
            authorId: this.authorId,
            title: this.title,
            slug: this.slug,
            content: this.content,
            excerpt: this.excerpt,
            type: this.type,
            categoryId: this.categoryId,
            tags: this.tags,
            thumbnail: this.thumbnail,
            mediaUrl: this.mediaUrl,
            duration: this.duration,
            difficulty: this.difficulty,
            relatedAnimals: this.relatedAnimals,
            views: this.views,
            likes: this.likes,
            bookmarks: this.bookmarks,
            isPublished: this.isPublished,
            isFeatured: this.isFeatured,
            isPremium: this.isPremium,
            publishedAt: this.publishedAt,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }

    toFirestore() {
        const data = this.toJSON();
        delete data.id;
        return data;
    }

    static generateSlug(title) {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    }

    static async create(materialData) {
        const material = new Material(materialData);
        if (!material.slug) {
            material.slug = Material.generateSlug(material.title) + '-' + Date.now();
        }
        const docRef = await db.collection(COLLECTIONS.MATERIALS).add(material.toFirestore());
        material.id = docRef.id;
        return material;
    }

    static async getById(id) {
        const doc = await db.collection(COLLECTIONS.MATERIALS).doc(id).get();
        if (!doc.exists) return null;
        return new Material({ id: doc.id, ...doc.data() });
    }

    static async getBySlug(slug) {
        const snapshot = await db.collection(COLLECTIONS.MATERIALS)
            .where('slug', '==', slug)
            .where('isPublished', '==', true)
            .limit(1)
            .get();

        if (snapshot.empty) return null;
        const doc = snapshot.docs[0];
        return new Material({ id: doc.id, ...doc.data() });
    }

    static async getAll(page = 1, limit = 10, filters = {}) {
        let query = db.collection(COLLECTIONS.MATERIALS);

        if (filters.isPublished !== undefined) {
            query = query.where('isPublished', '==', filters.isPublished);
        } else {
            query = query.where('isPublished', '==', true);
        }

        if (filters.type) {
            query = query.where('type', '==', filters.type);
        }
        if (filters.categoryId) {
            query = query.where('categoryId', '==', filters.categoryId);
        }
        if (filters.difficulty) {
            query = query.where('difficulty', '==', filters.difficulty);
        }
        if (filters.isFeatured !== undefined) {
            query = query.where('isFeatured', '==', filters.isFeatured);
        }
        if (filters.isPremium !== undefined) {
            query = query.where('isPremium', '==', filters.isPremium);
        }
        if (filters.authorId) {
            query = query.where('authorId', '==', filters.authorId);
        }

        const countSnapshot = await query.get();
        const total = countSnapshot.size;

        const sortBy = filters.sortBy || 'createdAt';
        const sortOrder = filters.sortOrder || 'desc';
        query = query
            .offset((page - 1) * limit)
            .limit(limit);

        const snapshot = await query.get();
        const materials = snapshot.docs.map(doc => new Material({ id: doc.id, ...doc.data() }));

        return {
            data: materials,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    static async getByAnimalType(animalType, page = 1, limit = 10) {
        let query = db.collection(COLLECTIONS.MATERIALS)
            .where('isPublished', '==', true)
            .where('relatedAnimals', 'array-contains', animalType);

        const countSnapshot = await query.get();
        const total = countSnapshot.size;

        query = query
            .offset((page - 1) * limit)
            .limit(limit);

        const snapshot = await query.get();
        const materials = snapshot.docs.map(doc => new Material({ id: doc.id, ...doc.data() }));

        return {
            data: materials,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    static async update(id, updateData) {
        updateData.updatedAt = new Date();
        await db.collection(COLLECTIONS.MATERIALS).doc(id).update(updateData);
        return await Material.getById(id);
    }

    static async publish(id) {
        await db.collection(COLLECTIONS.MATERIALS).doc(id).update({
            isPublished: true,
            publishedAt: new Date(),
            updatedAt: new Date(),
        });
        return await Material.getById(id);
    }

    static async unpublish(id) {
        await db.collection(COLLECTIONS.MATERIALS).doc(id).update({
            isPublished: false,
            updatedAt: new Date(),
        });
        return await Material.getById(id);
    }

    static async delete(id) {
        await db.collection(COLLECTIONS.MATERIALS).doc(id).delete();
        return true;
    }

    static async incrementViews(id) {
        const material = await Material.getById(id);
        if (!material) return;

        await db.collection(COLLECTIONS.MATERIALS).doc(id).update({
            views: material.views + 1,
        });
    }

    static async incrementLikes(id) {
        const material = await Material.getById(id);
        if (!material) return;

        await db.collection(COLLECTIONS.MATERIALS).doc(id).update({
            likes: material.likes + 1,
        });
    }

    static async decrementLikes(id) {
        const material = await Material.getById(id);
        if (!material || material.likes <= 0) return;

        await db.collection(COLLECTIONS.MATERIALS).doc(id).update({
            likes: material.likes - 1,
        });
    }

    static async getFeaturedMaterials(limit = 6) {
        const snapshot = await db.collection(COLLECTIONS.MATERIALS)
            .where('isPublished', '==', true)
            .where('isFeatured', '==', true)
            .limit(limit)
            .get();

        return snapshot.docs.map(doc => new Material({ id: doc.id, ...doc.data() }));
    }

    static async getPopularMaterials(limit = 6) {
        const snapshot = await db.collection(COLLECTIONS.MATERIALS)
            .where('isPublished', '==', true)
            .limit(limit)
            .get();

        return snapshot.docs.map(doc => new Material({ id: doc.id, ...doc.data() }));
    }
}

module.exports = Material;
