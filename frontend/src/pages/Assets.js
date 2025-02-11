import React, { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import "../style.css";
import { BsThreeDotsVertical } from "react-icons/bs";
import { fetchAssets } from "../server/api";
import AddItemModal from "../components/AddItemModal";

function Assets() {
    const [assets, setAssets] = useState([]);
    const [menuOpen, setMenuOpen] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const menuRefs = useRef({});

    useEffect(() => {
        const loadAssets = async () => {
            const data = await fetchAssets();
            setAssets(data);
        };
        loadAssets();
    }, []);

    const toggleMenu = (id) => {
        setMenuOpen(menuOpen === id ? null : id);
    };

    const handleAction = (action, id) => {
        alert(`Hai selezionato "${action}" per l'asset con ID ${id}`);
        setMenuOpen(null);
    };

    const handleSave = async (newAsset) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/assets/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newAsset),
            });

            if (!response.ok) {
                throw new Error("Errore nell'aggiunta dell'asset");
            }

            const savedAsset = await response.json();
            setAssets([...assets, savedAsset]);
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
                    <h1>Gestione Asset</h1>
                    <button className="add-button" onClick={() => setShowModal(true)}>
                        ➕ Aggiungi Asset
                    </button>
                </div>
                <table className="styled-table">
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nome</th>
                        <th>Descrizione</th>
                        <th>Categoria</th>
                        <th>Azioni</th>
                    </tr>
                    </thead>
                    <tbody>
                    {assets.map((asset) => (
                        <tr key={asset.id}>
                            <td>{asset.id}</td>
                            <td>{asset.name}</td>
                            <td>{asset.description}</td>
                            <td>{asset.category}</td>
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
                    { name: "name", label: "Nome" },
                    { name: "description", label: "Descrizione" },
                    { name: "category", label: "Categoria" },
                ]}
            />
        </>
    );
}

export default Assets;


