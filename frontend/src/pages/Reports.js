import React, {useState, useEffect} from "react";
import Navbar from "../components/Navbar";
import UserInfo from "../components/UserInfo";
import AddItemModal from "../components/AddItemModal";
import EditItemModal from "../components/EditItemModal";
import {BsThreeDotsVertical} from "react-icons/bs";
import {FaSortAmountDown, FaSortAmountUp} from "react-icons/fa";
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
    const userRole = localStorage.getItem("user_role");
    const userId = localStorage.getItem("user_id");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("access_token");
                const headers = {Authorization: `Bearer ${token}`};

                const requests = [
                    axios.get("http://localhost:8001/api/acquisitions/", {headers}),
                    axios.get("http://localhost:8001/api/reports/", {headers}),
                    axios.get("http://localhost:8001/api/assignments/", {headers})
                ];
                if (userRole === 'manager') {
                    requests.push(axios.get("http://localhost:8001/api/users/", {headers}));
                }
                const [acqRes, reportRes, assignmentRes, userRes] = await Promise.all(requests);

                setAcquisitions(acqRes.data);
                setReports(reportRes.data);
                setAssignments(assignmentRes.data);

                if (userRole === 'manager') {
                    setUsers(userRes.data);
                }
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

    // mostra asset univoci dagli assignment attivi (per user corrente se non manager)
    const visibleAssignments = assignments;
    const uniqueAssets = Array.from(new Set(visibleAssignments.map(a => a.asset_name)))
        .map((asset, index) => {
            const assignment = visibleAssignments.find(a => a.asset_name === asset);
            return {key: `asset-${assignment?.id || index}`, value: assignment?.id, label: asset};
        });

    const handleAddReport = async (formData) => {
        const {asset, title, description} = formData;
        const selectedUser = userRole === "manager" ? formData.user : userId;


        const selectedAssignment = assignments.find(a => a.id === parseInt(asset)); //trovo l'assignment selezionato per risalire all'asset e allo user
        if (!selectedAssignment) {
            setError("Errore: Nessun assignment trovato.");
            return;
        }
        const assetId = selectedAssignment.asset;  // id dell'asset
        let assignmentForUser;

        if (userRole === "user") {
            assignmentForUser = selectedAssignment;  // se user posso usare direttamente l'assignment selezionato(sarà quello con asset e user corretti),altrimenti devo cercarlo
        } else {
            assignmentForUser = assignments.find(a =>
                a.user === parseInt(selectedUser) && a.asset === assetId && a.is_active
            );
        }
        if (!assignmentForUser) {
            setError("Errore: Nessun assignment attivo trovato.");
            return;
        }
        const acquisition = acquisitions.find(acq =>
            acq.is_active && acq.assignment === assignmentForUser.id
        );

        if (!acquisition) {
            setError("Errore: Nessuna acquisition attiva trovata per l'utente e l'asset selezionati.");
            return;
        }
        const dataToSend = {acquisition: acquisition.id, title, description};
        try {
            const token = localStorage.getItem("access_token");
            const headers = {Authorization: `Bearer ${token}`};
            const response = await axios.post("http://localhost:8001/api/reports/", dataToSend, {headers});
            setReports([...reports, response.data]);
            setShowAddModal(false);
        } catch (error) {
            console.error("Errore durante l'aggiunta del report:", error);
            setError("Errore durante l'aggiunta del report.");
        }
    };


    const handleEditReport = async (formData) => {
        if (!selectedReport) return;
        const {title, description} = formData;
        const dataToSend = {title, description, acquisition: selectedReport.acquisition};

        try {
            const token = localStorage.getItem("access_token");
            const headers = {Authorization: `Bearer ${token}`};
            const response = await axios.put(`http://localhost:8001/api/reports/${selectedReport.id}/`, dataToSend, {headers});
            setReports(reports.map(r => (r.id === selectedReport.id ? response.data : r)));
            setShowEditModal(false);
        } catch (error) {
            console.error("Errore durante la modifica del report:", error.response ? error.response.data : error);
            setError("Errore durante la modifica.");
        }
    };

    const handleRemoveReport = async (id) => {
        try {
            const token = localStorage.getItem("access_token");
            const headers = {Authorization: `Bearer ${token}`};
            await axios.delete(`http://localhost:8001/api/reports/${id}/`, {headers});
            setReports(reports.filter(report => report.id !== id));
        } catch (error) {
            console.error("Errore durante la rimozione del report:", error);
        }
    };


    return (
        <>
            <Navbar/>
            <UserInfo/>
            <div className="page-content">
                <div className="table-container">
                    <div className="table-header">
                        <h1>Gestione Report</h1>
                        <div className="controls">
                            <button className="sort-button" onClick={toggleSortOrder}>
                                {sortOrder === "asc" ? <FaSortAmountDown/> : <FaSortAmountUp/>}
                                {sortOrder === "asc" ? " Data Creazione Crescente" : " Data Creazione  Decrescente"}
                            </button>
                            <button className="add-button" onClick={() => setShowAddModal(true)}>➕ Aggiungi Report
                            </button>
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
                                            <BsThreeDotsVertical className="menu-icon"
                                                                 onClick={() => toggleMenu(report.id)}/>
                                            {menuOpen === report.id && (
                                                <div className="dropdown-menu show">
                                                    <p onClick={() => {
                                                        setSelectedReport(report);
                                                        setShowEditModal(true);
                                                    }}>✏️ Modifica</p>
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
                        ...(userRole === 'manager' ? [{
                            name: "user",
                            label: "Utente",
                            type: "select",
                            options: users.map(u => ({value: u.id, label: u.username}))
                        }] : []),
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
                        {name: "title", label: "Titolo", type: "text"},
                        {name: "description", label: "Descrizione", type: "textarea"}
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
                        {name: "title", label: "Titolo", type: "text", defaultValue: selectedReport?.title},
                        {
                            name: "description",
                            label: "Descrizione",
                            type: "textarea",
                            defaultValue: selectedReport?.description
                        }
                    ]}
                />
            )}
        </>
    );
}

export default Reports;



