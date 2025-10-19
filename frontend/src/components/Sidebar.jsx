import React from "react";
import shortlogo from "../assets/shortlogo.png";
import "./Sidebar.css";
 
export default function Sidebar({ activeTab, setActiveTab }) {
  return (
    <div className="d-flex flex-column bg-custom text-white p-3" style={{ width: "240px" }}>
      <div className="text-center mb-4">
        <img src={shortlogo} alt="Finestra" style={{ width: "50px"}} />
        <hr/>
      </div>
      <ul className="nav nav-pills flex-column mb-auto">
        <li className="nav-item">
          <button
            className={`nav-link text-start w-100 ${activeTab === "operations" ? "active bg-primary" : "text-white"}`}
            onClick={() => setActiveTab("operations")}
          >
            Операції
          </button>
        </li>
        <li>
          <button
            className={`nav-link text-start w-100 ${activeTab === "rates" ? "active bg-primary" : "text-white"}`}
            onClick={() => setActiveTab("rates")}
          >
            Курс валют
          </button>
        </li>
        <li>
          <button
            className={`nav-link text-start w-100 ${activeTab === "report" ? "active bg-primary" : "text-white"}`}
            onClick={() => setActiveTab("report")}
          >
            Звіт
          </button>
        </li>
        <li>
          <button
            className={`nav-link text-start w-100 ${activeTab === "clients" ? "active bg-primary" : "text-white"}`}
            onClick={() => setActiveTab("clients")}
          >
            База клієнтів
          </button>
        </li>
        <li>
          <button
            className={`nav-link text-start w-100 ${activeTab === "support" ? "active bg-primary" : "text-white"}`}
            onClick={() => setActiveTab("support")}
          >
            Служба підтримки
          </button>
        </li>
      </ul>
    </div>
  );
}
