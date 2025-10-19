import React from "react";
import shortlogo from "../assets/shortlogo.png";
import "./Sidebar.css";
 
export default function Sidebar_admin({ activeTab, setActiveTab }) {
  return (
    <div className="d-flex flex-column bg-custom text-white p-3" style={{ width: "240px" }}>
      <div className="text-center mb-4">
        <img src={shortlogo} alt="Finestra" style={{ width: "50px"}} />
        <hr/>
      </div>
      <ul className="nav nav-pills flex-column mb-auto">
        <li className="nav-item">
          <button
            className={`nav-link text-start w-100 ${activeTab === "statistics" ? "active bg-primary" : "text-white"}`}
            onClick={() => setActiveTab("statistics")}
          >
            Коротка статистика
          </button>
        </li>
        <li>
          <button
            className={`nav-link text-start w-100 ${activeTab === "ratesInfo" ? "active bg-primary" : "text-white"}`}
            onClick={() => setActiveTab("ratesInfo")}
          >
            Курс валют
          </button>
        </li>
        <li>
          <button
            className={`nav-link text-start w-100 ${activeTab === "reportInfo" ? "active bg-primary" : "text-white"}`}
            onClick={() => setActiveTab("reportInfo")}
          >
            Звітність
          </button>
        </li>
        <li>
          <button
            className={`nav-link text-start w-100 ${activeTab === "clientsInfo" ? "active bg-primary" : "text-white"}`}
            onClick={() => setActiveTab("clientsInfo")}
          >
            База клієнтів
          </button>
        </li>
        <li>
          <button
            className={`nav-link text-start w-100 ${activeTab === "usersInfo" ? "active bg-primary" : "text-white"}`}
            onClick={() => setActiveTab("usersInfo")}
          >
            Користувачі системи
          </button>
        </li>
      </ul>
    </div>
  );
}
