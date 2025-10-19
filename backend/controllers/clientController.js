import { poolPromise } from "../db/connection.js";
import sql from "mssql";

// ✅ Отримати всіх клієнтів
export const getClients = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT ClientID, FirstName, LastName, PassportNumber, DateOfBirth, Phone, Email, CreatedAt
      FROM Clients
      ORDER BY CreatedAt Asc
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error("❌ Помилка при отриманні клієнтів:", err);
    res.status(500).json({ error: "Server error while getting clients" });
  }
};

// ✅ Додати клієнта
export const addClient = async (req, res) => {
  try {
    const { FirstName, LastName, PassportNumber, DateOfBirth, Phone, Email } = req.body;
    const pool = await poolPromise;

    // 🕒 Поточний київський час (UTC+3)
    const createdAt = new Date(new Date().getTime() + 3 * 60 * 60 * 1000);

    // ✅ Додаємо клієнта і повертаємо ClientID
    const result = await pool
      .request()
      .input("FirstName", sql.NVarChar(50), FirstName)
      .input("LastName", sql.NVarChar(50), LastName)
      .input("PassportNumber", sql.NVarChar(20), PassportNumber)
      .input("DateOfBirth", sql.Date, DateOfBirth)
      .input("Phone", sql.NVarChar(20), Phone || null)
      .input("Email", sql.NVarChar(100), Email || null)
      .input("CreatedAt", sql.DateTime, createdAt)
      .query(`
        INSERT INTO Clients (FirstName, LastName, PassportNumber, DateOfBirth, Phone, Email, CreatedAt)
        OUTPUT INSERTED.ClientID
        VALUES (@FirstName, @LastName, @PassportNumber, @DateOfBirth, @Phone, @Email, @CreatedAt)
      `);

    res.status(201).json({
      message: "Client added successfully",
      ClientID: result.recordset[0].ClientID,
      createdAt: createdAt.toISOString(),
    });
  } catch (err) {
    console.error("❌ Помилка при додаванні клієнта:", err);
    res.status(500).json({ error: "Server error while adding client" });
  }
};