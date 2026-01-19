/**
 * Validation Middleware
 * Middleware untuk validasi input request
 */

const { MESSAGES } = require('../config/constants');

/**
 * Generic validator
 */
const validate = (schema) => {
    return (req, res, next) => {
        const errors = [];

        // Validate body
        if (schema.body) {
            const bodyErrors = validateObject(req.body, schema.body, 'body');
            errors.push(...bodyErrors);
        }

        // Validate params
        if (schema.params) {
            const paramErrors = validateObject(req.params, schema.params, 'params');
            errors.push(...paramErrors);
        }

        // Validate query
        if (schema.query) {
            const queryErrors = validateObject(req.query, schema.query, 'query');
            errors.push(...queryErrors);
        }

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: MESSAGES.ERROR.VALIDATION,
                errors,
            });
        }

        next();
    };
};

/**
 * Validate object against schema
 */
const validateObject = (data, schema, location) => {
    const errors = [];

    for (const [field, rules] of Object.entries(schema)) {
        const value = data[field];

        // Required check
        if (rules.required && (value === undefined || value === null || value === '')) {
            errors.push({
                field,
                location,
                message: rules.message || `${field} wajib diisi`,
            });
            continue;
        }

        // Skip validation if value is undefined and not required
        if (value === undefined || value === null) continue;

        // Type check
        if (rules.type) {
            const typeValid = checkType(value, rules.type);
            if (!typeValid) {
                errors.push({
                    field,
                    location,
                    message: `${field} harus bertipe ${rules.type}`,
                });
                continue;
            }
        }

        // Min length check (for strings and arrays)
        if (rules.minLength !== undefined) {
            if ((typeof value === 'string' || Array.isArray(value)) && value.length < rules.minLength) {
                errors.push({
                    field,
                    location,
                    message: `${field} minimal ${rules.minLength} karakter`,
                });
            }
        }

        // Max length check (for strings and arrays)
        if (rules.maxLength !== undefined) {
            if ((typeof value === 'string' || Array.isArray(value)) && value.length > rules.maxLength) {
                errors.push({
                    field,
                    location,
                    message: `${field} maksimal ${rules.maxLength} karakter`,
                });
            }
        }

        // Min value check (for numbers)
        if (rules.min !== undefined && typeof value === 'number') {
            if (value < rules.min) {
                errors.push({
                    field,
                    location,
                    message: `${field} minimal ${rules.min}`,
                });
            }
        }

        // Max value check (for numbers)
        if (rules.max !== undefined && typeof value === 'number') {
            if (value > rules.max) {
                errors.push({
                    field,
                    location,
                    message: `${field} maksimal ${rules.max}`,
                });
            }
        }

        // Email check
        if (rules.email && typeof value === 'string') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                errors.push({
                    field,
                    location,
                    message: `${field} harus berformat email yang valid`,
                });
            }
        }

        // Phone check
        if (rules.phone && typeof value === 'string') {
            const phoneRegex = /^(\+62|62|0)[0-9]{9,13}$/;
            if (!phoneRegex.test(value.replace(/[\s-]/g, ''))) {
                errors.push({
                    field,
                    location,
                    message: `${field} harus berformat nomor telepon yang valid`,
                });
            }
        }

        // Enum check
        if (rules.enum && !rules.enum.includes(value)) {
            errors.push({
                field,
                location,
                message: `${field} harus salah satu dari: ${rules.enum.join(', ')}`,
            });
        }

        // Pattern check
        if (rules.pattern && typeof value === 'string') {
            const regex = new RegExp(rules.pattern);
            if (!regex.test(value)) {
                errors.push({
                    field,
                    location,
                    message: rules.patternMessage || `${field} tidak sesuai format`,
                });
            }
        }

        // Custom validator
        if (rules.custom && typeof rules.custom === 'function') {
            const customResult = rules.custom(value, data);
            if (customResult !== true) {
                errors.push({
                    field,
                    location,
                    message: customResult || `${field} tidak valid`,
                });
            }
        }
    }

    return errors;
};

/**
 * Check value type
 */
const checkType = (value, type) => {
    switch (type) {
        case 'string':
            return typeof value === 'string';
        case 'number':
            return typeof value === 'number' && !isNaN(value);
        case 'boolean':
            return typeof value === 'boolean';
        case 'array':
            return Array.isArray(value);
        case 'object':
            return typeof value === 'object' && !Array.isArray(value) && value !== null;
        case 'date':
            return value instanceof Date || !isNaN(Date.parse(value));
        default:
            return true;
    }
};

/**
 * Common validation schemas
 */
const schemas = {
    // User registration
    register: {
        body: {
            email: { required: true, type: 'string', email: true },
            displayName: { required: true, type: 'string', minLength: 2, maxLength: 100 },
            phoneNumber: { type: 'string', phone: true },
        },
    },

    // Create farm
    createFarm: {
        body: {
            name: { required: true, type: 'string', minLength: 2, maxLength: 200 },
            type: { required: true, type: 'string' },
            description: { type: 'string', maxLength: 2000 },
        },
    },

    // Create animal
    createAnimal: {
        body: {
            tagNumber: { required: true, type: 'string' },
            name: { type: 'string', maxLength: 100 },
            type: { required: true, type: 'string' },
            gender: { type: 'string', enum: ['male', 'female', 'unknown'] },
        },
    },

    // Create product
    createProduct: {
        body: {
            name: { required: true, type: 'string', minLength: 2, maxLength: 200 },
            price: { required: true, type: 'number', min: 0 },
            stock: { required: true, type: 'number', min: 0 },
            description: { type: 'string', maxLength: 5000 },
        },
    },

    // Create order
    createOrder: {
        body: {
            shippingAddress: { required: true, type: 'object' },
            paymentMethod: { required: true, type: 'string' },
        },
    },

    // Create course
    createCourse: {
        body: {
            title: { required: true, type: 'string', minLength: 5, maxLength: 200 },
            description: { required: true, type: 'string', minLength: 20 },
            category: { required: true, type: 'string' },
        },
    },

    // Create material
    createMaterial: {
        body: {
            title: { required: true, type: 'string', minLength: 5, maxLength: 200 },
            type: { required: true, type: 'string' },
            categoryId: { required: true, type: 'string' },
        },
    },

    // Pagination params
    pagination: {
        query: {
            page: { type: 'number', min: 1 },
            limit: { type: 'number', min: 1, max: 100 },
        },
    },

    // ID param
    idParam: {
        params: {
            id: { required: true, type: 'string' },
        },
    },
};

module.exports = {
    validate,
    validateObject,
    schemas,
};
