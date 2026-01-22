/**
 * Controllers Index
 * Export semua controller dari satu file
 */

const authController = require('./authController');
const farmController = require('./farmController');
const marketplaceController = require('./marketplaceController');
const educationController = require('./educationController');
const uploadController = require('./uploadController');
const notificationController = require('./notificationController');

module.exports = {
    authController,
    farmController,
    marketplaceController,
    educationController,
    uploadController,
    notificationController,
    reportController: require('./reportController'),
};
