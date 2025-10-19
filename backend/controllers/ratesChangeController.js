import { poolPromise } from "../db/connection.js";
import sql from "mssql";

// ✅ Отримати всі валюти
export const getRates = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT
        c.CurrencyID,
        c.CurrencyCode,
        c.CurrencyName,
        c.BuyRate,
        c.SellRate,
        (c.SellRate - c.BuyRate) AS Spread,
        ISNULL(ROUND(c.BuyRate - prev.OldBuyRate, 4), 0.0000) AS Change,
        FORMAT(c.UpdatedAt, 'HH:mm') AS UpdatedAt
      FROM Currencies c
      OUTER APPLY (
          SELECT TOP 1 h.OldBuyRate, h.OldSellRate, h.NewBuyRate, h.NewSellRate, h.ChangeDate
          FROM CurrencyHistory h
          WHERE h.CurrencyID = c.CurrencyID
          ORDER BY h.ChangeDate DESC
      ) prev
      ORDER BY c.CurrencyCode;
    `);

    res.json(result.recordset);
  } catch (err) {
    console.error("❌ getRates error:", err);
    res.status(500).json({ error: "Не вдалося отримати курси валют" });
  }
};


// ✅ Додати нову валюту
export const addCurrency = async (req, res) => {
  const { CurrencyName, CurrencyCode, BuyRate, SellRate } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input("CurrencyName", sql.NVarChar, CurrencyName)
      .input("CurrencyCode", sql.NVarChar, CurrencyCode)
      .input("BuyRate", sql.Decimal(18, 4), BuyRate)
      .input("SellRate", sql.Decimal(18, 4), SellRate)
      .query(`
        INSERT INTO Currencies (CurrencyName, CurrencyCode, BuyRate, SellRate, UpdatedAt)
        VALUES (@CurrencyName, @CurrencyCode, @BuyRate, @SellRate, GETDATE())
      `);
    res.json({ message: "Currency added successfully" });
  } catch (err) {
    console.error("addCurrency error:", err);
    res.status(500).json({ message: "Server error while adding currency" });
  }
};

// ✅ Оновити курс валюти
export const updateCurrency = async (req, res) => {
  const { id } = req.params;
  const { BuyRate, SellRate } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input("CurrencyID", sql.Int, id)
      .input("BuyRate", sql.Decimal(18, 4), BuyRate)
      .input("SellRate", sql.Decimal(18, 4), SellRate)
      .query(`
        UPDATE Currencies
        SET BuyRate = @BuyRate, SellRate = @SellRate
        WHERE CurrencyID = @CurrencyID
      `);
    // ✅ UpdatedAt і запис в історію зробить тригер
    res.json({ message: "Currency updated successfully" });
  } catch (err) {
    console.error("updateCurrency error:", err);
    res.status(500).json({ message: "Server error while updating currency" });
  }
};

// export const updateCurrency = async (req, res) => {
//   const { id } = req.params;
//   const { BuyRate, SellRate } = req.body;
//   try {
//     const pool = await poolPromise;
//     await pool.request()
//       .input("CurrencyID", sql.Int, id)
//       .input("BuyRate", sql.Decimal(18, 4), BuyRate)
//       .input("SellRate", sql.Decimal(18, 4), SellRate)
//       .query(`
//         UPDATE Currencies
//         SET BuyRate = @BuyRate, SellRate = @SellRate, UpdatedAt = GETDATE()
//         WHERE CurrencyID = @CurrencyID
//       `);
//     res.json({ message: "Currency updated successfully" });
//   } catch (err) {
//     console.error("updateCurrency error:", err);
//     res.status(500).json({ message: "Server error while updating currency" });
//   }
// };

// ✅ Видалити валюту
export const deleteCurrency = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    await pool.request().input("CurrencyID", sql.Int, id).query(`
      DELETE FROM Currencies WHERE CurrencyID = @CurrencyID
    `);
    res.json({ message: "Currency deleted successfully" });
  } catch (err) {
    console.error("deleteCurrency error:", err);
    res.status(500).json({ message: "Server error while deleting currency" });
  }
};
