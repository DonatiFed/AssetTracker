import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import UserInfo from "../components/UserInfo";
import AddItemModal from "../components/AddItemModal";
import EditItemModal from "../components/EditItemModal";
import { BsThreeDotsVertical } from "react-icons/bs";
import axios from "axios";
import "../style.css";

function Acquisitions() {
    const [acquisitions, setAcquisitions] = useState([]);
    const [users, setUsers] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [locations, setLocations] = useState([]);
    const [menuOpen, setMenuOpen] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedAcquisition, setSelectedAcquisition] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("access_token");
                const headers = { Authorization: `Bearer ${token}` };

                const [acquisitionsRes, usersRes, assignmentsRes, locationsRes] = await Promise.all([
                    axios.get("http://localhost:8001/api/acquisitions/", { headers }),
                    axios.get("http://localhost:8001/api/users/", { headers }),
                    axios.get("http://localhost:8001/api/assignments/", { headers }),
                    axios.get("http://localhost:8001/api/locations/", { headers })
                ]);

                setAcquisitions(acquisitionsRes.data);
                setUsers(usersRes.data);
                setAssignments(assignmentsRes.data.filter(a => a.is_active));
                setLocations(locationsRes.data);
            } catch (error) {
                console.error("Errore nel recupero dei dati:", error);
            }
        };
        fetchData();
    }, []);

    const toggleMenu = (id) => setMenuOpen(menuOpen === id ? null : id);

    const handleRemoveAcquisition = async (id) => {
        try {
            const token = localStorage.getItem("access_token");
            await axios.patch(`http://localhost:8001/api/acquisitions/${id}/deactivate/`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAcquisitions(acquisitions.filter(acq => acq.id !== id));
        } catch (error) {
            console.error("Errore durante la rimozione dell'acquisition:", error);
        }
        setMenuOpen(null);
    };

    const handleAddAcquisition = async (formData) => {
        try {
            const token = localStorage.getItem("access_token");
            const response = await axios.post("http://localhost:8001/api/acquisitions/", formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAcquisitions([...acquisitions, response.data]);
            setShowAddModal(false);
        } catch (error) {
            console.error("Errore durante l'assegnazione:", error);
        }
    };

    const handleEdit = (acq) => {
        console.log("✏️ DEBUG: Acquisizione selezionata per modifica:", acq);  // 🔥 Debug
        setSelectedAcquisition(acq);
        setShowEditModal(true);
    };


    const handleSaveEdit = async (formData) => {
        try {
            const token = localStorage.getItem("access_token");

            if (!selectedAcquisition) {
                console.error("❌ DEBUG: Nessuna acquisizione selezionata per la modifica.");
                setError("Errore: Nessuna acquisizione selezionata.");
                return;
            }

            // Creiamo i dati da inviare
            const requestData = {
                quantity: Number(formData.quantity) // Assicuriamoci che sia un numero
            };

            console.log("📤 DEBUG: Inviando richiesta PUT con dati:", JSON.stringify(requestData, null, 2));

            // Effettuiamo la richiesta PUT
            const response = await axios.put(
                `http://localhost:8001/api/acquisitions/${selectedAcquisition.id}/`,
                requestData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            console.log("✅ DEBUG: Risposta ricevuta dal backend:", response.data);

            // Aggiorniamo lo stato per riflettere la modifica
            setAcquisitions(acquisitions.map(acq =>
                acq.id === response.data.id ? response.data : acq
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
            <div className="content-container">
                <UserInfo />

                <div className="table-container">
                    <div className="table-header">
                        <h1>Gestione Acquisizioni</h1>
                        <button className="add-button" onClick={() => setShowAddModal(true)}>➕ Aggiungi Acquisizione</button>
                    </div>

                    <table className="styled-table">
                        <thead>
                        <tr>
                            <th>Utente</th>
                            <th>Nome Asset</th>
                            <th>Quantità</th>
                            <th>Data Acquisizione</th>
                            <th>Stato</th>
                            <th>Location</th>
                            <th>Azioni</th>
                        </tr>
                        </thead>
                        <tbody>
                        {acquisitions.map(acq => (
                            <tr key={acq.id}>
                                <td>{acq.user_name}</td>
                                <td>{acq.asset_name}</td>
                                <td>{acq.quantity}</td>
                                <td>{new Date(acq.acquired_at).toLocaleString("it-IT", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
                                <td>{acq.is_active ? "Attiva" : "Disattivata"}</td>
                                <td>{locations.find(l => l.id === acq.location)?.name || "N/A"}</td>
                                <td className="actions-column">
                                    <BsThreeDotsVertical className="menu-icon" onClick={() => toggleMenu(acq.id)} />
                                    {menuOpen === acq.id && (
                                        <div className="dropdown-menu show">
                                            <p onClick={() => handleEdit(acq)}>✏️ Modifica</p>
                                            <p onClick={() => handleRemoveAcquisition(acq.id)}>🗑️ Rimuovi</p>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
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
                        { name: "user", label: "Utente", type: "select", options: users.map(u => ({ value: u.id, label: u.username })) },
                        { name: "assignment", label: "Asset", type: "select", options: assignments.map(a => ({ value: a.id, label: a.asset_name })) },
                        { name: "quantity", label: "Quantità", type: "number", min: 1 },
                        { name: "location", label: "Location", type: "select", options: locations.map(l => ({ value: l.id, label: l.name })) }
                    ]}
                />

            )}
            {showEditModal && selectedAcquisition && (
                <EditItemModal
                    show={showEditModal}
                    handleClose={() => setShowEditModal(false)}
                    handleSave={handleSaveEdit}
                    initialData={selectedAcquisition}  // ✅ Passiamo i dati selezionati
                    fields={[{ name: "quantity", label: "Quantità", type: "number", defaultValue: selectedAcquisition.quantity }]}
                />
            )}
        </>
    );
}

export default Acquisitions;


