// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isAuthenticated, isNotAuthenticated } = require('../middleware/auth');

// Login page
router.get('/login', isNotAuthenticated, adminController.showLogin);

// Login process
router.post('/login', adminController.login);

// Dashboard - view all API keys
router.get('/dashboard', isAuthenticated, adminController.showDashboard);

// Delete API key
router.post('/delete/:id', isAuthenticated, adminController.deleteApiKey);

// Logout
router.get('/logout', adminController.logout);

module.exports = router;