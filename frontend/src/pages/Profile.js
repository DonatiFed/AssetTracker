import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import "../style.css";

function Profile() {
    const [userData, setUserData] = useState({
        first_name: "",
        last_name: "",
        role: "",
        email: "",
        phone_number: "",
        assigned_assets: 0,
        holding_assets: 0,
    });

    const [editing, setEditing] = useState(false);
    const [editedData, setEditedData] = useState({});

    useEffect(() => {
        // Simulazione recupero dati utente
        const storedRole = localStorage.getItem("user_role");

        // Mock data utente (da sostituire con fetch API)
        const mockUserData = {
            first_name: "Mario",
            last_name: "Rossi",
            role: storedRole || "user",
            email: "mario.rossi@example.com",
            phone_number: "1234567890",
            assigned_assets: 5,
            holding_assets: 2,
        };

        setUserData(mockUserData);
        setEditedData(mockUserData);
    }, []);

    const handleEditToggle = () => {
        setEditing(!editing);
    };

    const handleChange = (e) => {
        setEditedData({
            ...editedData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSave = () => {
        // Simula salvataggio dati (da sostituire con chiamata API)
        setUserData(editedData);
        setEditing(false);
        alert("Modifiche salvate con successo!");
    };

    return (
        <>
            <Navbar />
            <div className="profile-container">
                <h1>Profilo Utente</h1>
                <div className="profile-card">
                    <div className="profile-info">
                        <p><strong>Nome:</strong> {editing ? <input type="text" name="first_name" value={editedData.first_name} onChange={handleChange} /> : userData.first_name}</p>
                        <p><strong>Cognome:</strong> {editing ? <input type="text" name="last_name" value={editedData.last_name} onChange={handleChange} /> : userData.last_name}</p>
                        <p><strong>Ruolo:</strong> {userData.role === "manager" ? "👔 Manager" : "👤 User"}</p>
                        <p><strong>Email:</strong> {editing ? <input type="email" name="email" value={editedData.email} onChange={handleChange} /> : userData.email}</p>
                        <p><strong>Telefono:</strong> {editing ? <input type="tel" name="phone_number" value={editedData.phone_number} onChange={handleChange} /> : userData.phone_number}</p>
                        <p><strong>Asset Assegnati:</strong> {userData.assigned_assets}</p>
                        <p><strong>Asset Attualmente Posseduti:</strong> {userData.holding_assets}</p>
                    </div>

                    <div className="profile-actions">
                        {editing ? (
                            <>
                                <button className="save-button" onClick={handleSave}>💾 Salva Modifiche</button>
                                <button className="cancel-button" onClick={handleEditToggle}>❌ Annulla</button>
                            </>
                        ) : (
                            <button className="edit-button" onClick={handleEditToggle}>✏️ Modifica Profilo</button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default Profile;
