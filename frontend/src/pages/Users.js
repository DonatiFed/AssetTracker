import React, { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import UserInfo from "../components/UserInfo";
import "../style.css";
import { BsThreeDotsVertical } from "react-icons/bs";

// Mock data per gli utenti
const mockUsers = [
    { id: 1, first_name: "Mario", last_name: "Rossi", role: "user", email: "mario.rossi@example.com", phone: "1234567890", assigned_objects: 3, holding_objects: 1 },
    { id: 2, first_name: "Anna", last_name: "Verdi", role: "user", email: "anna.verdi@example.com", phone: "0987654321", assigned_objects: 2, holding_objects: 2 },
    { id: 3, first_name: "Luca", last_name: "Bianchi", role: "manager", email: "luca.bianchi@example.com", phone: "1122334455", assigned_objects: 5, holding_objects: 4 }
];

function Users() {
    const [users, setUsers] = useState(mockUsers);
    const [menuOpen, setMenuOpen] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const menuRefs = useRef({});

    useEffect(() => {
        const userRole = localStorage.getItem("user_role");
        if (userRole !== "manager") {
            alert("Accesso negato! Solo i manager possono visualizzare questa pagina.");
            window.location.href = "/";
        }
    }, []);

    const toggleMenu = (id) => {
        setMenuOpen(menuOpen === id ? null : id);
    };

    const handleEdit = (user) => {
        setCurrentUser(user);
        setShowEditModal(true);
        setMenuOpen(null);
    };

    const handleSaveChanges = () => {
        alert(`Utente ${currentUser.first_name} ${currentUser.last_name} aggiornato!`);
        setShowEditModal(false);
    };

    return (
        <>
            <Navbar />
            <div className="content-container">
                <UserInfo />

                <div className="table-container">
                    <div className="table-header">
                        <h1>Gestione Utenti</h1>
                        <button className="add-button">➕ Aggiungi Utente</button>
                    </div>

                    <table className="styled-table">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nome</th>
                            <th>Cognome</th>
                            <th>Ruolo</th>
                            <th>Email</th>
                            <th>Telefono</th>
                            <th>Assegnati</th>
                            <th>Attualmente Posseduti</th>
                            <th>Azioni</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.first_name}</td>
                                <td>{user.last_name}</td>
                                <td>{user.role === "manager" ? "👔 Manager" : "👤 User"}</td>
                                <td>{user.email}</td>
                                <td>{user.phone}</td>
                                <td>{user.assigned_objects}</td>
                                <td>{user.holding_objects}</td>
                                <td className="actions-column">
                                    <div className="dropdown" ref={(el) => (menuRefs.current[user.id] = el)}>
                                        <BsThreeDotsVertical className="menu-icon" onClick={() => toggleMenu(user.id)} />
                                        {menuOpen === user.id && (
                                            <div className="dropdown-menu show">
                                                <p onClick={() => handleEdit(user)}>✏️ Modifica</p>
                                                <p>🗑️ Rimuovi</p>
                                            </div>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showEditModal && currentUser && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <h2>Modifica Utente</h2>
                        <div className="form-group">
                            <label>Nome:</label>
                            <input
                                type="text"
                                value={currentUser.first_name}
                                onChange={(e) => setCurrentUser({ ...currentUser, first_name: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Cognome:</label>
                            <input
                                type="text"
                                value={currentUser.last_name}
                                onChange={(e) => setCurrentUser({ ...currentUser, last_name: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Email:</label>
                            <input
                                type="email"
                                value={currentUser.email}
                                onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Telefono:</label>
                            <input
                                type="text"
                                value={currentUser.phone}
                                onChange={(e) => setCurrentUser({ ...currentUser, phone: e.target.value })}
                            />
                        </div>
                        <div className="modal-buttons">
                            <button className="cancel-btn" onClick={() => setShowEditModal(false)}>Annulla</button>
                            <button className="save-btn" onClick={handleSaveChanges}>Salva</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Users;

