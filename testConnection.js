// testConnection.js
const db = require('./config/database');

async function testConnection() {
    try {
        const [rows] = await db.query('SELECT 1 + 1 AS result');
        console.log('✅ Test query successful:', rows);
        process.exit(0);
    } catch (error) {
        console.error('❌ Test query failed:', error);
        process.exit(1);
    }
}

testConnection();