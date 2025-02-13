import React, { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import "../style.css";
import { BsThreeDotsVertical } from "react-icons/bs";
import axios from "axios";

function Assignments() {
    const [assignments, setAssignments] = useState([]);
    const [users, setUsers] = useState([]);
    const [assets, setAssets] = useState([]);
    const [menuOpen, setMenuOpen] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [error, setError] = useState("");

    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [newAssignment, setNewAssignment] = useState({
        user: "",
        asset: "",
        assigned_quantity: 1,
    });

    const menuRefs = useRef({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("access_token");
                const headers = { Authorization: `Bearer ${token}` };

                const [assignmentsRes, usersRes, assetsRes] = await Promise.all([
                    axios.get("http://localhost:8001/api/assignments/", { headers }),
                    axios.get("http://localhost:8001/api/users/", { headers }),
                    axios.get("http://localhost:8001/api/assets/", { headers }),
                ]);

                setAssignments(assignmentsRes.data);
                setUsers(usersRes.data);
                setAssets(assetsRes.data);
            } catch (error) {
                console.error("Errore nel recupero dei dati:", error);
                setError("Errore nel caricamento dati.");
            }
        };
        fetchData();
    }, []);

    const toggleMenu = (id) => {
        setMenuOpen(menuOpen === id ? null : id);
    };

    const handleAddAssignment = async () => {
        try {
            const token = localStorage.getItem("access_token");
            const headers = { Authorization: `Bearer ${token}` };

            const existingAssignment = assignments.find(
                (a) => a.user === newAssignment.user && a.asset === newAssignment.asset
            );

            if (existingAssignment) {
                setError("Questo asset è già stato assegnato a questo utente.");
                return;
            }

            const asset = assets.find(a => a.id === Number(newAssignment.asset));
            if (asset && newAssignment.assigned_quantity > asset.total_quantity) {
                setError(`Massimo assegnabile: ${asset.total_quantity}`);
                return;
            }

            const response = await axios.post(
                "http://localhost:8001/api/assignments/",
                newAssignment,
                { headers }
            );

            setAssignments([...assignments, response.data]);
            setShowAddModal(false);
            setNewAssignment({ user: "", asset: "", assigned_quantity: 1 });
            setError("");
        } catch (error) {
            console.error("Errore durante l'assegnazione:", error);
            setError("Errore durante l'assegnazione.");
        }
    };

    const handleEditAssignment = async () => {
        try {
            if (!selectedAssignment) return;

            const token = localStorage.getItem("access_token");
            const headers = { Authorization: `Bearer ${token}` };

            const asset = assets.find(a => a.id === Number(selectedAssignment.asset));
            if (asset && selectedAssignment.assigned_quantity > asset.total_quantity) {
                setError(`Massimo assegnabile: ${asset.total_quantity}`);
                return;
            }

            const response = await axios.patch(
                `http://localhost:8001/api/assignments/${selectedAssignment.id}/`,
                { assigned_quantity: selectedAssignment.assigned_quantity },
                { headers }
            );

            setAssignments(assignments.map(a => (a.id === response.data.id ? response.data : a)));
            setShowEditModal(false);
            setSelectedAssignment(null);
            setError("");
        } catch (error) {
            console.error("Errore nella modifica dell'assegnazione:", error);
            setError("Errore durante la modifica.");
        }
    };

    const handleRemoveAssignment = async (id) => {
        try {
            const token = localStorage.getItem("access_token");
            const headers = { Authorization: `Bearer ${token}` };

            await axios.delete(`http://localhost:8001/api/assignments/${id}/`, { headers });

            setAssignments(assignments.filter(a => a.id !== id));
        } catch (error) {
            console.error("Errore nella rimozione dell'assegnazione:", error);
            setError("Errore durante la rimozione.");
        }
    };

    return (
        <>
            <Navbar />
            <div className="table-container">
                <div className="table-header">
                    <h1>Gestione Assegnazioni</h1>
                    <button className="add-button" onClick={() => setShowAddModal(true)}>➕ Assegna Asset</button>
                </div>
                {error && <p className="error-message">{error}</p>}
                <table className="styled-table">
                    <thead>
                    <tr>
                        <th>ID Utente</th>
                        <th>Nome Utente</th>
                        <th>ID Asset</th>
                        <th>Nome Asset</th>
                        <th>Quantità Assegnata</th>
                        <th>Azioni</th>
                    </tr>
                    </thead>
                    <tbody>
                    {assignments.map((assignment) => (
                        <tr key={assignment.id}>
                            <td>{assignment.user}</td>
                            <td>{assignment.user_name}</td>
                            <td>{assignment.asset}</td>
                            <td>{assignment.asset_name}</td>
                            <td>{assignment.assigned_quantity}</td>
                            <td className="actions-column">
                                <div className="dropdown" ref={(el) => (menuRefs.current[assignment.id] = el)}>
                                    <BsThreeDotsVertical className="menu-icon" onClick={() => toggleMenu(assignment.id)} />
                                    {menuOpen === assignment.id && (
                                        <div className="dropdown-menu show">
                                            <p onClick={() => {
                                                setSelectedAssignment(assignment);
                                                setShowEditModal(true);
                                            }}>✏️ Modifica</p>
                                            <p onClick={() => handleRemoveAssignment(assignment.id)}>🗑️ Rimuovi</p>
                                        </div>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {showEditModal && selectedAssignment && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <h2>Modifica Assegnazione</h2>
                        {error && <p className="error-message">{error}</p>}
                        <label>Quantità:</label>
                        <input
                            type="number"
                            value={selectedAssignment.assigned_quantity}
                            min="1"
                            onChange={(e) =>
                                setSelectedAssignment({ ...selectedAssignment, assigned_quantity: parseInt(e.target.value) })
                            }
                        />
                        <div className="modal-buttons">
                            <button className="save-btn" onClick={handleEditAssignment}>Salva</button>
                            <button className="cancel-btn" onClick={() => setShowEditModal(false)}>Annulla</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Assignments;













