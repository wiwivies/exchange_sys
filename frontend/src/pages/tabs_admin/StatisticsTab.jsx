import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function StatisticsTab() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/statistics/short")
      .then((res) => setStats(res.data))
      .catch((err) =>
        console.error("❌ Помилка завантаження статистики:", err)
      );
  }, []);

  if (!stats) return <div>Завантаження...</div>;

  const { operationsToday, totalUSD, totalUAH, weekData } = stats;

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="p-4 bg-white rounded shadow-sm text-center">
            <h6 className="text-secondary">Операцій за день</h6>
            <h3 className="fw-bold mt-2">{operationsToday}</h3>
          </div>
        </div>

        <div className="col-md-4">
          <div className="p-4 bg-white rounded shadow-sm text-center">
            <h6 className="text-secondary">
              Загальна кількість доларів у всіх пунктах
            </h6>
            <h3 className="fw-bold mt-2">{totalUSD.toLocaleString()} USD</h3>
          </div>
        </div>

        <div className="col-md-4">
          <div className="p-4 bg-white rounded shadow-sm text-center">
            <h6 className="text-secondary">
              Загальна кількість гривень у всіх пунктах
            </h6>
            <h3 className="fw-bold mt-2">{totalUAH.toLocaleString()} UAH</h3>
          </div>
        </div>
      </div>

      <div className="p-4 bg-white rounded shadow-sm">
        <h6 className="text-secondary mb-3">
          Динаміка обігу операцій (тиждень)
        </h6>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={weekData}>
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#0d6efd"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
