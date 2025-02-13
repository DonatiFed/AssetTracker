import React, { useState, useEffect,useRef } from "react";
import Navbar from "../components/Navbar";
import UserInfo from "../components/UserInfo";
import AddItemModal from "../components/AddItemModal";
import EditItemModal from "../components/EditItemModal";
import { BsThreeDotsVertical } from "react-icons/bs";
import axios from "axios";
import "../style.css";
import acquisitions from "./Acquisitions";

function AcquiredAssets() {
    const [acquiredAssets, setAcquiredAssets] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [locations, setLocations] = useState([]);
    const [menuOpen, setMenuOpen] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [error, setError] = useState("");

    const [newAssignment, setNewAssignment] = useState({
        assignment: "",
        quantity: "",
    })


    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("access_token");
                const headers = { Authorization: `Bearer ${token}` };

                const [acquisitionsRes, assignmentsRes, locationsRes] = await Promise.all([
                    axios.get("http://localhost:8001/api/acquisitions/", { headers }),
                    axios.get("http://localhost:8001/api/assignments/", { headers }),
                    axios.get("http://localhost:8001/api/locations/", { headers })
                ]);

                setAcquiredAssets(acquisitionsRes.data);
                setAssignments(assignmentsRes.data.filter(a => a.is_active));
                setLocations(locationsRes.data);
                console.log("📌 DEBUG: Dati assignments ricevuti:", assignmentsRes.data);

            } catch (error) {
                console.error("Errore nel recupero dei dati:", error);
            }
        };
        fetchData();
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

    const handleAddAcquisition = async (formData) => {
        try {
            const token = localStorage.getItem("access_token");

            console.log("📤 DEBUG: Dati ricevuti dal modal:", formData);

            const assignmentID = Number(formData.assignment);
            const locationID = Number(formData.location);

            if (isNaN(assignmentID) || isNaN(locationID)) {
                console.error("❌ DEBUG: ID assegnazione o ID location non validi:", formData);
                setError("Errore: ID non valido.");
                return;
            }

            // 🔥 Cambiamo i nomi dei campi per allinearli al backend
            const requestData = {
                assignment: assignmentID,  // ✅ Modificato: prima era id_assignment
                quantity: Number(formData.quantity),
                location: locationID       // ✅ Modificato: prima era id_location
            };

            console.log("📤 DEBUG: RequestData finale da inviare:", JSON.stringify(requestData, null, 2));

            // Esegui la richiesta POST
            const response = await axios.post("http://localhost:8001/api/acquisitions/", requestData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log("✅ DEBUG: Risposta ricevuta dal backend:", response.data);

            // Aggiorna lo stato con la nuova acquisizione
            setAcquiredAssets([...acquiredAssets, response.data]);
            setShowAddModal(false);
        } catch (error) {
            console.error("❌ DEBUG: Errore durante l'aggiunta dell'acquisizione:", error.response ? error.response.data : error);
            setError("Errore durante l'aggiunta.");
        }
    };

    const handleEdit = (asset) => {
        console.log("✏️ DEBUG: Modifica dell'acquisizione selezionata:", asset);
        setSelectedAsset(asset);
        setShowEditModal(true);
    };

    const handleSaveEdit = async (formData) => {
        try {
            const token = localStorage.getItem("access_token");

            if (!selectedAsset) {
                console.error("❌ DEBUG: Nessuna acquisizione selezionata per la modifica.");
                setError("Errore: Nessuna acquisizione selezionata.");
                return;
            }

            const requestData = {
                quantity: Number(formData.quantity), // Assicuriamoci che sia un numero
            };

            console.log("📤 DEBUG: Inviando richiesta PUT per modifica:", requestData);

            const response = await axios.put(`http://localhost:8001/api/acquisitions/${selectedAsset.id}/`, requestData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log("✅ DEBUG: Risposta ricevuta dal backend:", response.data);

            // Aggiorna lo stato con la nuova quantità
            setAcquiredAssets(acquiredAssets.map(asset =>
                asset.id === response.data.id ? response.data : asset
            ));

            setShowEditModal(false);
        } catch (error) {
            console.error("❌ DEBUG: Errore durante la modifica dell'acquisizione:", error.response ? error.response.data : error);
            setError("Errore durante la modifica.");
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
                            <th>Location</th>
                            <th>Azioni</th>
                        </tr>
                        </thead>
                        <tbody>
                        {acquiredAssets.length > 0 ? acquiredAssets.map(asset => (
                            <tr key={asset.id}>
                                <td>{asset.id}</td>
                                <td>{asset.asset_name || 'N/A'}</td>
                                <td>{asset.quantity}</td>
                                <td>{new Date(asset.acquired_at).toLocaleString("it-IT", {
                                    day: "2-digit",
                                    month: "long",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit"
                                })}</td>
                                <td>{
                                    locations.find(l => l.id === asset.location)?.name || "N/A"
                                }</td>
                                <td className="actions-column">
                                    <div className="dropdown">
                                        <BsThreeDotsVertical className="menu-icon" onClick={() => toggleMenu(asset.id)} />
                                        {menuOpen === asset.id && (
                                            <div className="dropdown-menu show">
                                                <p onClick={() => handleEdit(asset)}>✏️ Modifica</p>
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
            {showAddModal && (
                <AddItemModal
                    show={showAddModal}
                    handleClose={() => setShowAddModal(false)}
                    handleSave={handleAddAcquisition}
                    fields={[
                        { name: "assignment", label: "Assegnamento", type: "select", options: assignments.map(a => ({
                                value: a.id,  // ✅ Passiamo l'ID dell'assegnazione
                                label: `${a.asset_name} (ID: ${a.id})`  // ✅ Mostriamo il nome dell'asset
                            }))
                        },
                        { name: "quantity", label: "Quantità", type: "number" },
                        { name: "location", label: "Location", type: "select", options: locations.map(l => ({ value: l.id, label: l.name })) }
                    ]}
                />
            )}
            {showEditModal && (
                <EditItemModal
                    show={showEditModal}
                    handleClose={() => setShowEditModal(false)}
                    handleSave={handleSaveEdit}
                    initialData={selectedAsset}
                    fields={[{ name: "quantity", label: "Quantità", type: "number", defaultValue: selectedAsset?.quantity }]}
                />
            )}
        </>
    );
}
export default AcquiredAssets;

