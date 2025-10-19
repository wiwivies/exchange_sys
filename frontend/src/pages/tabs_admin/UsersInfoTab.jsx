import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaTrash,
  FaEdit,
  FaFilePdf,
  FaFileExcel,
} from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";

import UserEditModal from "./Users modals/UserEditModal";
import UserAddModal from "./Users modals/UserAddModal";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const UsersInfoTab = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [editUser, setEditUser] = useState(null);
  const [stats, setStats] = useState({ total: 0, admins: 0, cashiers: 0, avgAge: 0 });
  const [loading, setLoading] = useState(false);

  // Завантаження користувачів
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/usersAdmin"); // ⚠️ зроби відповідний endpoint у бекенді
      const data = res.data || [];
      setUsers(data);
      calculateStats(data);
    } catch (err) {
      console.error("Помилка отримання користувачів:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Розрахунок статистики
  const calculateStats = (data) => {
    if (!data || data.length === 0) {
      setStats({ total: 0, admins: 0, cashiers: 0, avgAge: 0 });
      return;
    }
    const admins = data.filter((u) => u.Rolle === "admin").length;
    const cashiers = data.filter((u) => u.Rolle === "cashier").length;
    const avgAge = Math.round(
      data.reduce((acc, u) => acc + getAge(u.JoinDate), 0) / data.length
    );
    setStats({ total: data.length, admins, cashiers, avgAge });
  };

  const getAge = (JoinDate) => {
    if (!JoinDate) return 0;
    const diff = Date.now() - new Date(JoinDate).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  };

  // Видалення користувача
  const handleDelete = async (id) => {
    if (!window.confirm("Ви впевнені, що хочете видалити користувача?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/usersAdmin/${id}`);
      const updated = users.filter((u) => u.UserID !== id);
      setUsers(updated);
      calculateStats(updated);
    } catch (err) {
      console.error("Помилка видалення користувача:", err);
    }
  };

  // Редагування
  const handleEdit = (user) => {
    setEditUser(user);
  };

  const handleSaveEdit = async (updatedUser) => {
    try {
      await axios.put(`http://localhost:5000/api/usersAdmin/${updatedUser.UserID}`, updatedUser);
      const updatedList = users.map((u) =>
        u.UserID === updatedUser.UserID ? { ...u, ...updatedUser } : u
      );
      setUsers(updatedList);
      setEditUser(null);
      calculateStats(updatedList);
    } catch (err) {
      console.error("Помилка редагування користувача:", err);
    }
  };

  const [showAddModal, setShowAddModal] = useState(false);

const handleAddUser = async (newUser) => {
  try {
    await axios.post("http://localhost:5000/api/usersAdmin", newUser);
    setShowAddModal(false);
    fetchUsers();
  } catch (err) {
    console.error("Помилка додавання користувача:", err);
  }
};

  // Фільтр пошуку
  const filteredUsers = users.filter((u) =>
    Object.values(u).some((val) =>
      val ? val.toString().toLowerCase().includes(search.toLowerCase()) : false
    )
  );

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

  // Експорт у PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text(transliterate("User Report"), 14, 15);

    autoTable(doc, {
      startY: 25,
      head: [[transliterate("ID"), transliterate("Ім’я"), transliterate("Прізвище"), transliterate("Роль"), transliterate("Email"), transliterate("Телефон")]],
      body: filteredUsers.map((u) => [
        u.UserID,
        transliterate(u.FirstName),
        transliterate(u.LastName),
        u.Rolle,
        transliterate(u.Email),
        transliterate(u.Phone || "-"),
      ]),
    });

    doc.save("users_report.pdf");
  };

  // Експорт у Excel
  const exportToExcel = () => {
    const wsData = filteredUsers.map((u) => ({
      ID: u.UserID,
      Імʼя: u.FirstName,
      Прізвище: u.LastName,
      Роль: u.Rolle,
      Email: u.Email,
      Телефон: u.Phone || "-",
      Дата_приєднання: u.JoinDate ? new Date(u.JoinDate).toLocaleDateString("uk-UA") : "-",
    }));

    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Працівники");
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([wbout], { type: "application/octet-stream" }), "users.xlsx");
  };

  return (
    <div className="card shadow-sm p-4">
      <h4 className="text-primary mb-3">Працівники банку</h4>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <input
          type="text"
          className="form-control w-50"
          placeholder="Пошук..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div>
        <button className="btn btn-primary me-3" onClick={() => setShowAddModal(true)}>
            Додати користувача
        </button>
          <button className="btn btn-danger me-2" onClick={exportToPDF}>
            <FaFilePdf /> PDF
          </button>
          <button className="btn btn-success" onClick={exportToExcel}>
            <FaFileExcel /> Excel
          </button>
        </div>
      </div>

      <div className="alert alert-info">
        <strong>📊 Статистика:</strong> Загалом {stats.total} працівників —{" "}
        {stats.admins} адміністраторів, {stats.cashiers} касирів. <br />
        Середня кількість років роботи: {stats.avgAge} років.
      </div>

      {loading ? (
        <p>Завантаження...</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-bordered align-middle">
            <thead className="table-secondary">
              <tr>
                <th>ID</th>
                <th>Ім’я</th>
                <th>Прізвище</th>
                <th>Роль</th>
                <th>Email</th>
                <th>Телефон</th>
                <th>Дата прийняття</th>
                <th>Дії</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.UserID}>
                  <td>{u.UserID}</td>
                  <td>{u.FirstName}</td>
                  <td>{u.LastName}</td>
                  <td>
                    <span className={`badge bg-${u.Rolle === "admin" ? "danger" : "success"}`}>
                      {u.Rolle}
                    </span>
                  </td>
                  <td>{u.Email}</td>
                  <td>{u.Phone || "—"}</td>
                  <td>{u.JoinDate ? new Date(u.JoinDate).toLocaleDateString("uk-UA") : "-"}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={() => handleEdit(u)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(u.UserID)}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {editUser && (
            <UserEditModal
                user={editUser}
                onClose={() => setEditUser(null)}
                onSave={handleSaveEdit}
            />
            )}

            {showAddModal && (
            <UserAddModal
                onClose={() => setShowAddModal(false)}
                onAdd={handleAddUser}
            />
            )}

    </div>
  );
};

export default UsersInfoTab;
