import React, { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import UserInfo from "../components/UserInfo";
import "../style.css";
import { BsThreeDotsVertical } from "react-icons/bs";

// Mock data per le location
const mockLocations = [
    { id: 1, name: "Sede Centrale", address: "Via Roma 10, Milano", description: "Sede principale dell'azienda" },
    { id: 2, name: "Filiale Torino", address: "Corso Duca 15, Torino", description: "Filiale per il nord-ovest" },
    { id: 3, name: "Ufficio Roma", address: "Piazza Venezia 5, Roma", description: "Ufficio operativo per il centro Italia" }
];

function Locations() {
    const [locations, setLocations] = useState(mockLocations);
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
        alert(`Hai selezionato "${action}" per la location con ID ${id}`);
        setMenuOpen(null);
    };

    return (
        <>
            <Navbar />
            <div className="content-container">
                <UserInfo />

                <div className="table-container">
                    <div className="table-header">
                        <h1>Gestione Locations</h1>
                        {role === "manager" && (
                            <button className="add-button" onClick={() => setShowModal(true)}>➕ Aggiungi Location</button>
                        )}
                    </div>

                    <table className="styled-table">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nome</th>
                            <th>Indirizzo</th>
                            <th>Descrizione</th>
                            {role === "manager" && <th>Azioni</th>}
                        </tr>
                        </thead>
                        <tbody>
                        {locations.map((location) => (
                            <tr key={location.id}>
                                <td>{location.id}</td>
                                <td>{location.name}</td>
                                <td>{location.address}</td>
                                <td>{location.description}</td>
                                {role === "manager" && (
                                    <td className="actions-column">
                                        <div className="dropdown" ref={(el) => (menuRefs.current[location.id] = el)}>
                                            <BsThreeDotsVertical className="menu-icon" onClick={() => toggleMenu(location.id)} />
                                            {menuOpen === location.id && (
                                                <div className="dropdown-menu show">
                                                    <p onClick={() => handleAction("Modifica", location.id)}>✏️ Modifica</p>
                                                    <p onClick={() => handleAction("Rimuovi", location.id)}>🗑️ Rimuovi</p>
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

export default Locations;


