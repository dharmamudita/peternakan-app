/**
 * Services Index
 * Export semua service dari satu file
 */

const AuthService = require('./authService');
const FarmService = require('./farmService');
const MarketplaceService = require('./marketplaceService');
const EducationService = require('./educationService');
const UploadService = require('./uploadService');

module.exports = {
    AuthService,
    FarmService,
    MarketplaceService,
    EducationService,
    UploadService,
};
