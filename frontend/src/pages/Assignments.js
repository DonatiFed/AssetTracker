import React, { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import "../style.css";
import { BsThreeDotsVertical } from "react-icons/bs";
import axios from "axios";
import AddItemModal from "../components/AddItemModal";

function Assignments() {
    const [assignments, setAssignments] = useState([]);
    const [users, setUsers] = useState([]);
    const [assets, setAssets] = useState([]);
    const [menuOpen, setMenuOpen] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);

    const [newAssignment, setNewAssignment] = useState({
        user: "",
        asset: "",
        assigned_quantity: 1,
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

            // POST all'API
            const response = await axios.post(
                "http://localhost:8001/api/assignments/",
                formData,
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
                    a.id === response.data.id ? { ...a, is_active: false } : a
                )
            );
        } catch (error) {
            console.error("Errore nella disattivazione dell'assegnazione:", error);
            setError("Errore durante la disattivazione.");
        }
    };

    return (
        <>
            <Navbar />
            <div className="table-container">
                <div className="table-header">
                    <h1>Gestione Assegnazioni</h1>
                    <button className="add-button" onClick={() => setShowAddModal(true)}>
                        ➕ Assegna Asset
                    </button>
                </div>
                {error && <p className="error-message">{error}</p>}
                <table className="styled-table">
                    <thead>
                    <tr>
                        <th>ID Utente</th>
                        <th>Nome Utente</th>
                        <th>ID Asset</th>
                        <th>Nome Asset</th>
                        <th>Stato</th>
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
                            <td className={assignment.is_active ? "active" : "inactive"}>
                                {assignment.is_active ? "Attivo" : "Disattivato"}
                            </td>
                            <td className="actions-column">
                                <div
                                    className="dropdown"
                                    ref={(el) => (menuRefs.current[assignment.id] = el)}
                                >
                                    <BsThreeDotsVertical
                                        className="menu-icon"
                                        onClick={() => toggleMenu(assignment.id)}
                                    />
                                    {menuOpen === assignment.id && (
                                        <div className="dropdown-menu show">
                                            {assignment.is_active ? (
                                                <p
                                                    onClick={() =>
                                                        handleRemoveAssignment(assignment.id)
                                                    }
                                                >
                                                    🛑 Disattiva
                                                </p>
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
                    }
                ]}
            />
        </>
    );
}

export default Assignments;















