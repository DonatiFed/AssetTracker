import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../style.css";

function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [emailError, setEmailError] = useState(null); // Specifico per l'email
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setEmailError(null); // Reset degli errori precedenti

        if (password.length < 8) {
            setError("La password deve avere almeno 8 caratteri.");
            return;
        }

        try {
            const response = await axios.post(
                "http://localhost:8001/api/register/",
                {
                    username,
                    email,
                    password,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.status === 201) {
                console.log("Registrazione riuscita:", response.data);
                navigate("/login");
            }
        } catch (err) {
            console.error("Errore durante la registrazione:", err);

            if (err.response) {
                console.log("Errore dettagliato:", err.response.data);
                const errorData = err.response.data;

                // Gestione specifica dell'email già esistente
                if (errorData.email) {
                    setEmailError(errorData.email[0]); // Mostra l'errore dell'email
                } else {
                    setError(errorData.detail || "Errore nella registrazione.");
                }
            } else {
                setError("Errore di connessione al server.");
            }
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2>Registrati</h2>
                <p>Crea un nuovo account</p>
                {error && <p className="error-message">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    {emailError && <p className="error-message">{emailError}</p>} {/* Errore email */}

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        minLength={8}
                        required
                    />
                    <button type="submit">Registrati</button>
                </form>
            </div>
        </div>
    );
}

export default Register;



