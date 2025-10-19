import React, { useState } from "react";

const UserAddModal = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    FirstName: "",
    LastName: "",
    Login_name: "",
    PasswordHash: "",
    Email: "",
    Phone: "",
    Rolle: "cashier",
    PointID: "",
    JoinDate: new Date().toISOString().split("T")[0],
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAdd = () => {
    onAdd(formData);
  };

  return (
    <div
      className="modal show fade d-block"
      tabIndex="-1"
      onClick={onClose}
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">Додати користувача</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            <div className="form-group mb-2">
              <label>Ім’я</label>
              <input
                name="FirstName"
                value={formData.FirstName}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            <div className="form-group mb-2">
              <label>Прізвище</label>
              <input
                name="LastName"
                value={formData.LastName}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            <div className="form-group mb-2">
              <label>Логін</label>
              <input
                name="Login_name"
                value={formData.Login_name}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            <div className="form-group mb-2">
              <label>Пароль</label>
              <input
                name="PasswordHash"
                type="password"
                value={formData.PasswordHash}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            <div className="form-group mb-2">
              <label>Email</label>
              <input
                name="Email"
                type="email"
                value={formData.Email}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            <div className="form-group mb-2">
              <label>Телефон</label>
              <input
                name="Phone"
                value={formData.Phone}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            <div className="form-group mb-2">
              <label>Роль</label>
              <select
                name="Rolle"
                value={formData.Rolle}
                onChange={handleChange}
                className="form-select"
              >
                <option value="admin">Адміністратор</option>
                <option value="cashier">Касир</option>
              </select>
            </div>
            <div className="form-group mb-2">
              <label>ID пункту обміну</label>
              <input
                name="PointID"
                type="number"
                value={formData.PointID}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            <div className="form-group mb-2">
              <label>Дата прийняття</label>
              <input
                name="JoinDate"
                type="date"
                value={formData.JoinDate}
                onChange={handleChange}
                className="form-control"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Скасувати
            </button>
            <button className="btn btn-success" onClick={handleAdd}>
              Додати
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserAddModal;
