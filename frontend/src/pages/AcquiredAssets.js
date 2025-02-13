import React, { useState } from "react";
import Navbar from "../components/Navbar";
import UserInfo from "../components/UserInfo";
import { BsThreeDotsVertical } from "react-icons/bs";
import "../style.css";

function AcquiredAssets() {
    // Dati mock
    const [acquiredAssets, setAcquiredAssets] = useState([
        { id: 1, name: "Laptop", acquired_quantity: 2 ,acquisition_date: "2024-01-01"},
        { id: 2, name: "Monitor", acquired_quantity: 1 ,acquisition_date: "2024-01-01"},
        { id: 3, name: "Smartphone", acquired_quantity: 3 ,acquisition_date: "2024-01-01"}
    ]);

    const [menuOpen, setMenuOpen] = useState(null);

    const toggleMenu = (id) => {
        setMenuOpen(menuOpen === id ? null : id);
    };

    const handleAction = (action, id) => {
        alert(`Hai selezionato "${action}" per l'oggetto con ID ${id}`);
        setMenuOpen(null);
    };

    return (
        <>
            <Navbar />
            <UserInfo />
            <div className="page-content">
                <div className="table-container">
                    <div className="table-header">
                        <h1>Acquired Assets</h1>
                        <button className="add-button">➕ Acquire New Asset</button>
                    </div>

                    <table className="styled-table">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nome</th>
                            <th>Quantità Acquisita</th>
                            <th>Data Acquisizione</th>
                            <th>Azioni</th>
                        </tr>
                        </thead>
                        <tbody>
                        {acquiredAssets.map((asset) => (
                            <tr key={asset.id}>
                                <td>{asset.id}</td>
                                <td>{asset.name}</td>
                                <td>{asset.acquired_quantity}</td>
                                <td>{asset.acquisition_date}</td>
                                <td className="actions-column">
                                    <div className="dropdown">
                                        <BsThreeDotsVertical className="menu-icon" onClick={() => toggleMenu(asset.id)} />
                                        {menuOpen === asset.id && (
                                            <div className="dropdown-menu show">
                                                <p onClick={() => handleAction("Modifica", asset.id)}>✏️ Modifica</p>
                                                <p onClick={() => handleAction("Rimuovi", asset.id)}>🗑️ Rimuovi</p>
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

export default AcquiredAssets;
