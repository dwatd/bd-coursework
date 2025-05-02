const express = require("express");
const { getPool } = require("../db");
const sql = require("mssql");
const router = express.Router();

router.post("/", async (req, res) => {
  const {
    client_id,
    check_in_date,
    check_out_date,
    tent_on_car,
    amount,
    payment_date,
    tariff_id,
  } = req.body;

  try {
    const pool = getPool();

    // Отримуємо останній tent_number
    const tentResult = await pool
      .request()
      .query(
        "SELECT ISNULL(MAX(tent_number), 0) + 1 AS next_tent FROM Accommodation"
      );
    const tent_number = tentResult.recordset[0].next_tent;

    const result = await pool
      .request()
      .input("client_id", sql.Int, client_id)
      .input("check_in_date", sql.Date, check_in_date)
      .input("check_out_date", sql.Date, check_out_date)
      .input("tent_number", sql.Int, tent_number)
      .input("tent_on_car", sql.Bit, tent_on_car)
      .input("payment_date", sql.Date, payment_date)
      .input("amount", sql.Decimal(10, 2), amount)
      .input("tariff_id", sql.Int, tariff_id)
      .query(
        `INSERT INTO Accommodation 
         (client_id, check_in_date, check_out_date, tent_number, tent_on_car, payment_date, amount, tariff_id)
         OUTPUT INSERTED.accommodation_id
         VALUES (@client_id, @check_in_date, @check_out_date, @tent_number, @tent_on_car, @payment_date, @amount, @tariff_id)`
      );

    res.status(201).json({ id: result.recordset[0].accommodation_id });
  } catch (err) {
    console.error("Error inserting accommodation:", err);
    res.status(500).json({ error: "Failed to insert accommodation" });
  }
});

module.exports = router;
