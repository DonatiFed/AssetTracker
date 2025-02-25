import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import "../style.css";

function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [emailError, setEmailError] = useState(null);
    const navigate = useNavigate();
    const API_URL = process.env.REACT_APP_BACKEND_URL;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setEmailError(null);

        if (password.length < 8) {
            setError("La password deve avere almeno 8 caratteri.");
            return;
        }

        const data = {
            username,
            email,
            password
        };

        try {
            const response = await axios.post(`${API_URL}/register/`, data, {
                headers: {"Content-Type": "application/json"},
            });

            if (response.status === 201) {
                localStorage.setItem("access_token", response.data.access);
                localStorage.setItem("refresh_token", response.data.refresh);
                localStorage.setItem("user_id", response.data.id);
                localStorage.setItem("role", response.data.role);

                navigate("/home");
            }
        } catch (err) {
            console.error("Errore durante la registrazione:", err.response?.data || err.message);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2>Registrati</h2>
                <p>Crea un nuovo account</p>
                {error && <p className="error-message">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <input type="text" placeholder="Username" value={username}
                           onChange={(e) => setUsername(e.target.value)} required/>
                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
                           required/>
                    {emailError && <p className="error-message">{emailError}</p>}
                    <input type="password" placeholder="Password" value={password}
                           onChange={(e) => setPassword(e.target.value)} minLength={8} required/>
                    <button type="submit">Registrati</button>
                </form>
            </div>
        </div>
    );
}

export default Register;




