import React, { useState, useEffect,useRef } from "react";
import Navbar from "../components/Navbar";
import UserInfo from "../components/UserInfo";
import AddItemModal from "../components/AddItemModal";
import { BsThreeDotsVertical } from "react-icons/bs";
import axios from "axios";
import "../style.css";
import acquisitions from "./Acquisitions";

function AcquiredAssets() {
    const [acquiredAssets, setAcquiredAssets] = useState([]);
    const [users, setUsers] = useState([]);
    const [assignment, setAssignment] = useState([]);
    const [quantity, setquantity] = useState([]);
    const [menuOpen, setMenuOpen] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);

    const [newAssignment, setNewAssignment] = useState({
        assignment: "",
        quantity: "",
    })


    useEffect(() => {
        const fetchAcquiredAssets = async () => {
            try {
                const token = localStorage.getItem("access_token");
                const response = await axios.get("http://localhost:8001/api/acquisitions/", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAcquiredAssets(response.data);
            } catch (error) {
                console.error("Errore durante il recupero degli acquired assets:", error);
            }
        };
        fetchAcquiredAssets();
    }, []);

    const toggleMenu = (id) => setMenuOpen(menuOpen === id ? null : id);

    const handleRemoveAssignment = async ( id) => {
        try {
            const token = localStorage.getItem("access_token");
            await axios.patch(`http://localhost:8001/api/acquisitions/${id}/deactivate/`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAcquiredAssets(acquiredAssets.filter(asset => asset.id !== id));
        } catch (error) {
            console.error("Errore durante la rimozione dell'acquisition:", error);
    }
        setMenuOpen(null);
    };

    // Aggiunta nuovo assignment
    const handleAddAcquisition = async (formData) => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem("access_token");
            const headers = { Authorization: `Bearer ${token}` };

            // Verifica se esiste già un'assegnazione attiva per lo stesso asset e utente
            const existingAcquisition = acquisitions.find(
                (a) =>
                    a.assignment === formData.assignment &&
                    a.is_active
            );

            if (existingAcquisition) {
                setError("Questo asset è già stato assegnato a questo utente.");
                setIsLoading(false);
                return;
            }

            // POST all'API
            const response = await axios.post(
                "http://localhost:8001/api/acquisitions/",
                formData,
                { headers }
            );

            // Aggiorna stato con il nuovo assignment
            setAcquiredAssets([...assignments, response.data]);
            setShowAddModal(false);
        } catch (error) {
            console.error("Errore durante l'assegnazione:", error);
            setError("Errore durante l'assegnazione.");
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <>
            <Navbar />
            <UserInfo />
            <div className="page-content">
                <div className="table-container">
                    <div className="table-header">
                        <h1>Acquired Assets</h1>
                        <button className="add-button" onClick={() => setShowAddModal(true)}>➕ Acquire New Asset</button>
                    </div>
                    <table className="styled-table">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nome Asset</th>
                            <th>Quantità Acquisita</th>
                            <th>Data Acquisizione</th>
                            <th>Azioni</th>
                        </tr>
                        </thead>
                        <tbody>
                        {acquiredAssets.length > 0 ? acquiredAssets.map(asset => (
                            <tr key={asset.id}>
                                <td>{asset.id}</td>
                                <td>{asset.asset_name || 'N/A'}</td>
                                <td>{asset.quantity}</td>
                                <td>{asset.acquired_at}</td>
                                <td className="actions-column">
                                    <div className="dropdown">
                                        <BsThreeDotsVertical className="menu-icon" onClick={() => toggleMenu(asset.id)} />
                                        {menuOpen === asset.id && (
                                            <div className="dropdown-menu show">
                                                <p onClick={() => handleAction("Modifica", asset.id)}>✏️ Modifica</p>
                                                <p onClick={() => handleRemoveAssignment(asset.id)}>🗑️ Rimuovi</p>
                                            </div>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        )) : <tr><td colSpan="5">Nessun asset acquisito trovato</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
            {showAddModal && <AddItemModal onClose={() => setShowAddModal(false)} />}
        </>
    );
}

export default AcquiredAssets;

