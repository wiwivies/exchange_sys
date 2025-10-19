import React, { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";

export default function RatesTab() {
  const [rates, setRates] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/rates")
      .then((res) => res.json())
      .then((data) => setRates(data))
      .catch(console.error);
  }, []);

  const filtered = rates.filter(r =>
    r.CurrencyCode.toLowerCase().includes(search.toLowerCase()) ||
    (r.CurrencyName && r.CurrencyName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-4 bg-white rounded-3 shadow-sm">
      <h5 className="fw-bold mb-3">Курс валют</h5>

      <div className="d-flex align-items-center mb-3 bg-light rounded px-3 py-2">
        <FaSearch className="text-muted me-2" />
        <input
          className="form-control border-0 bg-light"
          placeholder="Пошук за кодом або назвою валюти"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="table-responsive">
        <table className="table table-striped align-middle text-center">
          <thead className="table-light">
            <tr>
              <th>#</th><th>Валюта</th><th>Купівля</th><th>Продаж</th>
              <th>Спред</th><th>Зміна</th><th>Час оновлення</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr key={r.CurrencyID}>
                <td>{i+1}</td>
                <td><strong>{r.CurrencyCode}</strong><br/><small className="text-muted">{r.CurrencyName}</small></td>
                <td>{parseFloat(r.BuyRate).toFixed(2)}</td>
                <td>{parseFloat(r.SellRate).toFixed(2)}</td>
                <td>{(parseFloat(r.SellRate) - parseFloat(r.BuyRate)).toFixed(2)}</td>
                <td className={r.Change > 0 ? "text-success" : r.Change < 0 ? "text-danger" : "text-muted"}>
                  {r.Change > 0 ? `+${parseFloat(r.Change).toFixed(2)}` : parseFloat(r.Change).toFixed(2)}
                </td>
                <td>{r.UpdatedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
