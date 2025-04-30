const express = require('express')
const { getPool } = require('../db')
const sql = require('mssql')
const router = express.Router()

// Роут для отримання витрат
router.get('/', async (req, res) => {
    try {
        const pool = getPool();
        const result = await pool.request().query(`
            SELECT * FROM Expenses
        `);

        if (result.recordset.length > 0) {
            res.json(result.recordset);
        } else {
            res.status(404).json({ message: 'No expenses found' });
        }
    } catch (err) {
        console.error('Error fetching expenses:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
})

// Роут для видалення витрати
router.delete('/:id', async (req, res) => {
    try {
        const pool = getPool();
        const { id } = req.params;
        
        await pool.request()
            .input('id', sql.Int, id)
            .query(`DELETE FROM Expenses WHERE expense_id = @id`);

        res.status(200).json({ message: 'Expense deleted' });
    } catch (err) {
        console.error('Error deleting expense:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
})

// роут для редагування витрати
router.get('/:id', async (req, res) => {
    try {
      const pool = getPool();
      const { id } = req.params;
  
      const result = await pool.request()
        .input('id', sql.Int, id)
        .query('SELECT * FROM Expenses WHERE expense_id = @id');
  
      if (result.recordset.length > 0) {
        res.json(result.recordset[0]);
      } else {
        res.status(404).json({ message: 'Expense not found' });
      }
    } catch (err) {
      console.error('Error fetching expense:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
});

// Роут для оновлення витрати
router.put('/:id', async (req, res) => {
    try {
      const pool = getPool();
      const { id } = req.params;
      const { date, category, description, amount } = req.body;
  
      await pool.request()
        .input('id', sql.Int, id)
        .input('date', sql.Date, date)
        .input('category', sql.NVarChar, category)
        .input('description', sql.NVarChar, description)
        .input('amount', sql.Money, amount)
        .query(`
          UPDATE Expenses
          SET date = @date,
              category = @category,
              description = @description,
              amount = @amount
          WHERE expense_id = @id
        `);
  
      res.status(200).json({ message: 'Expense updated' });
    } catch (err) {
      console.error('Error updating expense:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
});  

// Роут для додавання нової витрати
router.post('/', async (req, res) => {
  try {
      const pool = getPool();
      const { date, category, description, amount } = req.body;

      if (!date || !category || !description || amount == null) {
          return res.status(400).json({ message: 'Missing required fields' });
      }

      const result = await pool.request()
          .input('date', sql.Date, date)
          .input('category', sql.NVarChar, category)
          .input('description', sql.NVarChar, description)
          .input('amount', sql.Money, amount)
          .query(`
              INSERT INTO Expenses (date, category, description, amount)
              VALUES (@date, @category, @description, @amount);
          `);

      res.status(201).json({ message: 'Expense added' });
  } catch (err) {
      console.error('Error adding expense:', err);
      res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;