import React, { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import "../style.css";
import { BsThreeDotsVertical } from "react-icons/bs";
import axios from "axios";
import AddItemModal from "../components/AddItemModal";
import UserInfo from "../components/UserInfo";
import {FaSortAmountDown, FaSortAmountUp} from "react-icons/fa";

function Assignments() {
    const [assignments, setAssignments] = useState([]);
    const [users, setUsers] = useState([]);
    const [assets, setAssets] = useState([]);
    const [menuOpen, setMenuOpen] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [showActiveOnly, setShowActiveOnly] = useState(false);
    const [sortOrder, setSortOrder] = useState("asc");

    const [newAssignment, setNewAssignment] = useState({
        user: "",
        asset: "",
        assigned_quantity: 1,
        assigned_at: new Date().toISOString(),
    });

    const menuRefs = useRef({});

    // Fetch iniziale dati
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

    // Aggiunta nuovo assignment
    const handleAddAssignment = async (formData) => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem("access_token");
            const headers = { Authorization: `Bearer ${token}` };

            // Verifica se esiste già un'assegnazione attiva per lo stesso asset e utente
            const existingAssignment = assignments.find(
                (a) =>
                    a.user === formData.user &&
                    a.asset === formData.asset &&
                    a.is_active
            );

            if (existingAssignment) {
                setError("Questo asset è già stato assegnato a questo utente.");
                setIsLoading(false);
                return;
            }
            const newAssignmentData = {
                ...formData,
                assigned_at: new Date().toISOString()  // Invia la data corrente
            };
            console.log("Dati inviati:", newAssignmentData);
            // POST all'API
            const response = await axios.post(
                "http://localhost:8001/api/assignments/",
                newAssignmentData,
                { headers }
            );

            // Aggiorna stato con il nuovo assignment
            setAssignments([...assignments, response.data]);
            setShowAddModal(false);
            setError("");
        } catch (error) {
            console.error("Errore durante l'assegnazione:", error);
            setError("Errore durante l'assegnazione.");
        } finally {
            setIsLoading(false);
        }
    };


    // Disattivazione assignment
    const handleRemoveAssignment = async (id) => {
        try {
            const token = localStorage.getItem("access_token");
            const headers = { Authorization: `Bearer ${token}` };

            const response = await axios.patch(
                `http://localhost:8001/api/assignments/${id}/deactivate/`,
                {},
                { headers }
            );

            // Aggiorna lo stato locale
            setAssignments(
                assignments.map((a) =>
                    a.id === response.data.id ? { ...a, is_active: false ,removed_at:new Date().toISOString() } : a
                )
            );
        } catch (error) {
            console.error("Errore nella disattivazione dell'assegnazione:", error);
            setError("Errore durante la disattivazione.");
        }
    };

    const filteredAssignments = assignments
        .filter((a) => !showActiveOnly || a.is_active)
        .sort((a, b) => sortOrder === "asc" ? new Date(a.created_at) - new Date(b.created_at) : new Date(b.created_at) - new Date(a.created_at));
    const handleSort = () => {
        const order = sortOrder === "asc" ? "desc" : "asc";
        setSortOrder(order);

        const sortedAssignments = [...assignments].sort((a, b) => {
            const dateA = new Date(a.assigned_at);
            const dateB = new Date(b.assigned_at);

            if (order === "asc") {
                return dateA - dateB;
            } else {
                return dateB - dateA;
            }
        });

        setAssignments(sortedAssignments);
    };

    return (
        <>
            <Navbar />
            <div className="table-container">
                <UserInfo />
                <div className="table-header">
                    <h1>Gestione Assegnazioni</h1>
                    <div className="controls">
                        <label className="checkbox-label">
                            <input type="checkbox" checked={showActiveOnly} onChange={() => setShowActiveOnly(!showActiveOnly)} />
                            Mostra solo attivi
                        </label>
                        <button className="sort-button" onClick={handleSort}>
                            {sortOrder === "asc" ? <FaSortAmountDown /> : <FaSortAmountUp />}
                            {sortOrder === "asc" ? " Data Assegnazione Crescente" : " Data Assegnazione Decrescente"}
                        </button>
                        <button className="add-button" onClick={() => setShowAddModal(true)}>➕ Assegna Asset</button>
                    </div>
                </div>
                {error && <p className="error-message">{error}</p>}
                <table className="styled-table">
                    <thead>
                    <tr>
                        <th>ID Utente</th>
                        <th>Nome Utente</th>
                        <th>ID Asset</th>
                        <th>Nome Asset</th>
                        <th>Data di assegnazione</th>
                        <th>Data di disattivazione</th>
                        <th>Stato</th>
                        <th>Azioni</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredAssignments.map((assignment) => (
                        <tr key={assignment.id}>
                            <td>{assignment.user}</td>
                            <td>{assignment.user_name}</td>
                            <td>{assignment.asset}</td>
                            <td>{assignment.asset_name}</td>
                            <td>{assignment.assigned_at ? new Date(assignment.assigned_at).toLocaleDateString('it-IT', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                            }) : "N/A"}</td>
                            <td>{assignment.removed_at ? new Date(assignment.removed_at).toLocaleDateString('it-IT', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                            }) : "N/A"}</td>
                            <td className={assignment.is_active ? "active" : "inactive"}>
                                {assignment.is_active ? "Attivo" : "Disattivato"}
                            </td>
                            <td className="actions-column">
                                <div className="dropdown" ref={(el) => (menuRefs.current[assignment.id] = el)}>
                                    <BsThreeDotsVertical className="menu-icon" onClick={() => toggleMenu(assignment.id)} />
                                    {menuOpen === assignment.id && (
                                        <div className="dropdown-menu show">
                                            {assignment.is_active ? (
                                                <p onClick={() => handleRemoveAssignment(assignment.id)}>🛑 Disattiva</p>
                                            ) : (
                                                <p className="disabled">🚫 Già disattivato</p>
                                            )}
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
                show={showAddModal}
                handleClose={() => setShowAddModal(false)}
                handleSave={handleAddAssignment}
                fields={[
                    {
                        name: "user",
                        label: "Utente",
                        type: "select",
                        options: users.map(user => ({
                            value: user.id,
                            label: user.username
                        }))
                    },
                    {
                        name: "asset",
                        label: "Asset",
                        type: "select",
                        options: assets.map(asset => ({
                            value: asset.id,
                            label: asset.name
                        }))
                    },
                    {
                        name: "assigned_at",
                        type: "hidden",
                        value: new Date().toISOString()  // Data attuale
                    }
                ]}
            />
        </>
    );
}

export default Assignments;















