import React, { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import UserInfo from "../components/UserInfo"; // Mostra il ruolo dell'utente
import "../style.css";
import { BsThreeDotsVertical } from "react-icons/bs";

// Mock data temporanei
const mockAssets = [
    { id: 1, name: "Laptop", description: "MacBook Pro 16''", available_quantity: 5 ,created_at: "2024-01-01",updated_at: "2024-01-01"},
    { id: 2, name: "Monitor", description: "Dell 27'' 144Hz", available_quantity: 8 ,created_at: "2024-01-01",updated_at: "2024-01-01"},
    { id: 3, name: "Mouse", description: "Logitech MX Master", available_quantity: 12 ,created_at: "2024-01-01",updated_at: "2024-01-01"},
];

function Assets() {
    const [assets, setAssets] = useState(mockAssets);
    const [menuOpen, setMenuOpen] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [role, setRole] = useState(null);
    const menuRefs = useRef({});

    useEffect(() => {
        // Simula un recupero del ruolo utente (Sostituire con API in futuro)
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
        alert(`Hai selezionato "${action}" per l'asset con ID ${id}`);
        setMenuOpen(null);
    };

    return (
        <>
            <Navbar />

            <div className="content-container">
                <UserInfo /> {/* Mostra il ruolo dell'utente */}

            <div className="table-container">
                <div className="table-header">
                    <h1>Gestione Asset</h1>
                    {role === "manager" && (
                        <button className="add-button" onClick={() => setShowModal(true)}>
                            ➕ Aggiungi Asset
                        </button>
                    )}
                </div>

                <table className="styled-table">
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nome</th>
                        <th>Descrizione</th>
                        <th>Disponibili</th>
                        {role === "manager" && <th>Azioni</th>} {/* Azioni solo per il manager */}
                        {role === "manager" && <th>Data Creazione</th>} {/* Azioni solo per il manager */}
                        {role === "manager" && <th>Ultima Modifica</th>} {/* Azioni solo per il manager */}
                    </tr>
                    </thead>
                    <tbody>
                    {assets.map((asset) => (
                        <tr key={asset.id}>
                            <td>{asset.id}</td>
                            <td>{asset.name}</td>
                            <td>{asset.description}</td>
                            <td>{asset.available_quantity}</td>
                            {role === "manager" && <td>asset.created_at</td>} {/* Azioni solo per il manager */}
                            {role === "manager" && <td>asset.updated_at</td>}
                            {role === "manager" && (
                                <td className="actions-column">
                                    <div className="dropdown" ref={(el) => (menuRefs.current[asset.id] = el)}>
                                        <BsThreeDotsVertical className="menu-icon" onClick={() => toggleMenu(asset.id)} />
                                        {menuOpen === asset.id && (
                                            <div className="dropdown-menu show">
                                                <p onClick={() => handleAction("Modifica", asset.id)}>✏️ Modifica</p>
                                                <p onClick={() => handleAction("Rimuovi", asset.id)}>🗑️ Rimuovi</p>
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

export default Assets;




