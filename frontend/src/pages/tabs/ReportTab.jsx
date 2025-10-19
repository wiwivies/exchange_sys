import React, { useEffect, useState } from "react";
import { Button, Table, Form } from "react-bootstrap";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function CashierReportTab() {
  const cashierId = parseInt(localStorage.getItem("userId"), 10);
  const [operations, setOperations] = useState([]);
  const [period, setPeriod] = useState("all");

  useEffect(() => {
    fetchOperations();
  }, [period]);

  const fetchOperations = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/reports/getCashierReport`,
        { params: { cashierId, period } }
      );
      setOperations(res.data || []);
    } catch (err) {
      console.error("❌ Помилка отримання операцій:", err);
    }
  };

  // 🧾 Export to PDF
const exportToPDF = () => {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(`Cashier Report (${getPeriodLabel(period)})`, 14, 15);

  const tableColumn = [
    "ID",
    "Client",
    "Exchange Point",
    "From",
    "To",
    "Amount (from)",
    "Amount (to)",
    "Total (UAH)",
    "Date",
  ];

  const tableRows = operations.map((op) => [
    op.OperationID,
    op.ClientName,
    op.PointName,
    op.FromCurrency,
    op.ToCurrency,
    op.AmountFrom,
    op.AmountTo,
    op.TotalUAH,
    new Date(op.OperationDate).toLocaleString("en-GB"),
  ]);

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 25,
  });

  doc.save(`cashier_report_${period}.pdf`);
};


  const getPeriodLabel = (p) => {
    switch (p) {
      case "today":
        return "today";
      case "month":
        return "this month";
      default:
        return "all time";
    }
  };

  return (
    <div className="p-4 bg-light rounded">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Form.Select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          style={{ width: "250px", borderColor: "#ccc" }}
        >
          <option value="all">Усі операції</option>
          <option value="today">Сьогодні</option>
          <option value="month">За місяць</option>
        </Form.Select>
        <Button variant="success" onClick={exportToPDF}>
          Експорт у PDF
        </Button>
      </div>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Клієнт</th>
            <th>Пункт</th>
            <th>Звідки</th>
            <th>Куди</th>
            <th>Сума From</th>
            <th>Сума To</th>
            <th>₴</th>
            <th>Дата</th>
          </tr>
        </thead>
        <tbody>
          {operations.length > 0 ? (
            operations.map((op) => (
              <tr key={op.OperationID}>
                <td>{op.OperationID}</td>
                <td>{op.ClientName}</td>
                <td>{op.PointName}</td>
                <td>{op.FromCurrency}</td>
                <td>{op.ToCurrency}</td>
                <td>{op.AmountFrom}</td>
                <td>{op.AmountTo}</td>
                <td>{op.TotalUAH}</td>
                <td>{new Date(op.OperationDate).toLocaleString("uk-UA")}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={9} className="text-center">
                Немає операцій
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
}

// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import "bootstrap/dist/css/bootstrap.min.css";

// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";
// // Імпортуємо файл шрифту як бинар або base64
// import RobotoTTF from "../../fonts/Roboto-Regular.ttf"; // залежно від налаштувань bundler
// async function loadFontAsBase64(url) {
//   const response = await fetch(url);
//   const blob = await response.blob();
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     reader.onloadend = () => {
//       resolve(reader.result.split(",")[1]); // base64 частина
//     };
//     reader.onerror = reject;
//     reader.readAsDataURL(blob);
//   });
// }

// export default function ReportTab() {
//   const [operations, setOperations] = useState([]);
//   const [period, setPeriod] = useState("today");
//   const [loading, setLoading] = useState(false);

//   const cashierId = 1; // <-- поточний касир (замінити на реальний з auth)

//   useEffect(() => {
//     fetchData();
//   }, [period]);

//   const fetchData = async () => {
//     try {
//       setLoading(true);
//       const res = await axios.get(`http://localhost:5000/api/reports`, {
//         params: { cashierId, period },
//       });
//           console.log("🔍 Дані з сервера:", res.data); // ✅ ось сюди встав

//       setOperations(res.data);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const exportToPDF = async () => {
//   const doc = new jsPDF();

//   // Load font and register it
//   const fontBase64 = await loadFontAsBase64(RobotoTTF);
//   doc.addFileToVFS("Roboto-Regular.ttf", fontBase64);
//   doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
//   doc.setFont("Roboto", "normal");

//   // Title
//   doc.setFontSize(14);
//   doc.text("Cashier Report", 14, 15);

//   // Table
//   autoTable(doc, {
//     startY: 25,
//     head: [
//       [
//         "#",
//         "Type",
//         "Date / Time",
//         "Client ID",
//         "Currency From",
//         "Amount From",
//         "Currency To",
//         "Amount To",
//       ],
//     ],
//     body: operations.map((op, i) => [
//       i + 1,
//       op["Type"] || op["Тип"], // fallback if backend still returns Ukrainian
//       op["DateTime"] || op["Дата / час"],
//       op["ClientID"] || op["ID клієнта"],
//       op["CurrencyFrom"] || op["Валюта1"],
//       op["AmountFrom"] || op["Сума"],
//       op["CurrencyTo"] || op["Валюта2"],
//       op["AmountTo"] || op["Результат"],
//     ]),
//     styles: {
//       font: "Roboto",
//       fontSize: 10,
//       cellPadding: 3,
//     },
//     headStyles: {
//       fillColor: [41, 128, 185],
//       textColor: 255,
// fontStyle: "normal",    
// },
//   });

//   doc.save("cashier_report.pdf");
// };

//   return (
//     <div className="p-4 bg-light rounded">
//       <div className="d-flex justify-content-between align-items-center mb-3">
//         {/* ✅ кнопка, що викликає exportToPDF */}
//         <button onClick={exportToPDF} className="btn btn-primary btn-sm">
//           Експорт в PDF
//         </button>
//       </div>

//       {/* Кнопки фільтру */}
//       <div className="btn-group mb-3">
//         <button
//           className={`btn btn-${period === "today" ? "primary" : "outline-primary"}`}
//           onClick={() => setPeriod("today")}
//         >
//           Сьогодні
//         </button>
//         <button
//           className={`btn btn-${period === "month" ? "primary" : "outline-primary"}`}
//           onClick={() => setPeriod("month")}
//         >
//           Місяць
//         </button>
//         <button
//           className={`btn btn-${period === "all" ? "primary" : "outline-primary"}`}
//           onClick={() => setPeriod("all")}
//         >
//           За весь час
//         </button>
//       </div>

//       {/* Таблиця */}
//       <div className="table-responsive">
//         {loading ? (
//           <div className="text-center py-4">
//             <div className="spinner-border text-primary" role="status"></div>
//           </div>
//         ) : (
//           <table className="table table-striped table-bordered align-middle">
//             <thead className="table-secondary text-center">
//               <tr>
//                 <th>#</th>
//                 <th>Тип</th>
//                 <th>Дата / час</th>
//                 <th>ID клієнта</th>
//                 <th>Валюта 1*</th>
//                 <th>Сума</th>
//                 <th>Валюта 2*</th>
//                 <th>Результат</th>
//               </tr>
//             </thead>
//             <tbody>
//               {operations.length === 0 ? (
//                 <tr>
//                   <td colSpan="8" className="text-center">
//                     Даних немає
//                   </td>
//                 </tr>
//               ) : (
//                 operations.map((op, idx) => (
//                   <tr key={idx}>
//                     <td>{idx + 1}</td>
//                     <td>{op["Тип"]}</td>
//                     <td>{op["Дата / час"]}</td>
//                     <td>{op["ID клієнта"]}</td>
//                     <td>{op["Валюта1"]}</td>
//                     <td>{op["Сума"]}</td>
//                     <td>{op["Валюта2"]}</td>
//                     <td>{op["Результат"]}</td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         )}
//       </div>

//       <p className="mt-2 text-muted small">
//         Валюта 1* — надається клієнтом. <br />
//         Валюта 2* — видається банком клієнту при обміні.
//       </p>
//     </div>
//   );
// 
