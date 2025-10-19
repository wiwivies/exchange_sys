import React, { useEffect, useState } from "react";
import axios from "axios";

export default function FastExchangeTab() {
  const cashierId = parseInt(localStorage.getItem("userId"), 10);
const pointId = parseInt(localStorage.getItem("userPointID"),10);

  const [currencies, setCurrencies] = useState([]);
  const [rate, setRate] = useState(null);
  const [form, setForm] = useState({
    fromCode: "",
    toCode: "",
    amountFrom: "",
    clientId: "",
    result: "",
  });

  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetchCurrencies();
    fetchLatestTransactions();
  }, []);

  const fetchCurrencies = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/operations/currencies");
      setCurrencies(res.data || []);
    } catch (err) {
      console.error("❌ Помилка завантаження валют:", err);
    }
  };

  const fetchLatestTransactions = async () => {
    try {
const res = await axios.get("http://localhost:5000/api/operations/latest", {
  params: { cashierId },
});
      setTransactions(res.data || []);
    } catch (err) {
      console.error("❌ Помилка отримання транзакцій:", err);
    }
  };

  // 🔹 Запитуємо курс обміну з сервера
  const fetchRate = async (from, to) => {
    try {
      if (!from || !to) return;
      const res = await axios.get(
        `http://localhost:5000/api/operations/rate?from=${from}&to=${to}`
      );
      setRate(res.data.Rate.toFixed(4));
      calculateResult(form.amountFrom, res.data.Rate);
    } catch (err) {
      console.error("⚠️ Немає пари обміну:", err);
      setRate(null);
      setForm({ ...form, result: "" });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...form, [name]: value };
    setForm(updated);

    if (name === "fromCode" || name === "toCode") {
      fetchRate(updated.fromCode, updated.toCode);
    }

    if (name === "amountFrom" && rate) {
      calculateResult(value, rate);
    }
  };

  const calculateResult = (amount, r) => {
    if (!amount || !r) {
      setForm((prev) => ({ ...prev, result: "" }));
      return;
    }
    const result = (parseFloat(amount) * parseFloat(r)).toFixed(2);
    setForm((prev) => ({ ...prev, result }));
  };

  const handleExchange = async () => {
    try {
    const res = await axios.post("http://localhost:5000/api/operations/exchange", {
      cashierId,
      clientId: form.clientId,
      pointId,
      fromCode: form.fromCode,
      toCode: form.toCode,
      amountFrom: form.amountFrom,
    });

    const { data } = res.data;
    setForm((prev) => ({ ...prev, result: data.ResultAmount?.toFixed(2) || "" }));
    alert(res.data.message);
  } catch (err) {
    alert(err.response?.data?.message || "Помилка при виконанні обміну валют");
  }
  };

  return (
    <div className="container py-4">
      <div className="card shadow-lg p-4 border-0 rounded-4">
        <h5 className="fw-bold mb-3 text-left">
          Швидкий обмін валют
        </h5>

        <div className="row g-3 align-items-center mb-3">
          <div className="col-md-4">
            <label className="form-label fw-semibold">Валюта, яку клієнт здає:</label>
            <select
              className="form-select"
              name="fromCode"
              value={form.fromCode}
              onChange={handleChange}
            >
              <option value="">Оберіть валюту</option>
              {currencies.map((c) => (
                <option key={c.CurrencyCode} value={c.CurrencyCode}>
                  {c.CurrencyCode}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label fw-semibold">Валюта, яку клієнт отримує:</label>
            <select
              className="form-select"
              name="toCode"
              value={form.toCode}
              onChange={handleChange}
            >
              <option value="">Оберіть валюту</option>
              {currencies.map((c) => (
                <option key={c.CurrencyCode} value={c.CurrencyCode}>
                  {c.CurrencyCode}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label fw-semibold">Сума, яку здає клієнт:</label>
            <input
              type="number"
              className="form-control"
              name="amountFrom"
              value={form.amountFrom}
              onChange={handleChange}
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Курс, результат, ID клієнта */}
        <div className="row g-3 mt-3">
          <div className="col-md-3">
            <label className="form-label fw-semibold">Курс обміну:</label>
            <input
              type="text"
              className="form-control bg-light"
              value={rate || ""}
              readOnly
            />
          </div>
          <div className="col-md-3">
            <label className="form-label fw-semibold">Результат (клієнт отримає):</label>
            <input
              type="text"
              className="form-control bg-light text-success fw-bold"
              value={form.result || ""}
              readOnly
            />
          </div>
          <div className="col-md-3">
            <label className="form-label fw-semibold">ID клієнта:</label>
            <input
              type="number"
              className="form-control"
              name="clientId"
              value={form.clientId}
              onChange={handleChange}
              placeholder="Введіть ID"
            />
          </div>
        </div>

        <div className="text-center mt-4">
          <button onClick={handleExchange} className="btn btn-success px-4 me-3">
              Здійснити обмін
          </button>
          <button
            className="btn btn-secondary px-4"
            onClick={() =>
              setForm({
                fromCode: "",
                toCode: "",
                amountFrom: "",
                clientId: "",
                result: "",
              })
            }
          >
            Скасувати обмін
          </button>
        </div>
      </div>

      {/* Таблиця останніх операцій */}
      <div className="card shadow-sm mt-4 p-3">
        <h5 className="fw-bold mb-3 text-left">Останні 3 операції</h5>
        <table className="table table-hover table-bordered align-middle text-center">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Дата</th>
              <th>Клієнт</th>
              <th>З валюти</th>
              <th>Сума</th>
              <th>До валюти</th>
              <th>Отримано</th>
              <th>Курс</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length ? (
              transactions.map((t, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{new Date(t.OperationDate).toLocaleString()}</td>
                  <td>{t.ClientName}</td>
                  <td>{t.FromCurrency}</td>
                  <td>{t.AmountFrom}</td>
                  <td>{t.ToCurrency}</td>
                  <td>{t.AmountTo}</td>
                  <td>{(t.RateFrom / t.RateTo).toFixed(4)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8">Операцій ще немає</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
