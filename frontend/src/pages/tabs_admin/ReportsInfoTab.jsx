import React, { useState, useEffect } from "react";
import { Button, Table, Form, Row, Col } from "react-bootstrap";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export default function ReportsInfoTab() {
  const [operations, setOperations] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [cashierId, setCashierId] = useState("");
  const [pointId, setPointId] = useState("");
  const [stats, setStats] = useState({ totalOperations: 0, mostPopularCurrency: "—" });

  useEffect(() => {
    fetchStats();
    fetchOperations();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/getAdminStats");
      setStats(res.data);
    } catch (err) {
      console.error("❌ Помилка статистики:", err);
    }
  };

  const fetchOperations = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/getAdminReport", {
        params: { fromDate, toDate, cashierId, pointId },
      });
      setOperations(res.data || []);
    } catch (err) {
      console.error("❌ Помилка отримання операцій:", err);
    }
  };

    // Транслітерація
  const transliterate = (text) => {
    const map = {
      А: "A", а: "a", Б: "B", б: "b", В: "V", в: "v",
      Г: "H", г: "h", Ґ: "G", ґ: "g", Д: "D", д: "d",
      Е: "E", е: "e", Є: "Ye", є: "ie", Ж: "Zh", ж: "zh",
      З: "Z", з: "z", И: "Y", и: "y", І: "I", і: "i",
      Ї: "Yi", ї: "i", Й: "Y", й: "y", К: "K", к: "k",
      Л: "L", л: "l", М: "M", м: "m", Н: "N", н: "n",
      О: "O", о: "o", П: "P", п: "p", Р: "R", р: "r",
      С: "S", с: "s", Т: "T", т: "t", У: "U", у: "u",
      Ф: "F", ф: "f", Х: "Kh", х: "kh", Ц: "Ts", ц: "ts",
      Ч: "Ch", ч: "ch", Ш: "Sh", ш: "sh", Щ: "Shch", щ: "shch",
      Ю: "Yu", ю: "iu", Я: "Ya", я: "ia",
    };
    return text.split("").map((char) => map[char] || char).join("");
  };
  
const exportToPDF = () => {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("Administrative report", 14, 15);

  const tableColumn = [
    "ID",
    "Cashier",
    "Client",
    "Point",
    "Currency 1*",
    "Amount",
    "Currency 2*",
    "Result",
    "Date/time",
  ];

  const tableRows = operations.map((op) => [
    op.OperationID,
    transliterate(op.CashierName),
    transliterate(op.ClientName),
    transliterate(op.PointName),
    transliterate(op.FromCurrency),
    op.AmountFrom,
    transliterate(op.ToCurrency),
    op.AmountTo,
    new Date(op.OperationDate).toLocaleString("uk-UA"),
  ]);

  autoTable(doc, { head: [tableColumn], body: tableRows, startY: 25 });
  doc.save("admin_report.pdf");
};

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(operations);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Admin Report");
    XLSX.writeFile(workbook, "admin_report.xlsx");
  };

  return (
    <div className="p-4 bg-light rounded">

      {/* Картки статистики */}
      <div className="d-flex gap-3 mb-4 flex-wrap">
        <div className="p-3 bg-primary text-white rounded flex-fill text-center shadow-sm">
          <h6>Загальна кількість операцій за день</h6>
          <h3>{stats.totalOperations}</h3>
        </div>
        <div className="p-3 bg-info text-white rounded flex-fill text-center shadow-sm">
          <h6>Найпопулярніша валюта</h6>
          <h3>{stats.mostPopularCurrency}</h3>
        </div>
        <div className="p-3 bg-secondary text-white rounded flex-fill text-center shadow-sm">
          <h6>Валютна база</h6>
          <h3>ExchangeSys</h3>
        </div>
      </div>

      {/* 🔍 Фільтри */}
      <div className="p-3 bg-white border rounded shadow-sm mb-4">
        <h6 className="fw-bold mb-3">Фільтр пошуку</h6>
        <Row className="g-3 align-items-center">
          <Col xs={12} md={3}>
            <Form.Label>Від дати</Form.Label>
            <Form.Control
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </Col>
          <Col xs={12} md={3}>
            <Form.Label>До дати</Form.Label>
            <Form.Control
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </Col>
          <Col xs={12} md={3}>
            <Form.Label>ID касира</Form.Label>
            <Form.Control
              type="number"
              placeholder="Наприклад: 1"
              value={cashierId}
              onChange={(e) => setCashierId(e.target.value)}
            />
          </Col>
          <Col xs={12} md={3}>
            <Form.Label>ID пункту</Form.Label>
            <Form.Control
              type="number"
              placeholder="Наприклад: 2"
              value={pointId}
              onChange={(e) => setPointId(e.target.value)}
            />
          </Col>
        </Row>

        {/* Кнопки під фільтром */}
        <div className="d-flex justify-content-between align-items-center mt-4 flex-wrap gap-2">
          <Button variant="primary" onClick={fetchOperations}>
            Застосувати
          </Button>

          <div className="d-flex gap-2">
            <Button variant="success" onClick={exportToPDF}>
              ⬇️ Експорт в PDF
            </Button>
            <Button variant="warning" onClick={exportToExcel}>
              ⬇️ Експорт в Excel
            </Button>
          </div>
        </div>
      </div>

      {/* 📋 Таблиця */}
      <Table striped bordered hover responsive>
        <thead className="table-secondary">
          <tr>
            <th>ID</th>
            <th>Касир</th>
            <th>Клієнт</th>
            <th>Пункт</th>
            <th>Валюта 1*</th>
            <th>Сума</th>
            <th>Валюта 2*</th>
            <th>Результат</th>
            <th>Дата / час</th>
          </tr>
        </thead>
        <tbody>
          {operations.length > 0 ? (
            operations.map((op) => (
              <tr key={op.OperationID}>
                <td>{op.OperationID}</td>
                <td>{op.CashierName}</td>
                <td>{op.ClientName}</td>
                <td>{op.PointName}</td>
                <td>{op.FromCurrency}</td>
                <td>{op.AmountFrom}</td>
                <td>{op.ToCurrency}</td>
                <td>{op.AmountTo}</td>
                <td>{new Date(op.OperationDate).toLocaleString("uk-UA")}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={9} className="text-center text-muted">
                Немає даних для відображення
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      <p className="mt-2 text-muted" style={{ fontSize: "0.85rem" }}>
        Валюта 1* — надається клієнтом. Валюта 2* — видається клієнту при обміні.
      </p>
    </div>
  );
}
