import React, { useState } from "react";
import Sidebar_admin from "../components/Sidebar_admin";
import Header_admin from "../components/Header_admin";

import StatisticsTab from "./tabs_admin/StatisticsTab";
import RatesChangeTab from "./tabs_admin/RatesChangeTab";
import ReportsInfoTab from "./tabs_admin/ReportsInfoTab";
import ClientsInfoTab from "./tabs_admin/ClientsInfoTab";
import UsersInfoTab from "./tabs_admin/UsersInfoTab";

import { useUser } from "../hooks/useUser"; // 🔹 новий хук

export default function OperationsPage() {
  const [activeTab, setActiveTab] = useState("operations");
  const { user, logout } = useUser(); // ✅ тут отримуємо ім’я + роль + logout

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      <Sidebar_admin activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-grow-1 bg-light">
        <Header_admin
          user={{
            firstName: user.name.split(" ")[0] || "",
            lastName: user.name.split(" ")[1] || "",
          }}
          logout={logout} activeTab={activeTab}
        />

        <div className="p-4">
          {activeTab === "statistics" && <StatisticsTab />}
          {activeTab === "ratesInfo" && <RatesChangeTab />}
          {activeTab === "reportInfo" && <ReportsInfoTab />}
          {activeTab === "clientsInfo" && <ClientsInfoTab />}
          {activeTab === "usersInfo" && <UsersInfoTab />}
        </div>
      </div>
    </div>
  );
}

