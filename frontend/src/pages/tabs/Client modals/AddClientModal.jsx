import React from "react";
import { Modal, Button, Form } from "react-bootstrap";

export default function AddClientModal({ show, onHide, onSubmit, client, setClient }) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Додати клієнта</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={onSubmit}>
          <Form.Control
            className="mb-2"
            placeholder="Ім’я"
            value={client.FirstName}
            onChange={(e) => setClient({ ...client, FirstName: e.target.value })}
            required
          />
          <Form.Control
            className="mb-2"
            placeholder="Прізвище"
            value={client.LastName}
            onChange={(e) => setClient({ ...client, LastName: e.target.value })}
            required
          />
          <Form.Control
            className="mb-2"
            placeholder="Паспорт"
            value={client.PassportNumber}
            onChange={(e) => setClient({ ...client, PassportNumber: e.target.value })}
            required
          />
          <Form.Control
            className="mb-2"
            type="date"
            value={client.DateOfBirth}
            onChange={(e) => setClient({ ...client, DateOfBirth: e.target.value })}
            required
          />
          <Form.Control
            className="mb-2"
            placeholder="Телефон"
            value={client.Phone}
            onChange={(e) => setClient({ ...client, Phone: e.target.value })}
          />
          <Form.Control
            className="mb-2"
            placeholder="Email"
            value={client.Email}
            onChange={(e) => setClient({ ...client, Email: e.target.value })}
          />
          <div className="d-flex justify-content-end mt-3">
            <Button variant="secondary" className="me-2" onClick={onHide}>
              Скасувати
            </Button>
            <Button type="submit" variant="primary">
              Підтвердити
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
