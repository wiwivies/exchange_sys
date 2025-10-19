import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

import OperationsTab from "./tabs/OperationsTab";
import RatesTab from "./tabs/RatesTab";
import ReportTab from "./tabs/ReportTab";
import ClientsTab from "./tabs/ClientsTab";
import SupportTab from "./tabs/SupportTab";

import { useUser } from "../hooks/useUser"; // 🔹 новий хук

export default function OperationsPage() {
  const [activeTab, setActiveTab] = useState("operations");
  const { user, logout } = useUser(); // ✅ тут отримуємо ім’я + роль + logout

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-grow-1 bg-light">
        <Header
          user={{
            firstName: user.name.split(" ")[0] || "",
            lastName: user.name.split(" ")[1] || "",
          }}
          logout={logout} activeTab={activeTab}
        />

        <div className="p-4">
          {activeTab === "operations" && <OperationsTab />}
          {activeTab === "rates" && <RatesTab />}
          {activeTab === "report" && <ReportTab />}
          {activeTab === "clients" && <ClientsTab />}
          {activeTab === "support" && <SupportTab />}
        </div>
      </div>
    </div>
  );
}
