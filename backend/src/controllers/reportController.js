const { ReportService } = require('../services');
const { asyncHandler } = require('../middlewares');
const { success, created, badRequest } = require('../utils/responseHelper');

/**
 * Create Report
 * POST /api/reports
 */
const createReport = asyncHandler(async (req, res) => {
    const { title, description } = req.body;

    console.log('Report Create Request Body:', req.body);
    console.log('Report Create User:', req.user);

    if (!title || !description) {
        return badRequest(res, 'Judul dan deskripsi wajib diisi');
    }

    // Pass necessary user info (from auth middleware)
    const userData = {
        name: req.user.displayName,
        email: req.user.email,
        phoneNumber: req.user.phoneNumber
    };

    const report = await ReportService.createReport(req.user.id, userData, title, description);

    return created(res, report, 'Laporan berhasil dikirim');
});

/**
 * Get All Reports (Admin)
 * GET /api/reports/admin/all
 */
const getAllReports = asyncHandler(async (req, res) => {
    console.log('[ReportController] getting all reports (admin)...');
    const reports = await ReportService.getAllReports();
    console.log('[ReportController] found reports:', reports.length);
    return success(res, reports, 'Semua laporan berhasil diambil');
});

/**
 * Get My Reports
 * GET /api/reports/my
 */
const getMyReports = asyncHandler(async (req, res) => {
    const reports = await ReportService.getUserReports(req.user.id);
    return success(res, reports, 'Laporan Anda berhasil diambil');
});

/**
 * Respond to Report (Admin)
 * PUT /api/reports/:id/respond
 */
const respondToReport = asyncHandler(async (req, res) => {
    const { response, status } = req.body;

    if (!response) {
        return badRequest(res, 'Respon wajib diisi');
    }

    await ReportService.respondToReport(req.params.id, response, status);

    return success(res, null, 'Respon berhasil dikirim');
});

module.exports = {
    createReport,
    getAllReports,
    getMyReports,
    respondToReport
};
