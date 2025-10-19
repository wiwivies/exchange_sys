import { poolPromise } from "../db/connection.js";
import sql from "mssql";
// ✅ Отримати операції касира з фільтром за період
export const getCashierReport = async (req, res) => {
  try {
    const pool = await poolPromise;
    const { cashierId, period } = req.query; // period = 'today' | 'month' | 'all'

    if (!cashierId) {
      return res.status(400).json({ error: "Не вказано ID касира" });
    }

    let dateFilter = "";

    if (period === "today") {
      dateFilter = "AND CAST(o.OperationDate AS DATE) = CAST(GETDATE() AS DATE)";
    } else if (period === "month") {
      dateFilter =
        "AND MONTH(o.OperationDate) = MONTH(GETDATE()) AND YEAR(o.OperationDate) = YEAR(GETDATE())";
    }

    const result = await pool.request()
      .input("cashierId", sql.Int, cashierId)
      .query(`
        SELECT
          o.OperationID,
          c.FirstName + ' ' + c.LastName AS ClientName,
          ep.PointName,
          cf.CurrencyCode AS FromCurrency,
          ct.CurrencyCode AS ToCurrency,
          o.AmountFrom,
          o.AmountTo,
          o.TotalUAH,
          o.OperationDate
        FROM Operations o
        JOIN Clients c ON o.ClientID = c.ClientID
        JOIN ExchangePoints ep ON o.PointID = ep.PointID
        JOIN Currencies cf ON o.FromCurrencyID = cf.CurrencyID
        JOIN Currencies ct ON o.ToCurrencyID = ct.CurrencyID
        WHERE o.CashierID = @cashierId
        ${dateFilter}
        ORDER BY o.OperationDate DESC
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error("❌ Помилка getCashierOperations:", err);
    res.status(500).send("Помилка отримання операцій касира");
  }
};
