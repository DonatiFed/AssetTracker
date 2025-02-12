import React, { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import UserInfo from "../components/UserInfo";
import "../style.css";
import { BsThreeDotsVertical } from "react-icons/bs";

// Mock data per i report
const mockReports = [
    { id: 1, user_id: 101, user_name: "Mario Rossi", asset_id: 1, asset_name: "Laptop", title: "Problema batteria", description: "La batteria non si carica oltre il 50%", created_at: "2024-02-10" },
    { id: 2, user_id: 102, user_name: "Laura Bianchi", asset_id: 2, asset_name: "Monitor", title: "Pixel bruciati", description: "Il monitor ha dei pixel morti visibili", created_at: "2024-02-08" },
    { id: 3, user_id: 103, user_name: "Giovanni Verdi", asset_id: 3, asset_name: "Mouse", title: "Tasto non funziona", description: "Il tasto destro non risponde", created_at: "2024-02-05" }
];

function Reports() {
    const [reports, setReports] = useState(mockReports);
    const [menuOpen, setMenuOpen] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [role, setRole] = useState(null);
    const menuRefs = useRef({});

    useEffect(() => {
        // Recupero ruolo utente
        const fetchUserRole = async () => {
            const storedRole = localStorage.getItem("user_role");
            setRole(storedRole);
        };
        fetchUserRole();
    }, []);

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
            <div className="content-container">
                <UserInfo />

                <div className="table-container">
                    <div className="table-header">
                        <h1>Gestione Report</h1>
                        <button className="add-button" onClick={() => setShowModal(true)}>➕ Aggiungi Report</button>
                    </div>

                    <table className="styled-table">
                        <thead>
                        <tr>
                            {role === "manager" && <th>ID Utente</th>}
                            {role === "manager" && <th>Nome Utente</th>}
                            <th>ID Asset</th>
                            <th>Nome Asset</th>
                            <th>Titolo</th>
                            <th>Descrizione</th>
                            <th>Data Creazione</th>
                            <th>Azioni</th>
                        </tr>
                        </thead>
                        <tbody>
                        {reports.map((report) => (
                            <tr key={report.id}>
                                {role === "manager" && <td>{report.user_id}</td>}
                                {role === "manager" && <td>{report.user_name}</td>}
                                <td>{report.asset_id}</td>
                                <td>{report.asset_name}</td>
                                <td>{report.title}</td>
                                <td>{report.description}</td>
                                <td>{report.created_at}</td>
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
            </div>
        </>
    );
}

export default Reports;


