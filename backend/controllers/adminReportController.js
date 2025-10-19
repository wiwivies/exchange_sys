import { poolPromise } from "../db/connection.js";
import sql from "mssql";

// ✅ Отримати звіт адміністратора
export const getAdminReport = async (req, res) => {
  try {
    const pool = await poolPromise;
    const { fromDate, toDate, cashierId, pointId } = req.query;

    let filters = [];
    if (fromDate) filters.push(`CAST(o.OperationDate AS DATE) >= @fromDate`);
    if (toDate) filters.push(`CAST(o.OperationDate AS DATE) <= @toDate`);
    if (cashierId) filters.push(`o.CashierID = @cashierId`);
    if (pointId) filters.push(`o.PointID = @pointId`);

    const whereClause = filters.length ? "WHERE " + filters.join(" AND ") : "";

    const result = await pool.request()
      .input("fromDate", sql.Date, fromDate || null)
      .input("toDate", sql.Date, toDate || null)
      .input("cashierId", sql.Int, cashierId || null)
      .input("pointId", sql.Int, pointId || null)
      .query(`
        SELECT 
          o.OperationID,
          ISNULL(u.FirstName + ' ' + u.LastName, '—') AS CashierName,
          c.FirstName + ' ' + c.LastName AS ClientName,
          ep.PointName,
          cf.CurrencyCode AS FromCurrency,
          ct.CurrencyCode AS ToCurrency,
          o.AmountFrom,
          o.AmountTo,
          o.OperationDate
        FROM Operations o
        JOIN Clients c ON o.ClientID = c.ClientID
        LEFT JOIN Users u ON o.CashierID = u.UserID
        JOIN ExchangePoints ep ON o.PointID = ep.PointID
        JOIN Currencies cf ON o.FromCurrencyID = cf.CurrencyID
        JOIN Currencies ct ON o.ToCurrencyID = ct.CurrencyID
        ${whereClause}
        ORDER BY o.OperationDate DESC
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error("❌ Помилка getAdminReport:", err);
    res.status(500).send("Помилка отримання звіту адміністратора");
  }
};

// ✅ Підсумкова статистика (загальна кількість і найпопулярніша валюта)
export const getAdminStats = async (req, res) => {
  try {
    const pool = await poolPromise;

    const stats = await pool.request().query(`
      SELECT 
        COUNT(*) AS TotalOperations
      FROM Operations
      WHERE CAST(OperationDate AS DATE) = CAST(GETDATE() AS DATE);
      
      SELECT TOP 1 
        cf.CurrencyCode AS MostPopularCurrency,
        COUNT(*) AS UsageCount
      FROM Operations o
      JOIN Currencies cf ON o.FromCurrencyID = cf.CurrencyID
      WHERE CAST(o.OperationDate AS DATE) = CAST(GETDATE() AS DATE)
      GROUP BY cf.CurrencyCode
      ORDER BY COUNT(*) DESC;
    `);

    const totalOperations = stats.recordsets[0][0]?.TotalOperations || 0;
    const mostPopularCurrency = stats.recordsets[1][0]?.MostPopularCurrency || "—";

    res.json({ totalOperations, mostPopularCurrency });
  } catch (err) {
    console.error("❌ Помилка getAdminStats:", err);
    res.status(500).send("Помилка отримання статистики адміністратора");
  }
};
