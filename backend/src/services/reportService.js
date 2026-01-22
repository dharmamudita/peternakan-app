const Report = require('../models/Report');

class ReportService {
    /**
     * Create a new report
     */
    static async createReport(userId, userData, title, description) {
        return await Report.create({
            userId,
            userName: userData.name || userData.displayName,
            userEmail: userData.email,
            userPhone: userData.phoneNumber,
            title,
            description,
        });
    }

    /**
     * Get all reports (Admin)
     */
    static async getAllReports() {
        return await Report.getAll();
    }

    /**
     * Get user's reports
     */
    static async getUserReports(userId) {
        return await Report.getByUser(userId);
    }

    /**
     * Resolve report (Admin)
     */
    static async respondToReport(reportId, response, status = 'resolved') {
        return await Report.update(reportId, {
            response,
            status
        });
    }
}

module.exports = ReportService;
