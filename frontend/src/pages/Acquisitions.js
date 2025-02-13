import React, { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import UserInfo from "../components/UserInfo";
import "../style.css";
import { BsThreeDotsVertical } from "react-icons/bs";

// Mock data per le acquisizioni (visibili solo al manager)
const mockAcquisitions = [
    { id: 1, user_id: 101, user_name: "Mario Rossi", product_id: 1, product_name: "Laptop", quantity: 2, acquired_at: "2024-02-10", location: "Milano" },
    { id: 2, user_id: 102, user_name: "Laura Bianchi", product_id: 2, product_name: "Monitor", quantity: 1, acquired_at: "2024-02-08", location: "Roma" },
    { id: 3, user_id: 103, user_name: "Giovanni Verdi", product_id: 3, product_name: "Mouse", quantity: 3, acquired_at: "2024-02-05", location: "Napoli" }
];

function Acquisitions() {
    const [acquisitions, setAcquisitions] = useState(mockAcquisitions);
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

    // Se l'utente non è un manager, reindirizza alla home
    if (role !== "manager") {
        return <h2 className="error-message">⛔ Accesso negato: solo i Manager possono visualizzare questa pagina.</h2>;
    }

    const toggleMenu = (id) => {
        setMenuOpen(menuOpen === id ? null : id);
    };

    const handleAction = (action, id) => {
        alert(`Hai selezionato "${action}" per l'acquisizione con ID ${id}`);
        setMenuOpen(null);
    };

    return (
        <>
            <Navbar />
            <div className="content-container">
                <UserInfo />

                <div className="table-container">
                    <div className="table-header">
                        <h1>Gestione Acquisizioni</h1>
                        <button className="add-button" onClick={() => setShowModal(true)}>➕ Aggiungi Acquisizione</button>
                    </div>

                    <table className="styled-table">
                        <thead>
                        <tr>
                            <th>ID Utente</th>
                            <th>Nome Utente</th>
                            <th>ID Prodotto</th>
                            <th>Nome Prodotto</th>
                            <th>Quantità</th>
                            <th>Data Acquisizione</th>
                            <th>Location</th>
                            <th>Azioni</th>
                        </tr>
                        </thead>
                        <tbody>
                        {acquisitions.map((acquisition) => (
                            <tr key={acquisition.id}>
                                <td>{acquisition.user_id}</td>
                                <td>{acquisition.user_name}</td>
                                <td>{acquisition.product_id}</td>
                                <td>{acquisition.product_name}</td>
                                <td>{acquisition.quantity}</td>
                                <td>{acquisition.acquired_at}</td>
                                <td>{acquisition.location}</td>
                                <td className="actions-column">
                                    <div className="dropdown" ref={(el) => (menuRefs.current[acquisition.id] = el)}>
                                        <BsThreeDotsVertical className="menu-icon" onClick={() => toggleMenu(acquisition.id)} />
                                        {menuOpen === acquisition.id && (
                                            <div className="dropdown-menu show">
                                                <p onClick={() => handleAction("Modifica", acquisition.id)}>✏️ Modifica</p>
                                                <p onClick={() => handleAction("Rimuovi", acquisition.id)}>🗑️ Rimuovi</p>
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

export default Acquisitions;

