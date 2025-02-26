import React, {useEffect} from "react";
import {useNavigate} from "react-router-dom";
import "../style.css";


function LandingPage() {
    const navigate = useNavigate();
    console.log("API URL in React:", process.env.REACT_APP_BACKEND_URL);


    return (
        <div className="login-container">
            <div className="login-box">
                <h2>Benvenuto in </h2>
                <h1>Asset Tracker</h1>
                <p>Scegli un'opzione per continuare</p>
                <button onClick={() => navigate("/login")}>Accedi</button>
                <button onClick={() => navigate("/register")} className="secondary-btn">Registrati</button>
            </div>
        </div>
    );
}

export default LandingPage;
