const sql = require('mssql');

const config = {
    user: 'katya',
    password: 'CampingDB22',
    server: 'KOMPUTER',
    database: 'Camping',
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

let pool;

const connectToDb = async () => {
    try {
        pool = await sql.connect(config);
        console.log('Database connection successful!');
    } catch (err) {
        console.error('Database connection failed:', err);
    }
};

const getPool = () => {
    if (!pool) {
        throw new Error('Database connection is not established');
    }
    return pool;
};

module.exports = { connectToDb, getPool };
