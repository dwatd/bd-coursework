const express = require('express');
const { getPool } = require('../db');
const sql = require('mssql');
const router = express.Router();

// Роут для отримання тарифів
router.get('/', async (req, res) => {
    try {
        const pool = getPool();
        const result = await pool.request().query(`
            SELECT TOP 1 * FROM Tariffs WHERE tariff_id IS NOT NULL ORDER BY effective_date DESC
        `);

        if (result.recordset.length > 0) {
            res.json(result.recordset[0]);
        } else {
            res.status(404).json({ message: 'No tariffs found' });
        }
    } catch (err) {
        console.error('Error fetching tariffs:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Роут для додавання нового тарифу
router.post('/', async (req, res) => {
    const { per_person, per_tent, per_car, storage_fee } = req.body;

    try {
        const pool = getPool(); 
        const now = new Date();
        const tariffId = `T${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

        await pool.request()
            .input('per_person', sql.Decimal(10, 2), per_person || 0)
            .input('per_tent', sql.Decimal(10, 2), per_tent || 0)
            .input('per_car', sql.Decimal(10, 2), per_car || 0)
            .input('storage_fee', sql.Decimal(10, 2), storage_fee || 0)
            .query(`
                INSERT INTO Tariffs (per_person, per_tent, per_car, storage_fee, effective_date)
                VALUES (@per_person, @per_tent, @per_car, @storage_fee, GETDATE())
            `);

        res.json({ message: 'New tariff added successfully' });
    } catch (err) {
        console.error('Error inserting new tariff:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Роут для видалення останнього тарифу
router.delete('/latest', async (req, res) => {
    try {
        const pool = getPool(); 
        const result = await pool.request().query(`
            SELECT TOP 1 tariff_id
            FROM Tariffs
            WHERE tariff_id IS NOT NULL
            ORDER BY effective_date DESC
        `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'No tariffs to delete' });
        }

        const latestTariffId = result.recordset[0].tariff_id;

        await pool.request().query(`
            DELETE FROM Tariffs
            WHERE tariff_id = '${latestTariffId}'
        `);

        res.json({ message: 'Latest tariff deleted successfully' });
    } catch (err) {
        console.error('Error deleting latest tariff:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
