// Middleware untuk cek apakah admin sudah login
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.adminId) {
        return next();
    }
    res.redirect('/admin/login');
};

// Middleware untuk redirect jika sudah login
const isNotAuthenticated = (req, res, next) => {
    if (req.session && req.session.adminId) {
        return res.redirect('/admin/dashboard');
    }
    next();
};

module.exports = {
    isAuthenticated,
    isNotAuthenticated
};