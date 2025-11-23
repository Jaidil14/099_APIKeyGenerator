// controllers/userController.js
const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// Show form untuk generate API key
exports.showForm = (req, res) => {
    res.render('index', { 
        apiKey: null,
        error: null 
    });
};

// Generate API key (belum save ke database)
exports.generateApiKey = async (req, res) => {
    try {
        const { firstName, lastName, email } = req.body;

        // Validasi input
        if (!firstName || !lastName || !email) {
            return res.render('index', {
                apiKey: null,
                error: 'Semua field harus diisi!'
            });
        }

        // Validasi email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.render('index', {
                apiKey: null,
                error: 'Format email tidak valid!'
            });
        }

        // Generate API key dengan format: uuid
        const apiKey = `sk_${uuidv4().replace(/-/g, '')}`;

        // Simpan data sementara di session untuk proses save nanti
        req.session.tempData = {
            firstName,
            lastName,
            email,
            apiKey
        };

        // Tampilkan API key yang sudah digenerate
        res.render('index', {
            apiKey: apiKey,
            error: null,
            userData: { firstName, lastName, email }
        });

    } catch (error) {
        console.error('Error generating API key:', error);
        res.render('index', {
            apiKey: null,
            error: 'Terjadi kesalahan saat generate API key'
        });
    }
};

// Save user dan API key ke database
exports.saveUser = async (req, res) => {
    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();

        // Ambil data dari session
        const tempData = req.session.tempData;
        
        if (!tempData) {
            return res.status(400).send('Tidak ada data untuk disimpan. Silakan generate API key terlebih dahulu.');
        }

        const { firstName, lastName, email, apiKey } = tempData;

        // Cek apakah email sudah terdaftar
        const [existingUser] = await connection.query(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        let userId;

        if (existingUser.length > 0) {
            // Jika user sudah ada, gunakan user_id yang ada
            userId = existingUser[0].id;
        } else {
            // Jika user baru, insert ke tabel users
            const [userResult] = await connection.query(
                'INSERT INTO users (first_name, last_name, email) VALUES (?, ?, ?)',
                [firstName, lastName, email]
            );
            userId = userResult.insertId;
        }

        // Hitung tanggal expired (1 bulan dari sekarang)
        const expiredDate = new Date();
        expiredDate.setMonth(expiredDate.getMonth() + 1);

        // Insert API key ke tabel api_keys
        await connection.query(
            'INSERT INTO api_keys (user_id, api_key, expired_at) VALUES (?, ?, ?)',
            [userId, apiKey, expiredDate]
        );

        await connection.commit();

        // Hapus data sementara dari session
        delete req.session.tempData;

        // Redirect ke halaman success
        res.render('success', {
            firstName,
            lastName,
            email,
            apiKey,
            expiredDate: expiredDate.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            })
        });

    } catch (error) {
        await connection.rollback();
        console.error('Error saving user:', error);
        
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(400).send('API key sudah ada. Silakan generate ulang.');
        } else {
            res.status(500).send('Terjadi kesalahan saat menyimpan data');
        }
    } finally {
        connection.release();
    }
};