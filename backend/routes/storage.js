const express = require("express");
const { getPool } = require("../db");
const sql = require("mssql");
const router = express.Router();

router.post("/", async (req, res) => {
  const {
    client_id,
    backpack_count,
    start_date,
    end_date,
    payment_date,
    amount,
    tariff_id,
  } = req.body;

  try {
    const pool = getPool();

    const result = await pool
      .request()
      .input("client_id", sql.Int, client_id)
      .input("backpack_count", sql.Int, backpack_count)
      .input("start_date", sql.Date, start_date)
      .input("end_date", sql.Date, end_date)
      .input("payment_date", sql.Date, payment_date)
      .input("amount", sql.Decimal(10, 2), amount)
      .input("tariff_id", sql.Int, tariff_id)
      .query(
        `INSERT INTO CampingServices
         (client_id, backpack_count, start_date, end_date, payment_date, amount, tariff_id)
         OUTPUT INSERTED.service_id
         VALUES (@client_id, @backpack_count, @start_date, @end_date, @payment_date, @amount, @tariff_id)`
      );

    res.status(201).json({ service_id: result.recordset[0].service_id });
  } catch (err) {
    console.error("Error inserting camping service:", err);
    res.status(500).json({ error: "Failed to insert camping service" });
  }
});

module.exports = router;
