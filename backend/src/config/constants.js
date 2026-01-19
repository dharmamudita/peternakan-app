/**
 * Konstanta Aplikasi
 * Berisi semua konstanta yang digunakan di seluruh aplikasi
 */

// Nama-nama koleksi Firestore
const COLLECTIONS = {
    // User & Auth
    USERS: 'users',
    USER_PROFILES: 'user_profiles',

    // Manajemen Peternakan
    FARMS: 'farms',                    // Data peternakan
    ANIMALS: 'animals',                // Data hewan
    ANIMAL_CATEGORIES: 'animal_categories', // Kategori hewan (sapi, kambing, ayam, dll)
    HEALTH_RECORDS: 'health_records',  // Catatan kesehatan hewan
    FEEDING_SCHEDULES: 'feeding_schedules', // Jadwal pemberian pakan
    BREEDING_RECORDS: 'breeding_records',   // Catatan breeding
    PRODUCTION_RECORDS: 'production_records', // Catatan produksi (susu, telur, dll)

    // Marketplace
    PRODUCTS: 'products',              // Produk yang dijual
    PRODUCT_CATEGORIES: 'product_categories', // Kategori produk
    ORDERS: 'orders',                  // Pesanan
    ORDER_ITEMS: 'order_items',        // Item dalam pesanan
    CARTS: 'carts',                    // Keranjang belanja
    REVIEWS: 'reviews',                // Review produk
    WISHLISTS: 'wishlists',            // Wishlist user

    // Edukasi
    COURSES: 'courses',                // Kursus/Pelatihan
    COURSE_MODULES: 'course_modules',  // Modul dalam kursus
    LESSONS: 'lessons',                // Materi pelajaran
    MATERIALS: 'materials',            // Materi edukasi (artikel, video)
    MATERIAL_CATEGORIES: 'material_categories', // Kategori materi
    QUIZZES: 'quizzes',                // Kuis
    QUIZ_QUESTIONS: 'quiz_questions',  // Pertanyaan kuis
    USER_PROGRESS: 'user_progress',    // Progress belajar user
    CERTIFICATES: 'certificates',      // Sertifikat yang diperoleh

    // Notifikasi & Umum
    NOTIFICATIONS: 'notifications',    // Notifikasi
    SETTINGS: 'settings',              // Pengaturan
};

// Role user
const USER_ROLES = {
    ADMIN: 'admin',
    FARMER: 'farmer',          // Peternak
    SELLER: 'seller',          // Penjual di marketplace
    BUYER: 'buyer',            // Pembeli
    INSTRUCTOR: 'instructor',  // Instruktur/Pengajar
    USER: 'user',              // User biasa
};

// Status pesanan
const ORDER_STATUS = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    REFUNDED: 'refunded',
};

// Status produk
const PRODUCT_STATUS = {
    DRAFT: 'draft',
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    OUT_OF_STOCK: 'out_of_stock',
    DELETED: 'deleted',
};

// Kategori hewan default
const ANIMAL_TYPES = {
    CATTLE: 'sapi',
    GOAT: 'kambing',
    SHEEP: 'domba',
    CHICKEN: 'ayam',
    DUCK: 'bebek',
    RABBIT: 'kelinci',
    PIG: 'babi',
    FISH: 'ikan',
    OTHER: 'lainnya',
};

// Status kesehatan hewan
const HEALTH_STATUS = {
    HEALTHY: 'sehat',
    SICK: 'sakit',
    RECOVERING: 'masa_pemulihan',
    QUARANTINE: 'karantina',
    DECEASED: 'mati',
};

// Status kursus
const COURSE_STATUS = {
    DRAFT: 'draft',
    PUBLISHED: 'published',
    ARCHIVED: 'archived',
};

// Tipe materi edukasi
const MATERIAL_TYPES = {
    ARTICLE: 'artikel',
    VIDEO: 'video',
    PDF: 'pdf',
    INFOGRAPHIC: 'infografis',
    AUDIO: 'audio',
};

// Level kesulitan materi
const DIFFICULTY_LEVELS = {
    BEGINNER: 'pemula',
    INTERMEDIATE: 'menengah',
    ADVANCED: 'lanjutan',
};

// Response messages
const MESSAGES = {
    SUCCESS: {
        CREATED: 'Data berhasil dibuat',
        UPDATED: 'Data berhasil diperbarui',
        DELETED: 'Data berhasil dihapus',
        FETCHED: 'Data berhasil diambil',
        LOGIN: 'Login berhasil',
        REGISTER: 'Registrasi berhasil',
        LOGOUT: 'Logout berhasil',
    },
    ERROR: {
        NOT_FOUND: 'Data tidak ditemukan',
        UNAUTHORIZED: 'Akses tidak diizinkan',
        FORBIDDEN: 'Anda tidak memiliki akses',
        VALIDATION: 'Validasi gagal',
        SERVER: 'Terjadi kesalahan server',
        DUPLICATE: 'Data sudah ada',
        INVALID_TOKEN: 'Token tidak valid',
        EXPIRED_TOKEN: 'Token sudah kadaluarsa',
    },
};

// Pagination defaults
const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
};

module.exports = {
    COLLECTIONS,
    USER_ROLES,
    ORDER_STATUS,
    PRODUCT_STATUS,
    ANIMAL_TYPES,
    HEALTH_STATUS,
    COURSE_STATUS,
    MATERIAL_TYPES,
    DIFFICULTY_LEVELS,
    MESSAGES,
    PAGINATION,
};
