import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style.css";

function Login({ onLogin }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (username && password) {
            onLogin();
            navigate("/home");
        } else {
            alert("Inserisci username e password");
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2>Benvenuto</h2>
                <p>Accedi al tuo account per continuare</p>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit">Accedi</button>
                </form>
            </div>
        </div>
    );
}

export default Login;


