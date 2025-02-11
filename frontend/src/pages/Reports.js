import React, { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import "../style.css";
import { BsThreeDotsVertical } from "react-icons/bs";

const dummyReports = [
    { id: 1, asset: "Laptop", owner: "Mario Rossi", action: "Assegnato", date: "2024-02-05" },
    { id: 2, asset: "Stampante", owner: "Luca Bianchi", action: "Restituito", date: "2024-01-20" },
];

function Reports() {
    const [reports, setReports] = useState(dummyReports);
    const [menuOpen, setMenuOpen] = useState(null);
    const menuRefs = useRef({});

    useEffect(() => {
        function handleClickOutside(event) {
            if (menuOpen !== null && !menuRefs.current[menuOpen]?.contains(event.target)) {
                setMenuOpen(null);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuOpen]);

    const toggleMenu = (id) => {
        setMenuOpen(menuOpen === id ? null : id);
    };

    const handleAction = (action, id) => {
        alert(`Hai selezionato "${action}" per il report con ID ${id}`);
        setMenuOpen(null);
    };

    return (
        <>
            <Navbar />
            <div className="table-container">
                <h1>Storico Movimenti</h1>
                <table className="styled-table">
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Asset</th>
                        <th>Proprietario</th>
                        <th>Azione</th>
                        <th>Data</th>
                        <th>Azioni</th>
                    </tr>
                    </thead>
                    <tbody>
                    {reports.map((report) => (
                        <tr key={report.id}>
                            <td>{report.id}</td>
                            <td>{report.asset}</td>
                            <td>{report.owner}</td>
                            <td>{report.action}</td>
                            <td>{report.date}</td>
                            <td className="actions-column">
                                <div className="dropdown" ref={(el) => (menuRefs.current[report.id] = el)}>
                                    <BsThreeDotsVertical className="menu-icon" onClick={() => toggleMenu(report.id)} />
                                    {menuOpen === report.id && (
                                        <div className="dropdown-menu show">
                                            <p onClick={() => handleAction("Modifica", report.id)}>✏️ Modifica</p>
                                            <p onClick={() => handleAction("Rimuovi", report.id)}>🗑️ Rimuovi</p>
                                        </div>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}

export default Reports;


