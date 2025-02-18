import React, {useState, useEffect, useRef} from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import UserInfo from "../components/UserInfo";
import "../style.css";
import {BsThreeDotsVertical} from "react-icons/bs";

function Assets() {
    const [assets, setAssets] = useState([]);
    const [menuOpen, setMenuOpen] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editAsset, setEditAsset] = useState(null);
    const [newAsset, setNewAsset] = useState({name: "", description: "", total_quantity: 0});
    const [role, setRole] = useState(null);
    const menuRefs = useRef({});

    useEffect(() => {
        const fetchUserRole = async () => {
            const storedRole = localStorage.getItem("user_role");
            setRole(storedRole);
        };
        fetchUserRole();
    }, []);

    useEffect(() => {
        const fetchAssets = async () => {
            try {
                const token = localStorage.getItem("access_token");
                let response;

                if (role === "manager") {
                    response = await axios.get("http://localhost:8001/api/assets/", {
                        headers: {Authorization: `Bearer ${token}`}
                    });
                } else {
                    response = await axios.get("http://localhost:8001/api/assets/user/", {
                        headers: {Authorization: `Bearer ${token}`}
                    });
                }

                setAssets(response.data);
            } catch (error) {
                console.error("Errore nel recupero degli asset:", error);
            }
        };

        if (role) {
            fetchAssets();
        }
    }, [role]);

    const toggleMenu = (id) => {
        setMenuOpen(menuOpen === id ? null : id);
    };

    const handleEdit = (asset) => {
        setEditAsset(asset);
        setShowModal(true);
    };

    const handleSaveEdit = async () => {
        try {
            const token = localStorage.getItem("access_token");
            await axios.put(`http://localhost:8001/api/assets/${editAsset.id}/`, editAsset, {
                headers: {Authorization: `Bearer ${token}`}
            });

            setAssets(assets.map(a => (a.id === editAsset.id ? editAsset : a)));
            setShowModal(false);
        } catch (error) {
            console.error("Errore durante il salvataggio:", error);
        }
    };

    const handleDelete = async (id) => {
        try {
            const token = localStorage.getItem("access_token");
            await axios.delete(`http://localhost:8001/api/assets/${id}/`, {
                headers: {Authorization: `Bearer ${token}`}
            });

            setAssets(assets.filter(a => a.id !== id));
        } catch (error) {
            console.error("Errore durante l'eliminazione:", error);
        }
    };

    const handleAddAsset = async () => {
        try {
            const token = localStorage.getItem("access_token");
            const response = await axios.post("http://localhost:8001/api/assets/", newAsset, {
                headers: {Authorization: `Bearer ${token}`}
            });
            setAssets([...assets, response.data]);
            setNewAsset({name: "", description: "", total_quantity: 0});
            setShowModal(false);
        } catch (error) {
            console.error("Errore nell'aggiunta dell'asset:", error.response?.data || error.message);
        }
    };

    return (
        <>
            <Navbar/>
            <div className="content-container">
                <UserInfo/>
                <div className="table-container">
                    <div className="table-header">
                        <h1>Gestione Asset</h1>
                        {role === "manager" && (
                            <button className="add-button" onClick={() => {
                                setEditAsset(null);
                                setNewAsset({name: "", description: "", total_quantity: 0});
                                setShowModal(true);
                            }}>
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
                            <th>Totali</th>
                            <th>Disponibili</th>
                            {role === "manager" && <th>Data Creazione</th>}
                            {role === "manager" && <th>Azioni</th>}
                        </tr>
                        </thead>
                        <tbody>
                        {assets.map((asset) => (
                            <tr key={asset.id}>
                                <td>{asset.id}</td>
                                <td>{asset.name}</td>
                                <td>{asset.description}</td>
                                <td>{asset.total_quantity}</td>
                                <td>{asset.available_quantity}</td>
                                {role === "manager" &&
                                    <td>{asset.created_at ? new Date(asset.created_at).toLocaleString("it-IT") : "—"}</td>}
                                {role === "manager" && (
                                    <td className="actions-column">
                                        <div className="dropdown" ref={(el) => (menuRefs.current[asset.id] = el)}>
                                            <BsThreeDotsVertical className="menu-icon"
                                                                 onClick={() => toggleMenu(asset.id)}/>
                                            {menuOpen === asset.id && (
                                                <div className="dropdown-menu show">
                                                    <p onClick={() => handleEdit(asset)}>✏️ Modifica</p>
                                                    <p onClick={() => handleDelete(asset.id)}>🗑️ Rimuovi</p>
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

            {/* Modal per aggiunta o modifica */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <h2>{editAsset ? "Modifica Asset" : "Aggiungi Asset"}</h2>
                        <input
                            type="text"
                            placeholder="Nome"
                            value={editAsset ? editAsset.name : newAsset.name}
                            onChange={(e) => editAsset
                                ? setEditAsset({...editAsset, name: e.target.value})
                                : setNewAsset({...newAsset, name: e.target.value})
                            }
                        />
                        <input
                            type="text"
                            placeholder="Descrizione"
                            value={editAsset ? editAsset.description : newAsset.description}
                            onChange={(e) => editAsset
                                ? setEditAsset({...editAsset, description: e.target.value})
                                : setNewAsset({...newAsset, description: e.target.value})
                            }
                        />
                        <input
                            type="number"
                            placeholder="Totali"
                            value={editAsset ? editAsset.total_quantity : newAsset.total_quantity}
                            onChange={(e) => editAsset
                                ? setEditAsset({...editAsset, total_quantity: parseInt(e.target.value)})
                                : setNewAsset({...newAsset, total_quantity: parseInt(e.target.value)})
                            }
                        />
                        <div className="modal-buttons">
                            <button className="cancel-btn" onClick={() => setShowModal(false)}>Annulla</button>
                            <button className="save-btn" onClick={editAsset ? handleSaveEdit : handleAddAsset}>
                                {editAsset ? "Salva" : "Aggiungi"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Assets;









