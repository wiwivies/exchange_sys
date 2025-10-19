import { poolPromise } from "../db/connection.js";
import sql from "mssql";

// ✅ 1. Отримати всі валюти (з поточними курсами)
export const getCurrencies = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT CurrencyID, CurrencyName, CurrencyCode, BuyRate, SellRate, UpdatedAt
      FROM Currencies
      ORDER BY CurrencyCode
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error("❌ Помилка getCurrencies:", err);
    res.status(500).send("Помилка отримання валют");
  }
};

// ✅ 2. Отримати список дозволених пар з курсами
export const getExchangePairs = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT PairID, FromCurrency, ToCurrency, Rate, RateType
      FROM v_ExchangeRates
      ORDER BY FromCurrency, ToCurrency
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error("❌ Помилка getExchangePairs:", err);
    res.status(500).send("Помилка отримання пар обміну");
  }
};

// ✅ 3. Отримати курс між двома валютами (динамічно)
export const getExchangeRate = async (req, res) => {
  try {
    const pool = await poolPromise;
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({ error: "Вкажіть коди валют 'from' і 'to'" });
    }

    // 🔹 Отримуємо курс через ExchangePairs
    const result = await pool.request()
      .input("from", sql.NVarChar(10), from)
      .input("to", sql.NVarChar(10), to)
      .query(`
        SELECT
          cFrom.CurrencyCode AS FromCode,
          cTo.CurrencyCode   AS ToCode,
          cFrom.BuyRate      AS FromBuy,
          cFrom.SellRate     AS FromSell,
          cTo.BuyRate        AS ToBuy,
          cTo.SellRate       AS ToSell,
          ep.IsAllowed
        FROM ExchangePairs ep
        JOIN Currencies cFrom ON ep.FromCurrencyID = cFrom.CurrencyID
        JOIN Currencies cTo   ON ep.ToCurrencyID   = cTo.CurrencyID
        WHERE cFrom.CurrencyCode = @from
          AND cTo.CurrencyCode   = @to
          AND ep.IsAllowed = 1
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "Пара обміну не дозволена" });
    }

    const row = result.recordset[0];

    let rate = 0;
    let rateType = "";

    // 🔸 Визначаємо тип обміну
    if (row.FromCode === "UAH") {
      // UAH → CUR (клієнт купує валюту)
      rate = 1 / parseFloat(row.ToSell);
      rateType = "UAH→CUR";
    } else if (row.ToCode === "UAH") {
      // CUR → UAH (клієнт продає валюту)
      rate = parseFloat(row.FromBuy);
      rateType = "CUR→UAH";
    } else {
      // CUR → CUR (крос-курс)
      rate = parseFloat(row.ToBuy) / parseFloat(row.FromSell);
      rateType = "CROSS";
    }

    res.json({ Rate: rate, RateType: rateType });
  } catch (err) {
    console.error("❌ Помилка getExchangeRate:", err);
    res.status(500).send("Помилка отримання курсу обміну");
  }
};


// ✅ 4. Виконати обмін через збережену процедуру sp_PerformExchange
export const makeExchange = async (req, res) => {
try {
    const pool = await poolPromise;
    const { clientId, cashierId, pointId, fromCode, toCode, amountFrom } = req.body;

    const result = await pool.request()
      .input("ClientID", sql.Int, clientId)
      .input("CashierID", sql.Int, cashierId)
      .input("PointID", sql.Int, pointId)
      .input("FromCode", sql.NVarChar(10), fromCode)
      .input("ToCode", sql.NVarChar(10), toCode)
      .input("AmountFrom", sql.Decimal(20,6), amountFrom)
      .execute("sp_PerformExchange");

    res.json({
      success: true,
      message: "Операцію успішно виконано",
      data: result.recordset[0],
    });

  } catch (err) {
    // Якщо це бізнес-помилка з SQL THROW
    if (err.number === 50000) {
      return res.status(400).json({
        success: false,
        message: err.originalError.message || "Помилка при виконанні операції",
      });
    }

    // Інші (неочікувані) помилки
    console.error("❌ performExchange error:", err);
    res.status(500).json({
      success: false,
      message: "Внутрішня помилка сервера під час обміну валют",
    });
  }
};

// // ✅ 5. Отримати останні 3 операції (через VIEW)
// export const getLatestOperations = async (req, res) => {
//   try {
//     const pool = await poolPromise;
//     const result = await pool.request().query(`
//       SELECT TOP 3
//         OperationID,
//         ClientName,
//         CashierName,
//         PointName,
//         FromCurrency,
//         AmountFrom,
//         ToCurrency,
//         AmountTo,
//         RateFrom,
//         RateTo,
//         TotalUAH,
//         OperationDate
//       FROM v_OperationsInfo
//       ORDER BY OperationDate DESC
//     `);
//     res.json(result.recordset);
//   } catch (err) {
//     console.error("❌ Помилка getLatestOperations:", err);
//     res.status(500).send("Помилка отримання операцій");
//   }
//   };
// ✅ 5. Отримати останні 3 операції конкретного касира
export const getLatestOperations = async (req, res) => {
  try {
    const { cashierId } = req.query; // <-- отримуємо ID касира з запиту
    const pool = await poolPromise;

    const result = await pool.request()
      .input("cashierId", sql.Int, cashierId)
      .query(`
        SELECT TOP 3
          OperationID,
          ClientName,
          CashierName,
          PointName,
          FromCurrency,
          AmountFrom,
          ToCurrency,
          AmountTo,
          RateFrom,
          RateTo,
          TotalUAH,
          OperationDate
        FROM v_OperationsInfo
        WHERE CashierID = @cashierId
        ORDER BY OperationDate DESC
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error("❌ Помилка getLatestOperations:", err);
    res.status(500).send("Помилка отримання операцій касира");
  }
};

// ✅ 6. Перевірити чи існує клієнт
export const checkClient = async (req, res) => {
  try {
    const pool = await poolPromise;
    const { id } = req.params;

    const result = await pool.request()
      .input("id", sql.Int, id)
      .query("SELECT ClientID FROM Clients WHERE ClientID = @id");

    res.json({ exists: result.recordset.length > 0 });
  } catch (err) {
    console.error("❌ Помилка checkClient:", err);
    res.status(500).send("Помилка перевірки клієнта");
  }
};
