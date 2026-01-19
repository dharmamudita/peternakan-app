/**
 * Response Helper
 * Utility untuk format response API yang konsisten
 */

/**
 * Success response
 */
const success = (res, data = null, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};

/**
 * Created response (201)
 */
const created = (res, data = null, message = 'Data berhasil dibuat') => {
    return success(res, data, message, 201);
};

/**
 * Paginated response
 */
const paginated = (res, data, pagination, message = 'Data berhasil diambil') => {
    return res.status(200).json({
        success: true,
        message,
        data,
        pagination,
    });
};

/**
 * Error response
 */
const error = (res, message = 'Terjadi kesalahan', statusCode = 500, errors = null) => {
    return res.status(statusCode).json({
        success: false,
        message,
        errors,
    });
};

/**
 * Bad request response (400)
 */
const badRequest = (res, message = 'Request tidak valid', errors = null) => {
    return error(res, message, 400, errors);
};

/**
 * Unauthorized response (401)
 */
const unauthorized = (res, message = 'Akses tidak diizinkan') => {
    return error(res, message, 401);
};

/**
 * Forbidden response (403)
 */
const forbidden = (res, message = 'Anda tidak memiliki akses') => {
    return error(res, message, 403);
};

/**
 * Not found response (404)
 */
const notFound = (res, message = 'Data tidak ditemukan') => {
    return error(res, message, 404);
};

/**
 * Conflict response (409)
 */
const conflict = (res, message = 'Data sudah ada') => {
    return error(res, message, 409);
};

/**
 * Validation error response (422)
 */
const validationError = (res, errors = null, message = 'Validasi gagal') => {
    return error(res, message, 422, errors);
};

/**
 * Server error response (500)
 */
const serverError = (res, message = 'Terjadi kesalahan server') => {
    return error(res, message, 500);
};

module.exports = {
    success,
    created,
    paginated,
    error,
    badRequest,
    unauthorized,
    forbidden,
    notFound,
    conflict,
    validationError,
    serverError,
};
