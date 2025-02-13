import React from "react";
import { useNavigate } from "react-router-dom";
import "../style.css";

function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="login-container">
            <div className="login-box">
                <h2>Benvenuto</h2>
                <p>Scegli un'opzione per continuare</p>
                <button onClick={() => navigate("/login")}>Accedi</button>
                <button onClick={() => navigate("/register")} className="secondary-btn">Registrati</button>
            </div>
        </div>
    );
}

export default LandingPage;
