import React, {useState, useEffect} from "react";
import Navbar from "../components/Navbar";
import UserInfo from "../components/UserInfo";
import AddItemModal from "../components/AddItemModal";
import EditItemModal from "../components/EditItemModal";
import {BsThreeDotsVertical} from "react-icons/bs";
import axios from "axios";
import "../style.css";
import {FaSortAmountDown, FaSortAmountUp} from "react-icons/fa";

function Acquisitions() {
    const [acquisitions, setAcquisitions] = useState([]);
    const [users, setUsers] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [locations, setLocations] = useState([]);
    const [menuOpen, setMenuOpen] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedAcquisition, setSelectedAcquisition] = useState(null);
    const [showActiveOnly, setShowActiveOnly] = useState(false); // checkbox per mostrare solo attivi
    const [sortOrder, setSortOrder] = useState("asc"); // ordinamento per data di creazione
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("access_token");
                const headers = {Authorization: `Bearer ${token}`};
                const API_URL = process.env.REACT_APP_BACKEND_URL;

                const [acquisitionsRes, usersRes, assignmentsRes, locationsRes] = await Promise.all([
                    axios.get(`${API_URL}/acquisitions/`, {headers}),
                    axios.get(`${API_URL}/users/`, {headers}),
                    axios.get(`${API_URL}/assignments/`, {headers}),
                    axios.get(`${API_URL}/locations/`, {headers})
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
    const toggleSortOrder = () => setSortOrder(sortOrder === "asc" ? "desc" : "asc");

    const handleRemoveAcquisition = async (id) => {
        try {
            const token = localStorage.getItem("access_token");
            const API_URL = process.env.REACT_APP_BACKEND_URL;
            await axios.patch(`${API_URL}/acquisitions/${id}/deactivate/`, {}, {
                headers: {Authorization: `Bearer ${token}`}
            });
            setAcquisitions(acquisitions.map(acq => acq.id === id ? {
                ...acq,
                is_active: false,
                removed_at: new Date().toISOString()
            } : acq));
        } catch (error) {
            console.error("Errore durante la rimozione dell'acquisition:", error);
        }
        setMenuOpen(null);
    };

    const handleAddAcquisition = async (formData) => {
        const {user, asset, quantity, location} = formData;

        const userId = parseInt(user, 10);
        const assetId = parseInt(asset, 10);

        const validAssignments = assignments.filter(a => parseInt(a.asset) === assetId && a.is_active);

        if (validAssignments.length === 0) {
            console.error("Errore: Nessun assignment attivo per questo asset.");
            setError("Errore: Nessun assignment attivo per questo asset.");
            return;
        }

        const activeAssignment = validAssignments.find(a => a.user === userId);

        if (!activeAssignment) {
            console.error("Errore: Nessun assignment attivo trovato per l'utente e l'asset selezionati.");
            setError("Errore: Nessun assignment attivo trovato per l'utente e l'asset selezionati.");
            return;
        }

        const payload = {
            assignment: activeAssignment.id,
            quantity,
            location,
        };

        try {
            const token = localStorage.getItem("access_token");
            const headers = {Authorization: `Bearer ${token}`};
            const API_URL = process.env.REACT_APP_BACKEND_URL;
            const response = await axios.post(`${API_URL}/acquisitions/`, payload, {headers});


            setAcquisitions([...acquisitions, response.data]);
            setShowAddModal(false);
            setError("");
        } catch (error) {
            console.error("Errore durante l'aggiunta dell'acquisizione:", error);
            setError("Errore durante l'aggiunta dell'acquisizione.");
        }
    };

    const handleEdit = (acq) => {
        setSelectedAcquisition(acq);
        setShowEditModal(true);
    };

    const handleSaveEdit = async (formData) => {
        try {
            const token = localStorage.getItem("access_token");
            const API_URL = process.env.REACT_APP_BACKEND_URL;


            if (!selectedAcquisition) {
                setError("Errore: Nessuna acquisizione selezionata.");
                return;
            }

            const requestData = {
                quantity: Number(formData.quantity) // Assicuriamoci che sia un numero
            };

            const response = await axios.put(
                `${API_URL}/acquisitions/${selectedAcquisition.id}/`,
                requestData,
                {headers: {Authorization: `Bearer ${token}`}}
            );

            setAcquisitions(acquisitions.map(acq =>
                acq.id === response.data.id ? response.data : acq
            ));

            setShowEditModal(false);
        } catch (error) {
            setError("Errore durante la modifica.");
        }
    };
    const filteredAcquisitions = acquisitions
        .filter(acq => !showActiveOnly || acq.is_active)
        .sort((a, b) => sortOrder === "asc"
            ? new Date(a.acquired_at) - new Date(b.acquired_at)
            : new Date(b.acquired_at) - new Date(a.acquired_at)
        );

    return (
        <>
            <Navbar/>
            <div className="content-container">
                <UserInfo/>
                <div className="table-container">
                    <div className="table-header">
                        <h1>Gestione Acquisizioni</h1>
                        <div className="controls">
                            <label className="checkbox-label">
                                <input type="checkbox" checked={showActiveOnly}
                                       onChange={() => setShowActiveOnly(!showActiveOnly)}/>
                                Mostra solo attivi
                            </label>
                            <button className="sort-button" onClick={toggleSortOrder}>
                                {sortOrder === "asc" ? <FaSortAmountDown/> : <FaSortAmountUp/>}
                                {sortOrder === "asc" ? " Data Acquisizione Crescente" : " Data Acquisizione Decrescente"}
                            </button>
                        </div>
                        <button className="add-button" onClick={() => setShowAddModal(true)}>➕ Aggiungi Acquisizione
                        </button>
                    </div>
                    <table className="styled-table">
                        <thead>
                        <tr>
                            <th>Utente</th>
                            <th>Nome Asset</th>
                            <th>Quantità</th>
                            <th>Data Acquisizione</th>
                            <th>Data Restituzione</th>
                            <th>Stato</th>
                            <th>Location</th>
                            <th>Azioni</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredAcquisitions.map(acq => (
                            <tr key={acq.id} className={acq.is_active ? "active" : "inactive"}>
                                <td>{acq.user_name}</td>
                                <td>{acq.asset_name}</td>
                                <td>{acq.quantity}</td>
                                <td>{new Date(acq.acquired_at).toLocaleDateString('it-IT', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}</td>
                                <td>{acq.removed_at ? new Date(acq.removed_at).toLocaleString("it-IT") : "—"}</td>
                                <td className={acq.is_active ? "active" : "inactive"}>
                                    {acq.is_active ? "Attiva" : "Disattivata"}
                                </td>
                                <td>{locations.find(l => l.id === acq.location)?.name || "N/A"}</td>
                                <td className="actions-column">
                                    {acq.is_active ? (
                                        <>
                                            <BsThreeDotsVertical className="menu-icon"
                                                                 onClick={() => toggleMenu(acq.id)}/>
                                            {menuOpen === acq.id && (
                                                <div className="dropdown-menu show">
                                                    <p onClick={() => handleEdit(acq)}> Modifica</p>
                                                    <p onClick={() => handleRemoveAcquisition(acq.id)}> Rimuovi</p>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <p className="disabled"> Già disattivato</p>
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
                        {
                            name: "user",
                            label: "Utente",
                            type: "select",
                            options: users.map(u => ({value: u.id, label: u.username}))
                        },
                        {
                            name: "asset",
                            label: "Asset",
                            type: "select",
                            options: Array.from(new Set(assignments.map(a => a.asset))).map(assetId => {
                                const asset = assignments.find(a => a.asset === assetId)?.asset_name;
                                return {value: assetId, label: asset};
                            })
                        },
                        {name: "quantity", label: "Quantità", type: "number", min: 1},
                        {
                            name: "location",
                            label: "Location",
                            type: "select",
                            options: locations.map(l => ({value: l.id, label: l.name}))
                        }
                    ]}
                />

            )}
            {showEditModal && selectedAcquisition && (
                <EditItemModal
                    show={showEditModal}
                    handleClose={() => setShowEditModal(false)}
                    handleSave={handleSaveEdit}
                    initialData={selectedAcquisition}
                    fields={[{
                        name: "quantity",
                        label: "Quantità",
                        type: "number",
                        defaultValue: selectedAcquisition.quantity
                    }]}
                />
            )}
        </>
    );
}

export default Acquisitions;


