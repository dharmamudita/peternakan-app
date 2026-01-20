/**
 * Farm Service
 * Service untuk manajemen peternakan
 */

const Farm = require('../models/Farm');
const Animal = require('../models/Animal');
const HealthRecord = require('../models/HealthRecord');
const User = require('../models/User');
const { USER_ROLES } = require('../config/constants');

class FarmService {
    /**
     * Membuat peternakan baru
     */
    static async createFarm(ownerId, farmData) {
        try {
            // Update role user menjadi farmer
            await User.update(ownerId, { role: USER_ROLES.FARMER });

            // Buat peternakan
            const farm = await Farm.create({
                ...farmData,
                ownerId,
            });

            // Update farmId di user
            await User.update(ownerId, { farmId: farm.id });

            return farm;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Mendapatkan peternakan berdasarkan ID
     */
    static async getFarmById(farmId) {
        try {
            const farm = await Farm.getById(farmId);
            if (!farm) {
                throw new Error('Peternakan tidak ditemukan');
            }
            return farm;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Mendapatkan peternakan berdasarkan pemilik
     */
    static async getFarmsByOwner(ownerId) {
        try {
            return await Farm.getByOwnerId(ownerId);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Mendapatkan semua peternakan
     */
    static async getAllFarms(page = 1, limit = 10, filters = {}) {
        try {
            return await Farm.getAll(page, limit, filters);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Update peternakan
     */
    static async updateFarm(farmId, ownerId, updateData) {
        try {
            const farm = await Farm.getById(farmId);

            if (!farm) {
                throw new Error('Peternakan tidak ditemukan');
            }

            if (farm.ownerId !== ownerId) {
                throw new Error('Anda tidak memiliki akses ke peternakan ini');
            }

            return await Farm.update(farmId, updateData);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Hapus peternakan
     */
    static async deleteFarm(farmId, ownerId) {
        try {
            const farm = await Farm.getById(farmId);

            if (!farm) {
                throw new Error('Peternakan tidak ditemukan');
            }

            if (farm.ownerId !== ownerId) {
                throw new Error('Anda tidak memiliki akses ke peternakan ini');
            }

            await Farm.delete(farmId);

            // Update user farmId
            await User.update(ownerId, { farmId: null });

            return true;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Menambah hewan ke peternakan
     */
    static async addAnimal(farmId, ownerId, animalData) {
        try {
            const farm = await Farm.getById(farmId);

            if (!farm) {
                throw new Error('Peternakan tidak ditemukan');
            }

            if (farm.ownerId !== ownerId) {
                throw new Error('Anda tidak memiliki akses ke peternakan ini');
            }

            // Buat hewan baru
            const animal = await Animal.create({
                ...animalData,
                farmId,
            });

            // Update total hewan di peternakan
            await Farm.updateAnimalCount(farmId, farm.totalAnimals + 1);

            return animal;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Mendapatkan semua hewan di peternakan
     */
    static async getAnimals(farmId, page = 1, limit = 10, filters = {}) {
        try {
            return await Animal.getByFarmId(farmId, page, limit, filters);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Mendapatkan detail hewan
     */
    static async getAnimalById(animalId) {
        try {
            const animal = await Animal.getById(animalId);
            if (!animal) {
                throw new Error('Hewan tidak ditemukan');
            }
            return animal;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Update data hewan
     */
    static async updateAnimal(animalId, farmId, updateData) {
        try {
            const animal = await Animal.getById(animalId);

            if (!animal) {
                throw new Error('Hewan tidak ditemukan');
            }

            if (animal.farmId !== farmId) {
                throw new Error('Hewan tidak ditemukan di peternakan ini');
            }

            return await Animal.update(animalId, updateData);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Hapus hewan
     */
    static async deleteAnimal(animalId, farmId) {
        try {
            const animal = await Animal.getById(animalId);

            if (!animal) {
                throw new Error('Hewan tidak ditemukan');
            }

            if (animal.farmId !== farmId) {
                throw new Error('Hewan tidak ditemukan di peternakan ini');
            }

            await Animal.delete(animalId);

            // Update total hewan di peternakan
            const farm = await Farm.getById(farmId);
            await Farm.updateAnimalCount(farmId, Math.max(0, farm.totalAnimals - 1));

            return true;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Mendapatkan statistik hewan
     */
    static async getAnimalStats(farmId) {
        try {
            return await Animal.getAnimalStats(farmId);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Mendapatkan hewan berdasarkan user (tanpa farmId)
     */
    static async getAnimalsByUser(userId, page = 1, limit = 50, filters = {}) {
        try {
            return await Animal.getByUserId(userId, page, limit, filters);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Mendapatkan statistik hewan berdasarkan user
     */
    static async getAnimalStatsByUser(userId) {
        try {
            return await Animal.getAnimalStatsByUser(userId);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Membuat hewan untuk user (tanpa farmId)
     */
    static async createAnimalForUser(userId, animalData) {
        try {
            const { quantity = 1, name, ...restData } = animalData;
            const count = parseInt(quantity);

            // Jika quantity > 1, lakukan batch create
            if (count > 1) {
                const limit = 50; // Batas batch per request agar tidak timeout
                const actualCount = Math.min(count, limit);
                const promises = [];

                for (let i = 1; i <= actualCount; i++) {
                    const numberedName = `${name} #${i}`;
                    promises.push(Animal.create({
                        ...restData,
                        name: numberedName,
                        userId,
                        farmId: userId,
                    }));
                }

                const results = await Promise.all(promises);
                return results[0]; // Return data pertama saja sebagai respons
            }

            // Single create
            const animal = await Animal.create({
                name,
                ...restData,
                userId,
                farmId: userId,
            });
            return animal;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Hapus hewan berdasarkan ID dan userId
     */
    static async deleteAnimalById(animalId, userId) {
        try {
            const animal = await Animal.getById(animalId);

            if (!animal) {
                throw new Error('Hewan tidak ditemukan');
            }

            // Check ownership (farmId or userId)
            if (animal.farmId !== userId && animal.userId !== userId) {
                throw new Error('Anda tidak memiliki akses ke hewan ini');
            }

            await Animal.delete(animalId);
            return true;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Menambah catatan kesehatan
     */
    static async addHealthRecord(animalId, farmId, recordData) {
        try {
            const animal = await Animal.getById(animalId);

            if (!animal) {
                throw new Error('Hewan tidak ditemukan');
            }

            if (animal.farmId !== farmId) {
                throw new Error('Hewan tidak ditemukan di peternakan ini');
            }

            const record = await HealthRecord.create({
                ...recordData,
                animalId,
                farmId,
            });

            // Update last health check dan status kesehatan hewan
            await Animal.update(animalId, {
                lastHealthCheck: new Date(),
                healthStatus: recordData.healthStatus || animal.healthStatus,
            });

            return record;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Mendapatkan catatan kesehatan hewan
     */
    static async getHealthRecords(animalId, page = 1, limit = 10) {
        try {
            return await HealthRecord.getByAnimalId(animalId, page, limit);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Mendapatkan semua catatan kesehatan di peternakan
     */
    static async getAllHealthRecords(farmId, page = 1, limit = 10, filters = {}) {
        try {
            return await HealthRecord.getByFarmId(farmId, page, limit, filters);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Mendapatkan follow-up yang akan datang
     */
    static async getUpcomingFollowUps(farmId, days = 7) {
        try {
            return await HealthRecord.getUpcomingFollowUps(farmId, days);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Mendapatkan dashboard data peternakan
     */
    static async getDashboardData(farmId) {
        try {
            const farm = await Farm.getById(farmId);
            if (!farm) {
                throw new Error('Peternakan tidak ditemukan');
            }

            const animalStats = await Animal.getAnimalStats(farmId);
            const upcomingFollowUps = await HealthRecord.getUpcomingFollowUps(farmId, 7);

            return {
                farm: farm.toJSON(),
                animalStats,
                upcomingFollowUps,
            };
        } catch (error) {
            throw error;
        }
    }

    static async debugGetAllAnimals() {
        return await Animal.debugGetAll();
    }
}

module.exports = FarmService;
