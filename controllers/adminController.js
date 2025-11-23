// controllers/adminController.js
const db = require('../config/database');
const bcrypt = require('bcryptjs');

// Show login page
exports.showLogin = (req, res) => {
    res.render('admin/login', { 
        error: null 
    });
};

// Process login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validasi input
        if (!email || !password) {
            return res.render('admin/login', {
                error: 'Email dan password harus diisi!'
            });
        }

        // Cari admin di database
        const [admins] = await db.query(
            'SELECT * FROM admins WHERE email = ?',
            [email]
        );

        if (admins.length === 0) {
            return res.render('admin/login', {
                error: 'Email atau password salah!'
            });
        }

        const admin = admins[0];

        // Verify password
        const isMatch = await bcrypt.compare(password, admin.password);

        if (!isMatch) {
            return res.render('admin/login', {
                error: 'Email atau password salah!'
            });
        }

        // Set session
        req.session.adminId = admin.id;
        req.session.adminEmail = admin.email;

        // Redirect ke dashboard
        res.redirect('/admin/dashboard');

    } catch (error) {
        console.error('Login error:', error);
        res.render('admin/login', {
            error: 'Terjadi kesalahan saat login'
        });
    }
};

// Show dashboard with all API keys
exports.showDashboard = async (req, res) => {
    try {
        // Query untuk mendapatkan semua API keys beserta data user
        const [apiKeys] = await db.query(`
            SELECT 
                ak.id,
                ak.api_key,
                ak.expired_at,
                ak.created_at,
                u.first_name,
                u.last_name,
                u.email,
                CASE 
                    WHEN ak.expired_at < NOW() THEN 'Expired'
                    ELSE 'Active'
                END as status
            FROM api_keys ak
            JOIN users u ON ak.user_id = u.id
            ORDER BY ak.created_at DESC
        `);

        res.render('admin/dashboard', {
            apiKeys,
            adminEmail: req.session.adminEmail
        });

    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).send('Terjadi kesalahan saat memuat dashboard');
    }
};

// Delete API key
exports.deleteApiKey = async (req, res) => {
    try {
        const { id } = req.params;

        // Delete API key
        const [result] = await db.query(
            'DELETE FROM api_keys WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).send('API key tidak ditemukan');
        }

        // Redirect kembali ke dashboard
        res.redirect('/admin/dashboard');

    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).send('Terjadi kesalahan saat menghapus API key');
    }
};

// Logout
exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/admin/login');
    });
};