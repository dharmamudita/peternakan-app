/**
 * Middlewares Index
 * Export semua middleware dari satu file
 */

const {
    authenticate,
    optionalAuth,
    authorize,
    adminOnly,
    farmerOnly,
    sellerOnly,
    instructorOnly,
} = require('./authMiddleware');

const {
    notFoundHandler,
    errorHandler,
    asyncHandler,
} = require('./errorMiddleware');

const {
    validate,
    schemas,
} = require('./validationMiddleware');

module.exports = {
    // Auth
    authenticate,
    optionalAuth,
    authorize,
    adminOnly,
    farmerOnly,
    sellerOnly,
    instructorOnly,
    // Error
    notFoundHandler,
    errorHandler,
    asyncHandler,
    // Validation
    validate,
    schemas,
};
