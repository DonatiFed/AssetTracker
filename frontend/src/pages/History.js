import React, { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import UserInfo from "../components/UserInfo";
import "../style.css";
import { BsThreeDotsVertical } from "react-icons/bs";

// Mock data per la cronologia
const mockHistory = [
    { id: 1, user_id: 101, user_name: "Mario Rossi", asset_id: 1, asset_name: "Laptop", action: "Acquisito", date: "2024-02-10", location: "Sede Centrale" },
    { id: 2, user_id: 102, user_name: "Laura Bianchi", asset_id: 2, asset_name: "Monitor", action: "Rilasciato", date: "2024-02-08", location: "Ufficio Milano" },
    { id: 3, user_id: 103, user_name: "Giovanni Verdi", asset_id: 3, asset_name: "Mouse", action: "Acquisito", date: "2024-02-05", location: "Sede Centrale" }
];

function History() {
    const [history, setHistory] = useState(mockHistory);
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
        alert(`Hai selezionato "${action}" per la cronologia con ID ${id}`);
        setMenuOpen(null);
    };

    return (
        <>
            <Navbar />
            <div className="content-container">
                <UserInfo />

                <div className="table-container">
                    <div className="table-header">
                        <h1>Storico Azioni</h1>
                        {role === "manager" && (
                            <button className="add-button" onClick={() => setShowModal(true)}>➕ Aggiungi Record</button>
                        )}
                    </div>

                    <table className="styled-table">
                        <thead>
                        <tr>
                            {role === "manager" && <th>ID Utente</th>}
                            {role === "manager" && <th>Nome Utente</th>}
                            <th>ID Prodotto</th>
                            <th>Nome Prodotto</th>
                            <th>Azione</th>
                            <th>Data</th>
                            <th>Luogo</th>
                            {role === "manager" && <th>Azioni</th>}
                        </tr>
                        </thead>
                        <tbody>
                        {history.map((record) => (
                            <tr key={record.id}>
                                {role === "manager" && <td>{record.user_id}</td>}
                                {role === "manager" && <td>{record.user_name}</td>}
                                <td>{record.asset_id}</td>
                                <td>{record.asset_name}</td>
                                <td>{record.action}</td>
                                <td>{record.date}</td>
                                <td>{record.location}</td>
                                {role === "manager" && (
                                    <td className="actions-column">
                                        <div className="dropdown" ref={(el) => (menuRefs.current[record.id] = el)}>
                                            <BsThreeDotsVertical className="menu-icon" onClick={() => toggleMenu(record.id)} />
                                            {menuOpen === record.id && (
                                                <div className="dropdown-menu show">
                                                    <p onClick={() => handleAction("Modifica", record.id)}>✏️ Modifica</p>
                                                    <p onClick={() => handleAction("Rimuovi", record.id)}>🗑️ Rimuovi</p>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

export default History;
