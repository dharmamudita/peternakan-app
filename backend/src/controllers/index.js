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
const shopController = require('./shopController');

module.exports = {
    authController,
    farmController,
    marketplaceController,
    educationController,
    uploadController,
    notificationController,
    addressController: require('./addressController'),
    reportController: require('./reportController'),
    aiController: require('./aiController'),
    shopController,
};
