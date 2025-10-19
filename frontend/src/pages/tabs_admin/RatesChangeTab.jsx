import React, { useState, useEffect } from "react";
import { FaSearch, FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import AddEditCurrencyModal from "./Currency modals/AddEditCurrencyModal";

export default function RatesChangeTab() {
  const [rates, setRates] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(null);

  const fetchRates = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/ratesChange");
      const data = await res.json();
      setRates(data);
    } catch (err) {
      console.error("❌ Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Видалити цю валюту?")) return;
    try {
      await fetch(`http://localhost:5000/api/ratesChange/${id}`, { method: "DELETE" });
      fetchRates();
    } catch (err) {
      console.error("❌ Delete error:", err);
    }
  };

  const handleSave = () => {
    setShowModal(false);
    fetchRates();
  };

  const filtered = rates.filter(
    (r) =>
      r.CurrencyCode.toLowerCase().includes(search.toLowerCase()) ||
      (r.CurrencyName && r.CurrencyName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-4 bg-white rounded-3 shadow-sm">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold mb-0">Швидкий перегляд</h5>
        <button
          className="btn btn-primary d-flex align-items-center"
          onClick={() => {
            setSelectedCurrency(null);
            setShowModal(true);
          }}
        >
          <FaPlus className="me-2" /> Додати валюту
        </button>
      </div>

      <div className="d-flex align-items-center mb-3 bg-light rounded px-3 py-2">
        <FaSearch className="text-muted me-2" />
        <input
          className="form-control border-0 bg-light"
          placeholder="Пошук за кодом або назвою валюти"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

        <div className="table-responsive">
          <table className="table table-striped table-bordered align-middle">
            <thead className="table-secondary">
            <tr>
              <th>#</th>
              <th>Назва</th>
              <th>Код</th>
              <th>Купівля</th>
              <th>Продаж</th>
              <th>Спред</th>
              <th>Оновлено</th>
              <th>Дії</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr key={r.CurrencyID}>
                <td>{i + 1}</td>
                <td>{r.CurrencyName}</td>
                <td><strong>{r.CurrencyCode}</strong></td>
                <td>{parseFloat(r.BuyRate).toFixed(2)}</td>
                <td>{parseFloat(r.SellRate).toFixed(2)}</td>
                <td className="text-muted">
                  {(parseFloat(r.SellRate) - parseFloat(r.BuyRate)).toFixed(2)}
                </td>
                <td>{r.UpdatedAt}</td>
                <td>
                  <button
                    className="btn btn-outline-primary btn-sm me-2"
                    onClick={() => {
                      setSelectedCurrency(r);
                      setShowModal(true);
                    }}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => handleDelete(r.CurrencyID)}
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan="8" className="text-muted text-center py-3">
                  Даних не знайдено
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ✅ Модальне вікно */}
      <AddEditCurrencyModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onSave={handleSave}
        currency={selectedCurrency}
      />
    </div>
  );
}
