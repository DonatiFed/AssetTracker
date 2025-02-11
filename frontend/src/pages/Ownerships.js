import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import "../style.css";
import { BsThreeDotsVertical } from "react-icons/bs";
import AddItemModal from "../components/AddItemModal";
import { fetchOwnerships, fetchAssets, fetchOwners } from "../server/api";

function Ownerships() {
    const [ownerships, setOwnerships] = useState([]);
    const [assets, setAssets] = useState([]);
    const [owners, setOwners] = useState([]);
    const [menuOpen, setMenuOpen] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            const ownershipData = await fetchOwnerships();
            const assetData = await fetchAssets();
            const ownerData = await fetchOwners();
            setOwnerships(ownershipData);
            setAssets(assetData);
            setOwners(ownerData);
        };
        loadData();
    }, []);

    const toggleMenu = (id) => {
        setMenuOpen(menuOpen === id ? null : id);
    };

    const handleAction = (action, id) => {
        alert(`Hai selezionato "${action}" per la ownership con ID ${id}`);
        setMenuOpen(null);
    };

    const handleSave = async (newOwnership) => {
        try {
            // Converte acquisition_date in un oggetto Date se non lo è già
            const acquisitionDate = newOwnership.acquisition_date instanceof Date
                ? newOwnership.acquisition_date
                : new Date(newOwnership.acquisition_date);

            const formattedDate = acquisitionDate.toISOString().split('T')[0]; // Format YYYY-MM-DD
            newOwnership.acquisition_date = formattedDate; // Imposta la data formattata

            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/ownerships/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    asset: newOwnership.asset_id,
                    owner: newOwnership.owner_id,
                    date_acquired: newOwnership.acquisition_date, // Usa la data formattata
                    quantity: newOwnership.quantity,
                }),
            });

            if (!response.ok) {
                throw new Error("Errore nell'aggiunta della proprietà");
            }

            const savedOwnership = await response.json();
            setOwnerships([...ownerships, savedOwnership]);
            setShowModal(false);
        } catch (error) {
            console.error("Errore nel salvataggio:", error);
        }
    };

    return (
        <>
            <Navbar />
            <div className="table-container">
                <div className="table-header">
                    <h1>Gestione Ownerships</h1>
                    <button className="add-button" onClick={() => setShowModal(true)}>
                        ➕ Aggiungi Ownership
                    </button>
                </div>
                <table className="styled-table">
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Asset</th>
                        <th>Proprietario</th>
                        <th>Data Acquisizione</th>
                        <th>Quantità</th>
                        <th>Azioni</th>
                    </tr>
                    </thead>
                    <tbody>
                    {ownerships.map((ownership) => (
                        <tr key={ownership.id}>
                            <td>{ownership.id}</td>
                            <td>{ownership.asset_name}</td>
                            <td>{ownership.owner_name}</td>
                            <td>{new Date(ownership.date_acquired).toLocaleDateString()}</td>
                            <td>{ownership.quantity}</td>
                            <td className="actions-column">
                                <div className="dropdown">
                                    <BsThreeDotsVertical className="menu-icon" onClick={() => toggleMenu(ownership.id)} />
                                    {menuOpen === ownership.id && (
                                        <div className="dropdown-menu show">
                                            <p onClick={() => handleAction("Modifica", ownership.id)}>✏️ Modifica</p>
                                            <p onClick={() => handleAction("Rimuovi", ownership.id)}>🗑️ Rimuovi</p>
                                        </div>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            <AddItemModal
                show={showModal}
                handleClose={() => setShowModal(false)}
                handleSave={handleSave}
                fields={[
                    {
                        name: "asset_id",
                        label: "Asset",
                        type: "select",
                        options: assets.map(asset => ({ value: asset.id, label: asset.name }))
                    },
                    {
                        name: "owner_id",
                        label: "Proprietario",
                        type: "select",
                        options: owners.map(owner => ({ value: owner.id, label: `${owner.first_name} ${owner.last_name}` }))
                    },
                    {
                        name: "acquisition_date",
                        label: "Data Acquisizione",
                        type: "date",
                    },
                    {
                        name: "quantity",
                        label: "Quantità",
                        type: "number",
                    }
                ]}
            />
        </>
    );
}

export default Ownerships;





