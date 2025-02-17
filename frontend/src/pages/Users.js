import React, {useState, useEffect, useRef} from "react";
import Navbar from "../components/Navbar";
import UserInfo from "../components/UserInfo";
import "../style.css";
import {BsThreeDotsVertical} from "react-icons/bs";
import AddItemModal from "../components/AddItemModal";
import EditItemModal from "../components/EditItemModal";
import {FaSortAmountDown, FaSortAmountUp} from "react-icons/fa";
import axios from "axios";

function Users() {
    const [users, setUsers] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [acquisitions, setAcquisitions] = useState([]);
    const [menuOpen, setMenuOpen] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [sortOrder, setSortOrder] = useState("asc");
    const menuRefs = useRef({});

    useEffect(() => {
        const userRole = localStorage.getItem("user_role");
        if (userRole !== "manager") {
            alert("Accesso negato! Solo i manager possono visualizzare questa pagina.");
            window.location.href = "/";
            return;
        }

        const fetchData = async () => {
            try {
                const token = localStorage.getItem("access_token");
                const headers = {Authorization: `Bearer ${token}`};

                const [usersRes, assignmentsRes, acquisitionsRes] = await Promise.all([
                    axios.get("http://localhost:8001/api/users/", {headers}),
                    axios.get("http://localhost:8001/api/assignments/", {headers}),
                    axios.get("http://localhost:8001/api/acquisitions/", {headers})
                ]);

                const updatedUsers = usersRes.data.map(user => ({
                    ...user,
                    phone: user.phone || ""  // Assegna stringa vuota se phone è undefined
                }));

                setUsers(updatedUsers);
                setAssignments(assignmentsRes.data);
                setAcquisitions(acquisitionsRes.data);
            } catch (error) {
                console.error("Errore nel recupero dei dati:", error);
            }
        };
        fetchData();
    }, []);

    const toggleMenu = (id) => setMenuOpen(menuOpen === id ? null : id);
    const toggleSortOrder = () => setSortOrder(sortOrder === "asc" ? "desc" : "asc");

    const sortedUsers = [...users].sort((a, b) => {
        return sortOrder === "asc"
            ? a.username.localeCompare(b.username)
            : b.username.localeCompare(a.username);
    });

    const getUserAssetsCount = (userId) => {
        const userAssignments = assignments.filter(a => a.user === userId);
        const assignedAssets = userAssignments.length;
        const holdingAssets = acquisitions.filter(acq => userAssignments.some(a => a.id === acq.assignment && acq.is_active)).length;
        return {assignedAssets, holdingAssets};
    };

    const handleEdit = (user) => {
        setCurrentUser(user);
        setShowEditModal(true);
        setMenuOpen(null);
    };

    const handleRemove = async (id) => {
        if (!window.confirm("Sei sicuro di voler rimuovere questo utente?")) return;
        try {
            const token = localStorage.getItem("access_token");
            const headers = {Authorization: `Bearer ${token}`};
            await axios.delete(`http://localhost:8001/api/users/${id}/`, {headers});
            setUsers(users.filter(user => user.id !== id));
        } catch (error) {
            console.error("Errore durante la rimozione:", error);
        }
    };

    const handleAddUser = async (formData) => {
        console.log("Dati inviati per aggiunta:", formData);
        try {
            const token = localStorage.getItem("access_token");
            const headers = {Authorization: `Bearer ${token}`};
            const response = await axios.post("http://localhost:8001/api/users/", formData, {headers});
            setUsers([...users, response.data]);
            setShowAddModal(false);
        } catch (error) {
            console.error("Errore durante l'aggiunta:", error);
        }
    };

    const handleSaveChanges = async (formData) => {
        if (!currentUser) return;
        console.log("Dati inviati per modifica:", formData);
        try {
            const token = localStorage.getItem("access_token");
            const headers = {Authorization: `Bearer ${token}`};
            const response = await axios.put(`http://localhost:8001/api/users/${currentUser.id}/`, formData, {headers});
            setUsers(users.map(u => u.id === currentUser.id ? response.data : u));
            setShowEditModal(false);
        } catch (error) {
            console.error("Errore durante l'aggiornamento:", error);
        }
    };

    return (
        <>
            <Navbar/>
            <div className="content-container">
                <UserInfo/>
                <div className="table-container">
                    <div className="table-header">
                        <h1>Gestione Utenti</h1>
                        <div className="controls">
                            <button className="sort-button" onClick={toggleSortOrder}>
                                {sortOrder === "asc" ? <FaSortAmountDown/> : <FaSortAmountUp/>}
                                {sortOrder === "asc" ? " Username Crescente" : " Username Decrescente"}
                            </button>
                            <button className="add-button" onClick={() => setShowAddModal(true)}>➕ Aggiungi Utente
                            </button>
                        </div>
                    </div>
                    <table className="styled-table">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Username</th>
                            <th>Nome</th>
                            <th>Cognome</th>
                            <th>Ruolo</th>
                            <th>Email</th>
                            <th>Telefono</th>
                            <th>Asset Assegnati</th>
                            <th>Asset Posseduti</th>
                            <th>Azioni</th>
                        </tr>
                        </thead>
                        <tbody>
                        {sortedUsers.map((user) => {
                            const {assignedAssets, holdingAssets} = getUserAssetsCount(user.id);
                            return (
                                <tr key={user.id}>
                                    <td>{user.id}</td>
                                    <td>{user.username}</td>
                                    <td>{user.first_name}</td>
                                    <td>{user.last_name}</td>
                                    <td>{user.role === "manager" ? "👔 Manager" : "👤 User"}</td>
                                    <td>{user.email}</td>
                                    <td>{user.phone}</td>
                                    <td>{assignedAssets}</td>
                                    <td>{holdingAssets}</td>
                                    <td className="actions-column">
                                        <div className="dropdown" ref={(el) => (menuRefs.current[user.id] = el)}>
                                            <BsThreeDotsVertical className="menu-icon"
                                                                 onClick={() => toggleMenu(user.id)}/>
                                            {menuOpen === user.id && (
                                                <div className="dropdown-menu show">
                                                    <p onClick={() => handleEdit(user)}>✏️ Modifica</p>
                                                    <p onClick={() => handleRemove(user.id)}>🗑️ Rimuovi</p>
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
                    handleSave={handleAddUser}
                    fields={[
                        {name: "username", label: "Username", type: "text"},
                        {name: "first_name", label: "Nome", type: "text"},
                        {name: "last_name", label: "Cognome", type: "text"},
                        {name: "email", label: "Email", type: "email"},
                        {name: "phone", label: "Telefono", type: "text"},
                        {
                            name: "role", label: "Ruolo", type: "select", options: [
                                {value: "user", label: "User"},
                                {value: "manager", label: "Manager"}
                            ]
                        }
                    ]}
                />
            )}
            {showEditModal && currentUser && (
                <EditItemModal
                    show={showEditModal}
                    handleClose={() => setShowEditModal(false)}
                    handleSave={handleSaveChanges}
                    initialData={currentUser}
                    fields={[
                        {name: "username", label: "Username", type: "text", defaultValue: currentUser.username},
                        {name: "first_name", label: "Nome", type: "text", defaultValue: currentUser.first_name},
                        {name: "last_name", label: "Cognome", type: "text", defaultValue: currentUser.last_name},
                        {name: "email", label: "Email", type: "email", defaultValue: currentUser.email},
                        {name: "phone", label: "Telefono", type: "text", defaultValue: currentUser.phone || ""},  // Aggiunto il campo telefono
                        {
                            name: "role", label: "Ruolo", type: "select", defaultValue: currentUser.role, options: [
                                {value: "user", label: "User"},
                                {value: "manager", label: "Manager"}
                            ]
                        }
                    ]}
                />
            )}
        </>
    );
}

export default Users;





