import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaTrash, FaEdit, FaInfoCircle, FaFilePdf, FaFileExcel } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import ClientInfoModal from "./Clients modals/ClientInfoModal";
import ClientEditModal from "./Clients modals/ClientEditModal";

// 📦 для експорту
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const ClientsInfoTab = () => {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);
  const [editClient, setEditClient] = useState(null);
  const [stats, setStats] = useState({ totalClients: 0, avgAge: 0 });
  const [loadingClients, setLoadingClients] = useState(false);

  // --- Завантаження клієнтів ---
  const fetchClients = async () => {
    try {
      setLoadingClients(true);
const res = await axios.get("http://localhost:5000/api/clientsAdmin");      const data = res.data || [];
      setClients(data);
      calculateStats(data); // важливо: обчислити статистику тут
    } catch (err) {
      console.error("Помилка отримання клієнтів:", err);
    } finally {
      setLoadingClients(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // Статистика
  const calculateStats = (data) => {
    if (!data || data.length === 0) {
      setStats({ totalClients: 0, avgAge: 0 });
      return;
    }
    const total = data.length;
    const avgAge = Math.round(
      data.reduce((acc, c) => acc + getAge(c.DateOfBirth), 0) / total
    );
    setStats({ totalClients: total, avgAge });
  };

  const getAge = (birthDate) => {
    if (!birthDate) return 0;
    const diff = Date.now() - new Date(birthDate).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  };

  // --- Видалення клієнта ---
  const handleDelete = async (id) => {
    if (!window.confirm("Ви дійсно хочете видалити цього клієнта?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/clientsAdmin/${id}`);
      const updated = clients.filter((c) => c.ClientID !== id);
      setClients(updated);
      calculateStats(updated);
    } catch (err) {
      console.error("Помилка при видаленні клієнта:", err);
      alert("Не вдалось видалити клієнта. Перевір консоль для деталей.");
    }
  };

  // --- Інформація про клієнта (отримати операції та відкрити модалку) ---
  const handleInfo = async (clientId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/clientsAdmin/${clientId}/operations`);
      const client = clients.find((c) => c.ClientID === clientId);
      setSelectedClient({ ...client, operations: res.data || [] });
    } catch (err) {
      console.error("Помилка отримання історії операцій:", err);
      alert("Не вдалось завантажити історію операцій. Перевір консоль.");
    }
  };

  // --- Редагування клієнта ---
  const handleEdit = (client) => {
    setEditClient(client);
  };

  const handleSaveEdit = async (updatedClient) => {
    try {
      // Приводимо дати до формату ISO якщо є DateOfBirth у полі
      if (updatedClient.DateOfBirth) {
        // якщо пришло як Date або як строка — переконаємось
        const d = new Date(updatedClient.DateOfBirth);
        if (!isNaN(d)) updatedClient.DateOfBirth = d.toISOString().slice(0, 10); // YYYY-MM-DD
      }

await axios.put(`http://localhost:5000/api/clientsAdmin/${updatedClient.ClientID}`, updatedClient);

      const updatedList = clients.map((c) =>
        c.ClientID === updatedClient.ClientID ? { ...c, ...updatedClient } : c
      );
      setClients(updatedList);
      calculateStats(updatedList);
      setEditClient(null);
    } catch (err) {
      console.error("Помилка редагування клієнта:", err);
      alert("Не вдалось зберегти зміни. Перевір консоль.");
    }
  };

  // --- Пошук по всіх полях ---
  const filteredClients = clients.filter((c) =>
    Object.values(c).some((val) =>
      val ? val.toString().toLowerCase().includes(search.toLowerCase()) : false
    )
  );

  // Тимчасова функція для транслітерації кирилиці (PDF не підтримує українські букви без шрифту)
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
  return text
    .split("")
    .map((char) => map[char] || char)
    .join("");
};

   // --- 📄 Експорт у PDF ---
const exportToPDF = () => {
  const doc = new jsPDF();
  
  // Заголовок
  doc.setFontSize(16);
  // Таблиця
doc.text(transliterate("Customer report"), 14, 15);

autoTable(doc, {
  startY: 25,
  head: [
    [transliterate("ID"), transliterate("Ім’я"), transliterate("Прізвище"), transliterate("Паспорт"), transliterate("Телефон"), transliterate("Email")],
  ],
  body: filteredClients.map((c) => [
    c.ClientID,
    transliterate(c.FirstName),
    transliterate(c.LastName),
    transliterate(c.PassportNumber),
    transliterate(c.Phone),
    transliterate(c.Email),
  ]),
});

  // Зберегти
  doc.save("clients_report.pdf");
};

  // --- 📊 Експорт у Excel ---
  const exportToExcel = () => {
    const wsData = filteredClients.map((c) => ({
      ID: c.ClientID,
      "Ім’я": c.FirstName,
      "Прізвище": c.LastName,
      Паспорт: c.PassportNumber,
      Телефон: c.Phone,
      Email: c.Email,
      "Кількість операцій": c.OperationsCount ?? 0,
      "Дата створення": c.CreatedAt
        ? new Date(c.CreatedAt).toLocaleDateString("uk-UA")
        : "-",
    }));

    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Клієнти");

    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([wbout], { type: "application/octet-stream" }), "Clients_Report.xlsx");
  };


  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-center">Інформація про клієнтів</h2>

      <div className="row mb-4 text-center">
        <div className="col-md-6 mb-3">
          <div className="p-3 bg-light rounded shadow-sm">
            <p className="mb-1 text-secondary">Загальна кількість клієнтів у системі</p>
            <h4 className="fw-bold text-primary">{stats.totalClients}</h4>
          </div>
        </div>
        <div className="col-md-6 mb-3">
          <div className="p-3 bg-light rounded shadow-sm">
            <p className="mb-1 text-secondary">Середньостатистичний вік клієнтів</p>
            <h4 className="fw-bold text-primary">{stats.avgAge}</h4>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-between mb-3">
        <input
          type="text"
          className="form-control w-50"
          placeholder="Пошук клієнта..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div>
          <button className="btn btn-danger me-2" onClick={exportToPDF}>
            <FaFilePdf /> PDF
          </button>
          <button className="btn btn-success" onClick={exportToExcel}>
            <FaFileExcel /> Excel
          </button>
        </div>
      </div>

    <table className="table table-striped table-bordered align-middle">
        <thead className="table-secondary">
          <tr>
            <th>ID</th>
            <th>Ім’я</th>
            <th>Прізвище</th>
            <th>Паспорт</th>
            <th>Телефон</th>
            <th>Email</th>
            <th>Операцій</th>
            <th>Дата створення</th>
            <th>Дії</th>
          </tr>
        </thead>
        <tbody className="text-center">
          {loadingClients ? (
            <tr><td colSpan="9">Завантаження...</td></tr>
          ) : filteredClients.length > 0 ? (
            filteredClients.map((c) => (
              <tr key={c.ClientID}>
                <td>{c.ClientID}</td>
                <td>{c.FirstName}</td>
                <td>{c.LastName}</td>
                <td>{c.PassportNumber}</td>
                <td>{c.Phone}</td>
                <td>{c.Email}</td>
                <td>{c.OperationsCount ?? 0}</td>
                <td>{c.CreatedAt ? new Date(c.CreatedAt).toLocaleDateString("uk-UA") : "-"}</td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-info me-1"
                    title="Інформація"
                    onClick={() => handleInfo(c.ClientID)}
                  >
                    <FaInfoCircle />
                  </button>
                  <button
                    className="btn btn-sm btn-outline-warning me-1"
                    title="Редагувати"
                    onClick={() => handleEdit(c)}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    title="Видалити"
                    onClick={() => handleDelete(c.ClientID)}
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="9" className="text-muted">Клієнтів не знайдено</td></tr>
          )}
        </tbody>
      </table>

      {selectedClient && (
        <ClientInfoModal
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
        />
      )}

      {editClient && (
        <ClientEditModal
          client={editClient}
          onClose={() => setEditClient(null)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
};

export default ClientsInfoTab;