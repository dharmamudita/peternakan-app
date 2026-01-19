/**
 * Models Index
 * Export semua model dari satu file
 */

const User = require('./User');
const Farm = require('./Farm');
const Animal = require('./Animal');
const HealthRecord = require('./HealthRecord');
const Product = require('./Product');
const Order = require('./Order');
const Cart = require('./Cart');
const Course = require('./Course');
const Material = require('./Material');
const UserProgress = require('./UserProgress');

module.exports = {
    User,
    Farm,
    Animal,
    HealthRecord,
    Product,
    Order,
    Cart,
    Course,
    Material,
    UserProgress,
};
