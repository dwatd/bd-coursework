const express = require("express");
const { getPool } = require("../db");
const sql = require("mssql");
const router = express.Router();

router.post("/", async (req, res) => {
  const { date, total_amount, client_id, service_id, accommodation_id } =
    req.body;

  try {
    const pool = getPool();

    const result = await pool
      .request()
      .input("date", sql.Date, date)
      .input("total_amount", sql.Decimal(10, 2), total_amount)
      .input("client_id", sql.Int, client_id)
      .input("service_id", sql.Int, service_id)
      .input("accommodation_id", sql.Int, accommodation_id)
      .query(
        `INSERT INTO Income 
         (date, total_amount, client_id, service_id, accommodation_id)
         OUTPUT INSERTED.income_id
         VALUES (@date, @total_amount, @client_id, @service_id, @accommodation_id)`
      );

    res.status(201).json({ income_id: result.recordset[0].income_id });
  } catch (err) {
    console.error("Error inserting income:", err);
    res.status(500).json({ error: "Failed to insert income" });
  }
});

module.exports = router;
