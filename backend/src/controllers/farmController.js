/**
 * Farm Controller
 * Controller untuk manajemen peternakan
 */

const { FarmService } = require('../services');
const { asyncHandler } = require('../middlewares');
const { success, created, badRequest, notFound } = require('../utils/responseHelper');
const { parsePagination, parseFilters } = require('../utils/helpers');

// ==================== FARM ====================

/**
 * Create farm
 * POST /api/farms
 */
const createFarm = asyncHandler(async (req, res) => {
    const farm = await FarmService.createFarm(req.user.id, req.body);
    return created(res, farm.toJSON(), 'Peternakan berhasil dibuat');
});

/**
 * Get all farms
 * GET /api/farms
 */
const getAllFarms = asyncHandler(async (req, res) => {
    const { page, limit } = parsePagination(req.query);
    const filters = parseFilters(req.query, ['type', 'isVerified', 'isActive', 'province']);

    const result = await FarmService.getAllFarms(page, limit, filters);

    return res.status(200).json({
        success: true,
        message: 'Data peternakan berhasil diambil',
        data: result.data.map(f => f.toJSON()),
        pagination: result.pagination,
    });
});

/**
 * Get farm by ID
 * GET /api/farms/:id
 */
const getFarmById = asyncHandler(async (req, res) => {
    const farm = await FarmService.getFarmById(req.params.id);
    return success(res, farm.toJSON(), 'Peternakan berhasil diambil');
});

/**
 * Get my farms
 * GET /api/farms/my
 */
const getMyFarms = asyncHandler(async (req, res) => {
    const farms = await FarmService.getFarmsByOwner(req.user.id);
    return success(res, farms.map(f => f.toJSON()), 'Data peternakan berhasil diambil');
});

/**
 * Update farm
 * PUT /api/farms/:id
 */
const updateFarm = asyncHandler(async (req, res) => {
    const farm = await FarmService.updateFarm(req.params.id, req.user.id, req.body);
    return success(res, farm.toJSON(), 'Peternakan berhasil diperbarui');
});

/**
 * Delete farm
 * DELETE /api/farms/:id
 */
const deleteFarm = asyncHandler(async (req, res) => {
    await FarmService.deleteFarm(req.params.id, req.user.id);
    return success(res, null, 'Peternakan berhasil dihapus');
});

/**
 * Get farm dashboard
 * GET /api/farms/:id/dashboard
 */
const getFarmDashboard = asyncHandler(async (req, res) => {
    const data = await FarmService.getDashboardData(req.params.id);
    return success(res, data, 'Dashboard berhasil diambil');
});

// ==================== ANIMALS ====================

/**
 * Get my animals (user's animals)
 * GET /api/animals/my
 */
const getMyAnimals = asyncHandler(async (req, res) => {
    const { page, limit } = parsePagination(req.query);
    const filters = parseFilters(req.query, ['type', 'healthStatus', 'gender', 'isForSale']);

    const result = await FarmService.getAnimalsByUser(req.user.id, page, limit, filters);

    return res.status(200).json({
        success: true,
        message: 'Data hewan berhasil diambil',
        data: result.data.map(a => a.toJSON()),
        pagination: result.pagination,
    });
});

/**
 * Get my animal stats (user's animal stats)
 * GET /api/animals/stats
 */
const getMyAnimalStats = asyncHandler(async (req, res) => {
    const stats = await FarmService.getAnimalStatsByUser(req.user.id);
    return success(res, stats, 'Statistik berhasil diambil');
});

/**
 * Create animal (for user)
 * POST /api/animals
 */
const createAnimal = asyncHandler(async (req, res) => {
    console.log('[DEBUG] CreateAnimal UserID:', req.user.id);
    const animal = await FarmService.createAnimalForUser(req.user.id, req.body);
    return created(res, animal.toJSON(), 'Hewan berhasil ditambahkan');
});

/**
 * Add animal to farm
 * POST /api/farms/:farmId/animals
 */
const addAnimal = asyncHandler(async (req, res) => {
    const animal = await FarmService.addAnimal(req.params.farmId, req.user.id, req.body);
    return created(res, animal.toJSON(), 'Hewan berhasil ditambahkan');
});

/**
 * Get animals in farm
 * GET /api/farms/:farmId/animals
 */
const getAnimals = asyncHandler(async (req, res) => {
    const { page, limit } = parsePagination(req.query);
    const filters = parseFilters(req.query, ['type', 'healthStatus', 'gender', 'isForSale']);

    const result = await FarmService.getAnimals(req.params.farmId, page, limit, filters);

    return res.status(200).json({
        success: true,
        message: 'Data hewan berhasil diambil',
        data: result.data.map(a => a.toJSON()),
        pagination: result.pagination,
    });
});

/**
 * Get animal by ID
 * GET /api/animals/:id
 */
const getAnimalById = asyncHandler(async (req, res) => {
    const animal = await FarmService.getAnimalById(req.params.id);
    return success(res, animal.toJSON(), 'Hewan berhasil diambil');
});

/**
 * Update animal
 * PUT /api/animals/:id
 */
const updateAnimal = asyncHandler(async (req, res) => {
    const animal = await FarmService.getAnimalById(req.params.id);
    const updatedAnimal = await FarmService.updateAnimal(req.params.id, animal.farmId, req.body);
    return success(res, updatedAnimal.toJSON(), 'Hewan berhasil diperbarui');
});

/**
 * Delete animal
 * DELETE /api/animals/:id
 */
const deleteAnimal = asyncHandler(async (req, res) => {
    await FarmService.deleteAnimalById(req.params.id, req.user.id);
    return success(res, null, 'Hewan berhasil dihapus');
});

/**
 * Get animal statistics
 * GET /api/farms/:farmId/animals/stats
 */
const getAnimalStats = asyncHandler(async (req, res) => {
    const stats = await FarmService.getAnimalStats(req.params.farmId);
    return success(res, stats, 'Statistik berhasil diambil');
});

// ==================== HEALTH RECORDS ====================

/**
 * Add health record
 * POST /api/animals/:animalId/health-records
 */
const addHealthRecord = asyncHandler(async (req, res) => {
    const animal = await FarmService.getAnimalById(req.params.animalId);
    const record = await FarmService.addHealthRecord(
        req.params.animalId,
        animal.farmId,
        { ...req.body, createdBy: req.user.id }
    );
    return created(res, record.toJSON(), 'Catatan kesehatan berhasil ditambahkan');
});

/**
 * Get health records for animal
 * GET /api/animals/:animalId/health-records
 */
const getHealthRecords = asyncHandler(async (req, res) => {
    const { page, limit } = parsePagination(req.query);
    const result = await FarmService.getHealthRecords(req.params.animalId, page, limit);

    return res.status(200).json({
        success: true,
        message: 'Catatan kesehatan berhasil diambil',
        data: result.data.map(r => r.toJSON()),
        pagination: result.pagination,
    });
});

/**
 * Get all health records in farm
 * GET /api/farms/:farmId/health-records
 */
const getFarmHealthRecords = asyncHandler(async (req, res) => {
    const { page, limit } = parsePagination(req.query);
    const filters = parseFilters(req.query, ['recordType']);

    const result = await FarmService.getAllHealthRecords(req.params.farmId, page, limit, filters);

    return res.status(200).json({
        success: true,
        message: 'Catatan kesehatan berhasil diambil',
        data: result.data.map(r => r.toJSON()),
        pagination: result.pagination,
    });
});

/**
 * Get upcoming follow-ups
 * GET /api/farms/:farmId/health-records/follow-ups
 */
const getUpcomingFollowUps = asyncHandler(async (req, res) => {
    const days = parseInt(req.query.days) || 7;
    const followUps = await FarmService.getUpcomingFollowUps(req.params.farmId, days);
    return success(res, followUps.map(f => f.toJSON()), 'Follow-up berhasil diambil');
});

const debugAnimals = asyncHandler(async (req, res) => {
    const animals = await FarmService.debugGetAllAnimals();
    return success(res, animals, 'Debug data animals');
});

module.exports = {
    debugAnimals, // Add Debug
    // Farm
    createFarm,
    getAllFarms,
    getFarmById,
    getMyFarms,
    updateFarm,
    deleteFarm,
    getFarmDashboard,
    // Animals
    getMyAnimals,
    getMyAnimalStats,
    createAnimal,
    addAnimal,
    getAnimals,
    getAnimalById,
    updateAnimal,
    deleteAnimal,
    getAnimalStats,
    // Health Records
    addHealthRecord,
    getHealthRecords,
    getFarmHealthRecords,
    getUpcomingFollowUps,
};
