import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import UserInfo from "../components/UserInfo";
import AddItemModal from "../components/AddItemModal";
import EditItemModal from "../components/EditItemModal";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FaSortAmountDown, FaSortAmountUp } from "react-icons/fa";
import axios from "axios";
import "../style.css";

function Reports() {
    const [reports, setReports] = useState([]);
    const [acquisitions, setAcquisitions] = useState([]);
    const [users, setUsers] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [menuOpen, setMenuOpen] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    const [sortOrder, setSortOrder] = useState("asc");
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("access_token");
                const headers = { Authorization: `Bearer ${token}` };
                const [acqRes, userRes, reportRes, assignmentRes] = await Promise.all([
                    axios.get("http://localhost:8001/api/acquisitions/", { headers }),
                    axios.get("http://localhost:8001/api/users/", { headers }),
                    axios.get("http://localhost:8001/api/reports/", { headers }),
                    axios.get("http://localhost:8001/api/assignments/", { headers })
                ]);

                setAcquisitions(acqRes.data);
                setUsers(userRes.data);
                setReports(reportRes.data);
                setAssignments(assignmentRes.data.filter(a => a.is_active));
            } catch (error) {
                console.error("Errore nel recupero dei dati:", error);
            }
        };
        fetchData();
    }, []);

    const toggleMenu = (id) => setMenuOpen(menuOpen === id ? null : id);
    const toggleSortOrder = () => setSortOrder(sortOrder === "asc" ? "desc" : "asc");

    const sortedReports = reports.sort((a, b) => {
        const dateA = new Date(a.created_at);
        const dateB = new Date(b.created_at);
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

    const uniqueAssets = Array.from(new Set(acquisitions.map(a => a.asset_name))).map((asset, index) => {
        const acquisition = acquisitions.find(a => a.asset_name === asset);
        return { key: `asset-${acquisition?.id || index}`, value: acquisition?.id, label: asset };
    });

    const handleAddReport = async (formData) => {
        const { user, asset, title, description } = formData;
        console.log("📝 Dati dal modal:", formData);

        // Trova l'acquisition selezionata (solo per recuperare l'asset)
        const selectedAcquisition = acquisitions.find(acq => acq.id === parseInt(asset));
        if (!selectedAcquisition) {
            console.error("❌ Acquisition non trovata.");
            setError("Errore: Nessuna acquisition trovata.");
            return;
        }
        console.log("🔍 Acquisition selezionata per recupero asset:", selectedAcquisition);

        // Usa assignments per recuperare l'ID asset corretto
        const assignmentForAsset = assignments.find(a => a.id === selectedAcquisition.assignment);
        console.log("AssignmentForAsset:",assignmentForAsset);
        if (!assignmentForAsset) {
            console.error("❌ Assignment non trovato.");
            setError("Errore: Nessun assignment trovato.");
            return;
        }

        const assetId = assignmentForAsset.asset;  // Recupera l'ID asset da assignments(l'assignment da cui si recupera potrebbe non essere quello legato allo user che fa report(e ha acquistato)!!!)

        console.log("🔍 Asset trovato tramite assignment:", assetId);

        const assignmentForAcquisition = assignments.find(a =>
            a.user === parseInt(user) && a.asset === assetId
        );

        if (!assignmentForAcquisition) {
            console.error("❌ Nessun assignment trovato per l'utente e l'asset selezionati.");
            setError("Errore: Nessun assignment trovato.");
            return;
        }

        const acquisition = acquisitions.find(acq =>
            acq.is_active && acq.assignment === assignmentForAcquisition.id
        );

        if (!acquisition) {
            console.error("❌ Nessuna acquisition attiva trovata per l'assignment.");
            setError("Errore: Nessuna acquisition attiva trovata per l'utente e l'asset selezionati.");
            return;
        }

        console.log("✅ Acquisition finale trovata:", acquisition);

        const dataToSend = { acquisition: acquisition.id, title, description };
        console.log("📤 Dati inviati al backend:", dataToSend);

        try {
            const token = localStorage.getItem("access_token");
            const headers = { Authorization: `Bearer ${token}` };
            const response = await axios.post("http://localhost:8001/api/reports/", dataToSend, { headers });
            setReports([...reports, response.data]);
            setShowAddModal(false);
        } catch (error) {
            console.error("Errore durante l'aggiunta del report:", error);
            setError("Errore durante l'aggiunta del report.");
        }
    };


    const handleEditReport = async (formData) => {
        if (!selectedReport) return;
        const { title, description } = formData;
        try {
            const token = localStorage.getItem("access_token");
            const headers = { Authorization: `Bearer ${token}` };
            const response = await axios.put(`http://localhost:8001/api/reports/${selectedReport.id}/`, { title, description }, { headers });
            setReports(reports.map(r => (r.id === selectedReport.id ? response.data : r)));
            setShowEditModal(false);
        } catch (error) {
            console.error("Errore durante la modifica del report:", error);
            setError("Errore durante la modifica.");
        }
    };

    const handleRemoveReport = async (id) => {
        try {
            const token = localStorage.getItem("access_token");
            const headers = { Authorization: `Bearer ${token}` };
            await axios.delete(`http://localhost:8001/api/reports/${id}/`, { headers });
            setReports(reports.filter(report => report.id !== id));
        } catch (error) {
            console.error("Errore durante la rimozione del report:", error);
        }
    };


    return (
        <>
            <Navbar />
            <UserInfo />
            <div className="page-content">
                <div className="table-container">
                    <div className="table-header">
                        <h1>Gestione Report</h1>
                        <div className="controls">
                            <button className="sort-button" onClick={toggleSortOrder}>
                                {sortOrder === "asc" ? <FaSortAmountDown /> : <FaSortAmountUp />}
                                {sortOrder === "asc" ? " Ordina Crescente" : " Ordina Decrescente"}
                            </button>
                            <button className="add-button" onClick={() => setShowAddModal(true)}>➕ Aggiungi Report</button>
                        </div>
                    </div>
                    <table className="styled-table">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Utente</th>
                            <th>Asset</th>
                            <th>Titolo</th>
                            <th>Descrizione</th>
                            <th>Data Creazione</th>
                            <th>Azioni</th>
                        </tr>
                        </thead>
                        <tbody>
                        {sortedReports.map((report) => {
                            const acquisition = acquisitions.find(a => a.id === report.acquisition) || {};
                            const assignment = assignments.find(a => a.id === acquisition.assignment) || {};

                            return (
                                <tr key={report.id}>
                                    <td>{report.id}</td>
                                    <td>{assignment.user_name || 'N/A'}</td>
                                    <td>{assignment.asset_name || 'N/A'}</td>
                                    <td>{report.title}</td>
                                    <td>{report.description}</td>
                                    <td>{new Date(report.created_at).toLocaleString("it-IT")}</td>
                                    <td className="actions-column">
                                        <div className="dropdown">
                                            <BsThreeDotsVertical className="menu-icon" onClick={() => toggleMenu(report.id)} />
                                            {menuOpen === report.id && (
                                                <div className="dropdown-menu show">
                                                    <p onClick={() => { setSelectedReport(report); setShowEditModal(true); }}>✏️ Modifica</p>
                                                    <p onClick={() => handleRemoveReport(report.id)}>🗑️ Rimuovi</p>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>

                    </table>
                </div>
            </div>
            {showAddModal && (
                <AddItemModal
                    show={showAddModal}
                    handleClose={() => setShowAddModal(false)}
                    handleSave={handleAddReport}
                    fields={[
                        { name: "user", label: "Utente", type: "select", options: users.map(u => ({ value: u.id, label: u.username })) },
                        {
                            name: "asset",
                            label: "Asset",
                            type: "select",
                            options: uniqueAssets.map(a => ({
                                key: a.key,
                                value: a.value,
                                label: a.label
                            }))
                        },
                        { name: "title", label: "Titolo", type: "text" },
                        { name: "description", label: "Descrizione", type: "textarea" }
                    ]}
                />
            )}
            {showEditModal && (
                <EditItemModal
                    show={showEditModal}
                    handleClose={() => setShowEditModal(false)}
                    handleSave={handleEditReport}
                    initialData={selectedReport}
                    fields={[
                        { name: "title", label: "Titolo", type: "text", defaultValue: selectedReport?.title },
                        { name: "description", label: "Descrizione", type: "textarea", defaultValue: selectedReport?.description }
                    ]}
                />
            )}
        </>
    );
}

export default Reports;



