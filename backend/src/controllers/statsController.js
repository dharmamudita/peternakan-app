const { db } = require('../config/firebase');

class StatsController {
    /**
     * Get User Dashboard Stats
     * (Animals, Orders, Courses)
     */
    static async getUserStats(req, res) {
        try {
            const userId = req.user.uid;

            // 1. Animals Count
            const animalsSnapshot = await db.collection('animals')
                .where('farmId', '==', userId)
                .count()
                .get();
            const totalAnimals = animalsSnapshot.data().count;

            // 2. Orders Count (My Purchases)
            const ordersSnapshot = await db.collection('orders')
                .where('buyerId', '==', userId)
                .count()
                .get();
            const totalOrders = ordersSnapshot.data().count;

            // 3. Courses Enrolled
            const enrollSnapshot = await db.collection('user_progress')
                .where('userId', '==', userId)
                .count()
                .get();
            const totalCourses = enrollSnapshot.data().count;

            // 4. Products (My Listings)
            const productsSnapshot = await db.collection('products')
                .where('sellerId', '==', userId)
                .count()
                .get();
            const totalProducts = productsSnapshot.data().count;

            res.status(200).json({
                success: true,
                data: {
                    totalAnimals,
                    totalOrders,
                    totalCourses,
                    totalProducts
                }
            });

        } catch (error) {
            console.error('GetUserStats Error:', error);
            res.status(500).json({ success: false, message: 'Gagal mengambil statistik user' });
        }
    }

    /**
     * Get Admin Dashboard Stats
     * (Users, Sellers, Products, Reports)
     */
    static async getAdminStats(req, res) {
        try {
            // 1. Total Users
            const usersSnapshot = await db.collection('users').count().get();
            const totalUsers = usersSnapshot.data().count;

            // 2. Total Sellers (Users with role 'seller' or distinct shops)
            // Let's count 'shops' collection if it exists, or users where role == seller
            const shopsSnapshot = await db.collection('shops').count().get();
            const totalShops = shopsSnapshot.data().count;

            // 3. Active Products (marketplace items)
            const productsSnapshot = await db.collection('products').count().get();
            const totalProducts = productsSnapshot.data().count;

            // 4. Reports (Pending/All)
            // Let's count Pending reports for "Action needed", or All for summary.
            // The UI showed "Laporan" -> likely Total Reports or Pending. Let's send both or Total.
            const reportsSnapshot = await db.collection('reports').count().get();
            const totalReports = reportsSnapshot.data().count;

            res.status(200).json({
                success: true,
                data: {
                    totalUsers,
                    totalShops,
                    totalProducts,
                    totalReports
                }
            });

        } catch (error) {
            console.error('GetAdminStats Error:', error);
            res.status(500).json({ success: false, message: 'Gagal mengambil statistik admin' });
        }
    }
}

module.exports = StatsController;
