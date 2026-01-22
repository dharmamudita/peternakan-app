const { db } = require('../config/firebase');

class Report {
    /**
     * Create new report
     */
    static async create(data) {
        try {
            console.log('[ReportModel] Creating report with data:', JSON.stringify(data));
            const reportData = {
                ...data,
                status: 'pending',
                response: null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            const docRef = await db.collection('reports').add(reportData);
            console.log('[ReportModel] Report created with ID:', docRef.id);
            return { id: docRef.id, ...reportData };
        } catch (error) {
            console.error('[ReportModel] Create Error:', error);
            throw error;
        }
    }

    /**
     * Get all reports
     */
    static async getAll(limit = 50) {
        try {
            console.log('[ReportModel] Fetching all reports from Firestore...');
            const snapshot = await db.collection('reports')
                .limit(limit)
                .get();

            console.log('[ReportModel] Snapshot size:', snapshot.size);

            if (snapshot.empty) {
                console.log('[ReportModel] No matching documents.');
                return [];
            }

            const reports = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                reports.push({
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt && typeof data.createdAt.toDate === 'function'
                        ? data.createdAt.toDate().toISOString()
                        : data.createdAt,
                    updatedAt: data.updatedAt && typeof data.updatedAt.toDate === 'function'
                        ? data.updatedAt.toDate().toISOString()
                        : data.updatedAt
                });
            });

            return reports;
        } catch (error) {
            console.error('[ReportModel] GetAll Error:', error);
            throw error;
        }
    }

    /**
     * Get reports by user
     */
    static async getByUser(userId) {
        try {
            const snapshot = await db.collection('reports')
                .where('userId', '==', userId)
                .get();

            const reports = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                reports.push({
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt && typeof data.createdAt.toDate === 'function'
                        ? data.createdAt.toDate().toISOString()
                        : data.createdAt,
                    updatedAt: data.updatedAt && typeof data.updatedAt.toDate === 'function'
                        ? data.updatedAt.toDate().toISOString()
                        : data.updatedAt
                });
            });

            return reports;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Update report (for Admin response/status)
     */
    static async update(id, data) {
        try {
            await db.collection('reports').doc(id).update({
                ...data,
                updatedAt: new Date().toISOString()
            });
            return true;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Report;
