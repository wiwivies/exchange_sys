import { poolPromise } from "../db/connection.js";
import sql from "mssql";

// Отримати всіх клієнтів
export const getAllClients = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 
        c.*,
        COUNT(o.OperationID) AS OperationsCount
      FROM Clients c
      LEFT JOIN Operations o ON c.ClientID = o.ClientID
      GROUP BY c.ClientID, c.FirstName, c.LastName, c.PassportNumber, 
               c.DateOfBirth, c.Phone, c.Email, c.CreatedAt
      ORDER BY c.CreatedAt DESC;
    `);
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ message: "Помилка при отриманні клієнтів", error });
  }
};

// Операції клієнта
export const getClientOperations = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("ClientID", sql.Int, req.params.id)
      .query(`
        SELECT TOP 10 
          o.OperationDate,
          cf.CurrencyCode AS FromCurrency,
          ct.CurrencyCode AS ToCurrency,
          o.AmountFrom,
          o.AmountTo,
          o.TotalUAH
        FROM Operations o
        JOIN Currencies cf ON o.FromCurrencyID = cf.CurrencyID
        JOIN Currencies ct ON o.ToCurrencyID = ct.CurrencyID
        WHERE o.ClientID = @ClientID
        ORDER BY o.OperationDate DESC
      `);
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ message: "Помилка отримання операцій клієнта", error });
  }
};

// ✅ Оновити дані клієнта
export const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { FirstName, LastName, PassportNumber, DateOfBirth, Phone, Email } = req.body;

    const pool = await poolPromise;

    const result = await pool.request()
      .input("ClientID", sql.Int, id)
      .input("FirstName", sql.NVarChar(50), FirstName)
      .input("LastName", sql.NVarChar(50), LastName)
      .input("PassportNumber", sql.NVarChar(20), PassportNumber)
      .input("DateOfBirth", sql.Date, DateOfBirth)
      .input("Phone", sql.NVarChar(20), Phone)
      .input("Email", sql.NVarChar(100), Email)
      .query(`
        UPDATE Clients
        SET 
          FirstName = @FirstName,
          LastName = @LastName,
          PassportNumber = @PassportNumber,
          DateOfBirth = @DateOfBirth,
          Phone = @Phone,
          Email = @Email
        WHERE ClientID = @ClientID
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "Клієнта не знайдено" });
    }

    res.json({ message: "Клієнта успішно оновлено" });
  } catch (error) {
    console.error("Помилка при оновленні клієнта:", error);
    res.status(500).json({ message: "Помилка при оновленні клієнта" });
  }
};

// ✅ Видалити клієнта
export const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;
    const result = await pool.request()
      .input("ClientID", sql.Int, id)
      .query("DELETE FROM Clients WHERE ClientID = @ClientID");

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "Клієнта не знайдено" });
    }

    res.json({ message: "Клієнта видалено" });
  } catch (error) {
    console.error("Помилка при видаленні клієнта:", error);
    res.status(500).json({ message: "Помилка при видаленні клієнта" });
  }
};
