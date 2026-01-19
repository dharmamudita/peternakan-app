/**
 * Course Model
 * Model untuk kursus/pelatihan edukasi
 */

const { db } = require('../config/firebase');
const { COLLECTIONS, COURSE_STATUS, DIFFICULTY_LEVELS } = require('../config/constants');

class Course {
    constructor(data) {
        this.id = data.id || null;
        this.instructorId = data.instructorId || '';
        this.title = data.title || '';
        this.slug = data.slug || '';
        this.description = data.description || '';
        this.shortDescription = data.shortDescription || '';
        this.thumbnail = data.thumbnail || '';
        this.coverImage = data.coverImage || '';
        this.category = data.category || '';
        this.tags = data.tags || [];
        this.difficulty = data.difficulty || DIFFICULTY_LEVELS.BEGINNER;
        this.duration = data.duration || 0; // Total durasi dalam menit
        this.totalModules = data.totalModules || 0;
        this.totalLessons = data.totalLessons || 0;
        this.requirements = data.requirements || [];
        this.whatYouWillLearn = data.whatYouWillLearn || [];
        this.targetAudience = data.targetAudience || [];
        this.price = data.price || 0;
        this.isFree = data.isFree || false;
        this.status = data.status || COURSE_STATUS.DRAFT;
        this.rating = data.rating || 0;
        this.totalReviews = data.totalReviews || 0;
        this.totalEnrollments = data.totalEnrollments || 0;
        this.isFeatured = data.isFeatured || false;
        this.hasCertificate = data.hasCertificate || false;
        this.language = data.language || 'Indonesia';
        this.publishedAt = data.publishedAt || null;
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = data.updatedAt || new Date();
    }

    toJSON() {
        return {
            id: this.id,
            instructorId: this.instructorId,
            title: this.title,
            slug: this.slug,
            description: this.description,
            shortDescription: this.shortDescription,
            thumbnail: this.thumbnail,
            coverImage: this.coverImage,
            category: this.category,
            tags: this.tags,
            difficulty: this.difficulty,
            duration: this.duration,
            totalModules: this.totalModules,
            totalLessons: this.totalLessons,
            requirements: this.requirements,
            whatYouWillLearn: this.whatYouWillLearn,
            targetAudience: this.targetAudience,
            price: this.price,
            isFree: this.isFree,
            status: this.status,
            rating: this.rating,
            totalReviews: this.totalReviews,
            totalEnrollments: this.totalEnrollments,
            isFeatured: this.isFeatured,
            hasCertificate: this.hasCertificate,
            language: this.language,
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

    static async create(courseData) {
        const course = new Course(courseData);
        if (!course.slug) {
            course.slug = Course.generateSlug(course.title) + '-' + Date.now();
        }
        const docRef = await db.collection(COLLECTIONS.COURSES).add(course.toFirestore());
        course.id = docRef.id;
        return course;
    }

    static async getById(id) {
        const doc = await db.collection(COLLECTIONS.COURSES).doc(id).get();
        if (!doc.exists) return null;
        return new Course({ id: doc.id, ...doc.data() });
    }

    static async getBySlug(slug) {
        const snapshot = await db.collection(COLLECTIONS.COURSES)
            .where('slug', '==', slug)
            .where('status', '==', COURSE_STATUS.PUBLISHED)
            .limit(1)
            .get();

        if (snapshot.empty) return null;
        const doc = snapshot.docs[0];
        return new Course({ id: doc.id, ...doc.data() });
    }

    static async getAll(page = 1, limit = 10, filters = {}) {
        let query = db.collection(COLLECTIONS.COURSES);

        if (filters.status) {
            query = query.where('status', '==', filters.status);
        } else {
            query = query.where('status', '==', COURSE_STATUS.PUBLISHED);
        }

        if (filters.category) {
            query = query.where('category', '==', filters.category);
        }
        if (filters.difficulty) {
            query = query.where('difficulty', '==', filters.difficulty);
        }
        if (filters.isFree !== undefined) {
            query = query.where('isFree', '==', filters.isFree);
        }
        if (filters.isFeatured !== undefined) {
            query = query.where('isFeatured', '==', filters.isFeatured);
        }
        if (filters.instructorId) {
            query = query.where('instructorId', '==', filters.instructorId);
        }

        const countSnapshot = await query.get();
        const total = countSnapshot.size;

        const sortBy = filters.sortBy || 'createdAt';
        const sortOrder = filters.sortOrder || 'desc';
        query = query.orderBy(sortBy, sortOrder)
            .offset((page - 1) * limit)
            .limit(limit);

        const snapshot = await query.get();
        const courses = snapshot.docs.map(doc => new Course({ id: doc.id, ...doc.data() }));

        return {
            data: courses,
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
        await db.collection(COLLECTIONS.COURSES).doc(id).update(updateData);
        return await Course.getById(id);
    }

    static async publish(id) {
        await db.collection(COLLECTIONS.COURSES).doc(id).update({
            status: COURSE_STATUS.PUBLISHED,
            publishedAt: new Date(),
            updatedAt: new Date(),
        });
        return await Course.getById(id);
    }

    static async archive(id) {
        await db.collection(COLLECTIONS.COURSES).doc(id).update({
            status: COURSE_STATUS.ARCHIVED,
            updatedAt: new Date(),
        });
        return await Course.getById(id);
    }

    static async delete(id) {
        await db.collection(COLLECTIONS.COURSES).doc(id).delete();
        return true;
    }

    static async incrementEnrollment(id) {
        const course = await Course.getById(id);
        if (!course) return;

        await db.collection(COLLECTIONS.COURSES).doc(id).update({
            totalEnrollments: course.totalEnrollments + 1,
        });
    }

    static async updateRating(id, newRating, totalReviews) {
        await db.collection(COLLECTIONS.COURSES).doc(id).update({
            rating: newRating,
            totalReviews: totalReviews,
            updatedAt: new Date(),
        });
    }

    static async getFeaturedCourses(limit = 6) {
        const snapshot = await db.collection(COLLECTIONS.COURSES)
            .where('status', '==', COURSE_STATUS.PUBLISHED)
            .where('isFeatured', '==', true)
            .orderBy('createdAt', 'desc')
            .limit(limit)
            .get();

        return snapshot.docs.map(doc => new Course({ id: doc.id, ...doc.data() }));
    }

    static async getPopularCourses(limit = 6) {
        const snapshot = await db.collection(COLLECTIONS.COURSES)
            .where('status', '==', COURSE_STATUS.PUBLISHED)
            .orderBy('totalEnrollments', 'desc')
            .limit(limit)
            .get();

        return snapshot.docs.map(doc => new Course({ id: doc.id, ...doc.data() }));
    }
}

module.exports = Course;
