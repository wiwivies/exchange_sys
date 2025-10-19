import React, { useState } from "react";

const UserEditModal = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({ ...user });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    onSave(formData);
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
          <div className="modal-header bg-warning">
            <h5 className="modal-title">Редагування користувача</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            <div className="form-group mb-2">
              <label>Ім’я</label>
              <input
                name="FirstName"
                value={formData.FirstName || ""}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            <div className="form-group mb-2">
              <label>Прізвище</label>
              <input
                name="LastName"
                value={formData.LastName || ""}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            <div className="form-group mb-2">
              <label>Логін</label>
              <input
                name="Login_name"
                value={formData.Login_name || ""}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            <div className="form-group mb-2">
              <label>Email</label>
              <input
                name="Email"
                type="email"
                value={formData.Email || ""}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            <div className="form-group mb-2">
              <label>Телефон</label>
              <input
                name="Phone"
                value={formData.Phone || ""}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            <div className="form-group mb-2">
              <label>Роль</label>
              <select
                name="Rolle"
                value={formData.Rolle || "cashier"}
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
                value={formData.PointID || ""}
                onChange={handleChange}
                className="form-control"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Скасувати
            </button>
            <button className="btn btn-success" onClick={handleSave}>
              Зберегти
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserEditModal;
