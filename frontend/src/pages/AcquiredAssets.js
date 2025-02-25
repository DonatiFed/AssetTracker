import React, {useState, useEffect, useRef} from "react";
import Navbar from "../components/Navbar";
import UserInfo from "../components/UserInfo";
import AddItemModal from "../components/AddItemModal";
import EditItemModal from "../components/EditItemModal";
import {BsThreeDotsVertical} from "react-icons/bs";
import {FaSortAmountDown, FaSortAmountUp} from "react-icons/fa";
import axios from "axios";
import "../style.css";


function AcquiredAssets() {
    const [acquisitions, setAcquisitions] = useState([]);
    const [acquiredAssets, setAcquiredAssets] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [locations, setLocations] = useState([]);
    const [menuOpen, setMenuOpen] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [showActiveOnly, setShowActiveOnly] = useState(true);
    const [sortOrder, setSortOrder] = useState("asc"); // asc o desc
    const [error, setError] = useState("");

    const [newAssignment, setNewAssignment] = useState({
        assignment: "",
        quantity: "",
    })


    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("access_token");
                const API_URL = process.env.REACT_APP_BACKEND_URL;
                const headers = {Authorization: `Bearer ${token}`};

                const [acquisitionsRes, assignmentsRes, locationsRes] = await Promise.all([
                    axios.get(`${API_URL}/acquisitions/`, {headers}),
                    axios.get(`${API_URL}/assignments/`, {headers}),
                    axios.get(`${API_URL}/locations/`, {headers})
                ]);

                setAcquiredAssets(acquisitionsRes.data);
                setAcquisitions(acquisitionsRes.data);
                setAssignments(assignmentsRes.data.filter(a => a.is_active));
                setLocations(locationsRes.data);

            } catch (error) {
                console.error("Errore nel recupero dei dati:", error);
            }
        };
        fetchData();
    }, []);

    const toggleMenu = (id) => setMenuOpen(menuOpen === id ? null : id);
    const toggleActiveOnly = () => setShowActiveOnly(!showActiveOnly);
    const toggleSortOrder = () => setSortOrder(sortOrder === "asc" ? "desc" : "asc");

    const filteredAssets = acquiredAssets
        .filter(asset => !showActiveOnly || asset.is_active)
        .sort((a, b) => {
            const dateA = new Date(a.acquired_at);
            const dateB = new Date(b.acquired_at);
            return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
        });

    const handleRemoveAcquisition = async (id) => {
        try {
            const token = localStorage.getItem("access_token");
            const API_URL = process.env.REACT_APP_BACKEND_URL;
            await axios.patch(`${API_URL}/acquisitions/${id}/deactivate/`, {}, {
                headers: {Authorization: `Bearer ${token}`}
            });
            setAcquiredAssets(acquiredAssets.map(asset =>
                asset.id === id ? {...asset, is_active: false, removed_at: new Date().toISOString()} : asset
            ));
        } catch (error) {
            console.error("Errore durante la rimozione dell'acquisition:", error);
        }
        setMenuOpen(null);
    };

    const handleAddAcquisition = async (formData) => {
        const {assignment, quantity, location} = formData;
        const dataToSend = {
            assignment: assignment,
            location: location,
            quantity: parseInt(quantity, 10)

        };

        try {
            const token = localStorage.getItem("access_token");
            const API_URL = process.env.REACT_APP_BACKEND_URL;
            const headers = {Authorization: `Bearer ${token}`};
            const response = await axios.post(`${API_URL}/acquisitions/`, dataToSend, { headers });

            setAcquiredAssets((prevAssets) => [...prevAssets, response.data]);
            setShowAddModal(false);
            setError("");
        } catch (error) {
            console.error("Errore durante l'aggiunta dell'acquisizione:", error);
            setError("Errore durante l'aggiunta dell'acquisizione.");
        }
    };

    const handleEdit = (asset) => {
        setSelectedAsset(asset);
        setShowEditModal(true);
    };

    const handleSaveEdit = async (formData) => {
        try {
            const token = localStorage.getItem("access_token");
            const API_URL = process.env.REACT_APP_BACKEND_URL;


            if (!selectedAsset) {
                setError("Errore: Nessuna acquisizione selezionata.");
                return;
            }

            const requestData = {
                quantity: Number(formData.quantity), // Assicuriamoci che sia un numero
            };
            const response = await axios.put(`${API_URL}/acquisitions/${selectedAsset.id}/`, requestData, {
                headers: {Authorization: `Bearer ${token}`}
            });

            setAcquiredAssets(acquiredAssets.map(asset =>
                asset.id === response.data.id ? response.data : asset
            ));

            setShowEditModal(false);
        } catch (error) {
            setError("Errore durante la modifica.");
        }
    };

    return (
        <>
            <Navbar/>
            <UserInfo/>
            <div className="page-content">
                <div className="table-container">
                    <div className="table-header">
                        <h1>Acquired Assets</h1>
                        <div className="controls">
                            <label className="checkbox-label">
                                <input type="checkbox" checked={showActiveOnly}
                                       onChange={() => setShowActiveOnly(!showActiveOnly)}/>
                                Mostra solo attivi
                            </label>
                            <button className="sort-button" onClick={toggleSortOrder}>
                                {sortOrder === "asc" ? <FaSortAmountDown/> : <FaSortAmountUp/>}
                                {sortOrder === "asc" ? " Ordina Crescente" : " Ordina Decrescente"}
                            </button>
                            <button className="add-button" onClick={() => setShowAddModal(true)}>➕ Acquire New Asset
                            </button>
                        </div>
                    </div>
                    <table className="styled-table">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nome</th>
                            <th>Quantità Acquisita</th>
                            <th>Data Acquisizione</th>
                            <th>Data Restituzione</th>
                            <th>Location</th>
                            <th>Stato</th>
                            <th>Azioni</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredAssets.length > 0 ? filteredAssets.map(asset => (
                            <tr key={asset.id}>
                                <td>{asset.id}</td>
                                <td>{asset.asset_name || 'N/A'}</td>
                                <td>{asset.quantity}</td>
                                <td>{new Date(asset.acquired_at).toLocaleString("it-IT")}</td>
                                <td>{asset.removed_at ? new Date(asset.removed_at).toLocaleString("it-IT") : "—"}</td>
                                <td>{locations.find(l => l.id === asset.location)?.name || "N/A"}</td>
                                <td className={asset.is_active ? "active" : "inactive"}>
                                    {asset.is_active ? "Attivo" : "Disattivato"}
                                </td>
                                <td className="actions-column">
                                    {asset.is_active ? (
                                        <div className="dropdown">
                                            <BsThreeDotsVertical className="menu-icon"
                                                                 onClick={() => toggleMenu(asset.id)}/>
                                            {menuOpen === asset.id && (
                                                <div className="dropdown-menu show">
                                                    <p onClick={() => handleEdit(asset)}> Modifica</p>
                                                    <p onClick={() => handleRemoveAcquisition(asset.id)}> Rimuovi</p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="disabled"> Già disattivato</p>
                                    )}
                                </td>
                            </tr>
                        )) : <tr>
                            <td colSpan="7">Nessun asset acquisito trovato</td>
                        </tr>}
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
                            name: "assignment", label: "Assegnamento", type: "select", options: assignments.map(a => ({
                                value: a.id,
                                label: `${a.asset_name} (ID: ${a.id})`  //mostro nome dell'asset
                            }))
                        },
                        {name: "quantity", label: "Quantità", type: "number"},
                        {
                            name: "location",
                            label: "Location",
                            type: "select",
                            options: locations.map(l => ({value: l.id, label: l.name}))
                        }
                    ]}
                />
            )}
            {showEditModal && (
                <EditItemModal
                    show={showEditModal}
                    handleClose={() => setShowEditModal(false)}
                    handleSave={handleSaveEdit}
                    initialData={selectedAsset}
                    fields={[{
                        name: "quantity",
                        label: "Quantità",
                        type: "number",
                        defaultValue: selectedAsset?.quantity
                    }]}
                />
            )}
        </>
    );
}

export default AcquiredAssets;

