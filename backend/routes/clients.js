const express = require("express");
const { getPool } = require("../db");
const sql = require("mssql");
const router = express.Router();

router.post("/", async (req, res) => {
  const { full_name, phone_number } = req.body;

  if (!full_name || !phone_number) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const pool = getPool();
    const result = await pool
      .request()
      .input("full_name", sql.NVarChar, full_name)
      .input("phone_number", sql.NVarChar, phone_number)
      .query(
        "INSERT INTO Clients (full_name, phone_number) OUTPUT INSERTED.client_id VALUES (@full_name, @phone_number)"
      );

    res.status(201).json({ id: result.recordset[0].client_id });
  } catch (err) {
    console.error("Error inserting client:", err);
    res.status(500).json({ error: "Failed to insert client" });
  }
});

module.exports = router;
