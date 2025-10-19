import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import axios from "axios";

export default function AddEditCurrencyModal({ show, onHide, onSave, currency }) {
  const [form, setForm] = useState({
    CurrencyName: "",
    CurrencyCode: "",
    BuyRate: "",
    SellRate: "",
  });

  useEffect(() => {
    if (currency) setForm(currency);
    else setForm({ CurrencyName: "", CurrencyCode: "", BuyRate: "", SellRate: "" });
  }, [currency]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (currency) {
        await axios.put(`http://localhost:5000/api/ratesChange/${currency.CurrencyID}`, form);
      } else {
        await axios.post("http://localhost:5000/api/ratesChange", form);
      }
      onSave();
    } catch (err) {
      console.error("❌ Error saving currency:", err);
    }
  };

  const spread =
    form.BuyRate && form.SellRate
      ? (parseFloat(form.SellRate) - parseFloat(form.BuyRate)).toFixed(4)
      : "—";

  return (
    <Modal show={show} onHide={onHide} centered size="md" backdrop="static">
      <div
        className="p-4 rounded-4 shadow"
        style={{ backgroundColor: "#fff", borderRadius: "20px" }}
      >
        <h5 className="fw-bold mb-3 text-center">
          {currency ? "Редагувати валюту" : "Додати валюту"}
        </h5>

        <Form>
          <Form.Group className="mb-3">
            <Form.Control
              type="text"
              name="CurrencyName"
              placeholder="Назва валюти"
              value={form.CurrencyName}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Control
              type="text"
              name="CurrencyCode"
              placeholder="Код"
              value={form.CurrencyCode}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Control
              type="number"
              name="BuyRate"
              placeholder="Курс купівлі"
              value={form.BuyRate}
              onChange={handleChange}
              step="0.0001"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Control
              type="number"
              name="SellRate"
              placeholder="Курс продажу"
              value={form.SellRate}
              onChange={handleChange}
              step="0.0001"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Control type="text" placeholder="Спред" value={spread} disabled />
          </Form.Group>

          <div className="d-flex justify-content-center mt-4">
            <Button
              variant="primary"
              className="px-4 me-3"
              onClick={handleSubmit}
              style={{ borderRadius: "10px" }}
            >
              Підтвердити
            </Button>
            <Button
              variant="light"
              className="border px-4"
              onClick={onHide}
              style={{ borderRadius: "10px" }}
            >
              Скасувати
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
}