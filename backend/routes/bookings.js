// 📁 routes/bookings.js
const express = require("express");
const router = express.Router();
const { getPool } = require("../db");
const sql = require("mssql");

// GET /api/bookings - fetch booking list with client, phone, dates, type, and amount
router.get("/", async (req, res) => {
  try {
    const pool = getPool();
    const result = await pool.request().query(`
      SELECT 
        c.client_id,
        c.full_name AS client,
        c.phone_number AS phone,
        a.check_in_date,
        a.check_out_date,
        CASE 
          WHEN a.tent_on_car = 1 THEN 'Only Car'
          ELSE 'Car with Tent'
        END AS type,
        i.total_amount AS amount
      FROM Accommodation a
      JOIN Clients c ON a.client_id = c.client_id
      JOIN Income i ON i.client_id = c.client_id
    `);

    res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching bookings:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/client/:id", async (req, res) => {
  const { id } = req.params;
  const pool = getPool();

  try {
    const request = pool.request().input("id", sql.Int, id);

    // Видаляємо залежні записи у правильному порядку
    await request.query("DELETE FROM Income WHERE client_id = @id");
    await request.query("DELETE FROM CampingServices WHERE client_id = @id");
    await request.query("DELETE FROM Accommodation WHERE client_id = @id");
    await request.query("DELETE FROM Clients WHERE client_id = @id");

    res.status(200).json({ message: "Client and related records deleted" });
  } catch (err) {
    console.error("Error deleting client:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/client/:id", async (req, res) => {
  const { id } = req.params;
  const { client, phone, check_in_date, check_out_date, type, amount } =
    req.body;

  const tent_on_car = type === "Only Car" ? 1 : 0;

  try {
    const pool = getPool();

    await pool
      .request()
      .input("id", sql.Int, id)
      .input("client", sql.NVarChar, client)
      .input("phone", sql.NVarChar, phone)
      .input("check_in", sql.Date, check_in_date)
      .input("check_out", sql.Date, check_out_date)
      .input("tent_on_car", sql.Bit, tent_on_car)
      .input("amount", sql.Decimal(10, 2), amount).query(`
        UPDATE Clients
        SET full_name = @client, phone_number = @phone
        WHERE client_id = @id;

        UPDATE Accommodation
        SET check_in_date = @check_in,
            check_out_date = @check_out,
            tent_on_car = @tent_on_car
        WHERE client_id = @id;

        UPDATE Income
        SET total_amount = @amount
        WHERE client_id = @id;
      `);

    res.status(200).json({ message: "Client updated" });
  } catch (err) {
    console.error("Error updating client:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
