// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Landing page - form untuk generate API key
router.get('/', userController.showForm);

// Generate API key (temporary, belum save ke database)
router.post('/generate', userController.generateApiKey);

// Save user dan API key ke database
router.post('/save', userController.saveUser);

module.exports = router;