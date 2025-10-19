import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Headphones, Phone } from "react-bootstrap-icons";

export default function SupportTab() {
  return (
    <div className="p-4 bg-light rounded shadow-sm">
      <h4 className="fw-bold mb-4">Служба підтримки</h4>

      <div className="text-center mb-5">
        <Headphones size={60} className="text-primary mb-3" />
        <h5 className="fw-semibold">Швидка допомога (24/7)</h5>
        <p className="text-muted">
          Якщо у вас виникли проблеми з роботою системи, зверніться у службу
          підтримки.
        </p>
      </div>

      <div className="text-center">
        <Phone size={60} className="text-success mb-3" />
        <h6 className="fw-semibold">Контакти підтримки</h6>
        <ul className="list-unstyled text-muted small">
          <li className="mb-2">
            <strong>Телефон гарячої лінії: </strong>
            <a href="tel:0800123456" className="text-decoration-none text-primary fw-semibold">
              0-800-123-456
            </a>
          </li>
          <li className="mb-2">
            <strong>Email: </strong>
            <a href="mailto:support@bank.ua" className="text-decoration-none text-primary fw-semibold">
              support@bank.ua
            </a>
          </li>
          <li>
            <strong>Години роботи:</strong> Пн–Пт, 9:00–18:00
          </li>
        </ul>
      </div>
    </div>
  );
}
