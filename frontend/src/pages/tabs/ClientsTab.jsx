import React, { useEffect, useState } from "react";
import { Table, Button, Form, InputGroup } from "react-bootstrap";
import { Search } from "react-bootstrap-icons";
import AddClientModal from "./Client modals/AddClientModal";
import axios from "axios";

export default function ClientsTab() {
  const [clients, setClients] = useState([]);
  const [searchId, setSearchId] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newClient, setNewClient] = useState({
    FirstName: "",
    LastName: "",
    PassportNumber: "",
    DateOfBirth: "",
    Phone: "",
    Email: "",
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/clients");
      setClients(res.data);
    } catch (err) {
      console.error("Error fetching clients:", err);
    }
  };
const handleAddClient = async (e) => {
  e.preventDefault();
  try {
    // робимо запит і отримуємо відповідь
    const res = await axios.post("http://localhost:5000/api/clients", newClient);

    // додаємо клієнта в кінець таблиці
    setClients((prev) => [
      ...prev,
      {
        ...newClient,
        ClientID: res.data.ClientID, // з бекенду
        CreatedAt: res.data.createdAt, // з бекенду
      },
    ]);

    setShowModal(false);

    // очищаємо форму
    setNewClient({
      FirstName: "",
      LastName: "",
      PassportNumber: "",
      DateOfBirth: "",
      Phone: "",
      Email: "",
    });
  } catch (err) {
    console.error("Error adding client:", err);
  }
};

  const filtered = clients.filter((c) =>
    c.ClientID.toString().includes(searchId)
  );

  return (
    <div className="p-4 bg-light rounded">
      <div className="d-flex align-items-center mb-3">
        <InputGroup style={{ maxWidth: "650px" }}>
          <InputGroup.Text>
            <Search />
          </InputGroup.Text>
          <Form.Control
            placeholder="Пошук за ID клієнта"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            style={{
      borderColor: "#ccccccbb",       // сіра рамка
      borderWidth: "5px",
      borderRadius: "0 6px 6px 0", // закруглені праві краї
      width: "500px"
    }}
          />
        </InputGroup>
        <Button variant="primary" className="ms-3" onClick={() => setShowModal(true)}>
          + Додати клієнта
        </Button>
      </div>

      <Table striped bordered hover responsive>
        <thead className="table-secondary">
          <tr>
            <th>ID</th>
            <th>ПІБ</th>
            <th>Паспорт</th>
            <th>Телефон</th>
            <th>Email</th>
            <th>Дата народження</th>
            <th>Дата створення</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((c) => (
            <tr key={c.ClientID}>
              <td>{c.ClientID}</td>
              <td>{c.LastName} {c.FirstName}</td>
              <td>{c.PassportNumber}</td>
              <td>{c.Phone}</td>
              <td>{c.Email}</td>
              <td>{new Date(c.DateOfBirth).toLocaleDateString()}</td>
              <td>{new Date(c.CreatedAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      <AddClientModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onSubmit={handleAddClient}
        client={newClient}
        setClient={setNewClient}
      />
    </div>
  );
}