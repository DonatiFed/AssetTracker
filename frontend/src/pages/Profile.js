import React, {useState, useEffect} from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import "../style.css";

function Profile() {
    const [userData, setUserData] = useState({
        first_name: "",
        last_name: "",
        is_manager: false,
        email: "",
        phone: ""  // Assicura che il numero di telefono non sia undefined
    });
    const [editing, setEditing] = useState(false);
    const [editedData, setEditedData] = useState({});

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem("access_token");
                const response = await axios.get("http://localhost:8001/users/me/", {
                    headers: {Authorization: `Bearer ${token}`},
                });
                const data = response.data;
                console.log("🔍 Dati utente ricevuti:", response.data);
                setUserData({
                    ...data,
                    phone: data.phone || "",  // Assicura un valore predefinito
                });
                setEditedData({
                    ...data,
                    phone: data.phone || "",  // Stessa cosa per l'input editabile
                });
            } catch (error) {
                console.error("Errore nel recupero dei dati utente:", error);
            }
        };
        fetchUserData();
    }, []);

    const handleEditToggle = () => setEditing(!editing);

    const handleChange = (e) => {
        setEditedData({
            ...editedData,
            [e.target.name]: e.target.value || ""  // Assicura sempre un valore valido
        });
    };

    const handleSave = async () => {
        console.log("📤 Dati inviati per modifica:", editedData);  // Log per debug
        try {
            const token = localStorage.getItem("access_token");
            await axios.put(`http://localhost:8001/api/users/${userData.id}/`, editedData, {
                headers: {Authorization: `Bearer ${token}`},
            });
            setUserData(editedData);
            setEditing(false);
            alert("Modifiche salvate con successo!");
        } catch (error) {
            console.error("Errore durante il salvataggio dei dati:", error);
            alert("Errore durante il salvataggio.");
        }
    };

    if (!userData) return <p>Caricamento...</p>;

    return (
        <>
            <Navbar/>
            <div className="profile-container">
                <h1>Profilo Utente</h1>
                <div className="profile-card">
                    <div className="profile-info">
                        <p><strong>Nome:</strong> {editing ? <input name="first_name" value={editedData.first_name}
                                                                    onChange={handleChange}/> : userData.first_name}</p>
                        <p><strong>Cognome:</strong> {editing ? <input name="last_name" value={editedData.last_name}
                                                                       onChange={handleChange}/> : userData.last_name}
                        </p>
                        <p><strong>Ruolo:</strong> {userData.role === "manager" ? "👔 Manager" : "👤 User"}</p>
                        <p><strong>Email:</strong> {editing ?
                            <input name="email" value={editedData.email} onChange={handleChange}/> : userData.email}</p>
                        <p><strong>Telefono:</strong> {editing ?
                            <input name="phone" value={editedData.phone} onChange={handleChange}/> : userData.phone}</p>
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
