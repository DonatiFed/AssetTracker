import React, {useEffect, useState} from "react";
import axios from "axios";
import "../style.css"; // Assicurati che le nuove classi CSS siano incluse

function UserInfo() {
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const API_URL = process.env.REACT_APP_BACKEND_URL;


    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const token = localStorage.getItem("access_token");
                if (!token) {
                    setError("Nessun token trovato, accedi di nuovo.");
                    setShowModal(true);  // Mostra il modal
                    return;
                }

                const response = await axios.get(`${API_URL}/users/me/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setUser(response.data);
            } catch (err) {
                console.error("Errore nel recupero delle informazioni utente:", err);
                setError("Errore nel caricamento delle informazioni utente.");
            }
        };

        fetchUserInfo();
    }, []);

    if (error) {
        return <p className="error-message">{error}</p>;
    }

    if (!user) {
        return null;
    }

    return (
        <div className="user-info-container">
            <p>
                <span className="user-icon"> </span>
                {user.username} ({user.role === "manager" ? "Manager" : "User"})
            </p>
        </div>
    );
}

export default UserInfo;


