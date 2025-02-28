import React, {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import axios from "axios";
import "../style.css";

function Navbar() {
    const [userRole, setUserRole] = useState(null);
    const API_URL = process.env.REACT_APP_BACKEND_URL;


    useEffect(() => {
        const fetchUserRole = async () => {
            try {
                const token = localStorage.getItem("access_token");
                if (!token) {
                    console.error("Nessun token trovato.");
                    return;
                }

                const response = await axios.get(`${API_URL}/users/me/`, {
                    headers: {Authorization: `Bearer ${token}`}
                });

                if (response.data && response.data.role) {
                    setUserRole(response.data.role);
                } else {
                    console.error("Ruolo non trovato nella risposta dell'api:", response.data);
                }
            } catch (err) {
                console.error("Errore nel recupero del ruolo utente:", err);
            }
        };

        fetchUserRole();
    }, []);

    return (
        <nav className="navbar">
            <ul>
                <li><Link to="/home"> Home</Link></li>
                {userRole === "manager" ? (
                    <>
                        <li><Link to="/users"> Users</Link></li>
                        <li><Link to="/assets"> Assets</Link></li>
                        <li><Link to="/assignments"> Assignments</Link></li>
                        <li><Link to="/acquisitions"> Acquisitions</Link></li>
                        <li><Link to="/reports"> Reports</Link></li>
                        <li><Link to="/locations"> Locations</Link></li>
                        <li><Link to="/profile"> Profile</Link></li>

                    </>
                ) : userRole === "user" ? (
                    <>
                        <li><Link to="/assets"> Assets</Link></li>
                        <li><Link to="/acquired-assets"> Acquired Assets</Link></li>
                        <li><Link to="/reports"> Reports</Link></li>
                        <li><Link to="/locations"> Locations</Link></li>
                        <li><Link to="/profile"> Profile</Link></li>
                    </>
                ) : (
                    <li> Caricamento...</li> // Mostra "Caricamento" se ancora non ha caricato
                )}
                <li>
                    <Link to="/" onClick={() => {
                        localStorage.clear();
                        window.location.href = "/";  // Forza il reload della pagina per aggiornare lo stato
                    }}> Logout</Link>
                </li>
            </ul>
        </nav>
    );
}

export default Navbar;





