import { poolPromise } from "../db/connection.js";
import sql from "mssql";

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
