import sql from "mssql";
import { poolPromise } from "../db/connection.js";

// 📊 Коротка статистика
export const getShortStatistics = async (req, res) => {
  try {
    const pool = await poolPromise;

    // 1️⃣ Операції за день
    const todayResult = await pool.request().query(`
      SELECT 
        COUNT(*) AS operationsToday
      FROM Operations
      WHERE CAST(OperationDate AS DATE) = CAST(GETDATE() AS DATE)
    `);
    const operationsToday = todayResult.recordset[0].operationsToday || 0;

    // 2️⃣ Загальна кількість доларів у всіх пунктах
    const usdResult = await pool.request().query(`
      SELECT 
        ISNULL(SUM(b.Amount), 0) AS totalUSD
      FROM Balances b
      JOIN Currencies c ON b.CurrencyID = c.CurrencyID
      WHERE c.CurrencyCode = 'USD'
    `);
    const totalUSD = usdResult.recordset[0].totalUSD || 0;

    // 3️⃣ Загальна кількість гривень у всіх пунктах
    const uahResult = await pool.request().query(`
      SELECT 
        ISNULL(SUM(b.Amount), 0) AS totalUAH
      FROM Balances b
      JOIN Currencies c ON b.CurrencyID = c.CurrencyID
      WHERE c.CurrencyCode = 'UAH'
    `);
    const totalUAH = uahResult.recordset[0].totalUAH || 0;

    // 4️⃣ Графік обігу за тиждень
    const weekResult = await pool.request().query(`
      SELECT 
        DATENAME(WEEKDAY, OperationDate) AS dayName,
        COUNT(*) AS operationsCount
      FROM Operations
      WHERE OperationDate >= DATEADD(DAY, -6, CAST(GETDATE() AS DATE))
      GROUP BY DATENAME(WEEKDAY, OperationDate)
      ORDER BY MIN(OperationDate)
    `);

    const weekData = weekResult.recordset.map(row => ({
      day: row.dayName,
      count: row.operationsCount
    }));

    res.json({
      success: true,
      operationsToday,
      totalUSD,
      totalUAH,
      weekData
    });
  } catch (error) {
    console.error("❌ Error fetching statistics:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// import sql from "mssql";
// import { poolPromise } from "../db/connection.js";

// // 📊 Коротка статистика (UAH → USD balance total)
// export const getShortStatistics = async (req, res) => {
//   try {
//     const pool = await poolPromise;

//     // 1️⃣ Операції за день
//     const todayResult = await pool.request().query(`
//       SELECT 
//         COUNT(*) AS operationsToday
//       FROM Operations
//       WHERE CAST(OperationDate AS DATE) = CAST(GETDATE() AS DATE)
//     `);

//     const operationsToday = todayResult.recordset[0].operationsToday || 0;

//     // 2️⃣ Загальна кількість доларів у всіх пунктах
//     const usdResult = await pool.request().query(`
//       SELECT 
//         ISNULL(SUM(b.Amount), 0) AS totalUSD
//       FROM Balances b
//       JOIN Currencies c ON b.CurrencyID = c.CurrencyID
//       WHERE c.CurrencyCode = 'USD'
//     `);

//     const totalUSD = usdResult.recordset[0].totalUSD || 0;

//     // 3️⃣ Графік обігу за тиждень
//     const weekResult = await pool.request().query(`
//       SELECT 
//         DATENAME(WEEKDAY, OperationDate) AS dayName,
//         COUNT(*) AS operationsCount
//       FROM Operations
//       WHERE OperationDate >= DATEADD(DAY, -6, CAST(GETDATE() AS DATE))
//       GROUP BY DATENAME(WEEKDAY, OperationDate)
//       ORDER BY MIN(OperationDate)
//     `);

//     const weekData = weekResult.recordset.map(row => ({
//       day: row.dayName,
//       count: row.operationsCount
//     }));

//     res.json({
//       success: true,
//       operationsToday,
//       totalUSD,
//       weekData
//     });
//   } catch (error) {
//     console.error("❌ Error fetching statistics:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };
