import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Assets from "./pages/Assets";
import Locations from "./pages/Locations";
import Owners from "./pages/Owners";
import Ownerships from "./pages/Ownerships";
import Reports from "./pages/Reports";

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(
        !!localStorage.getItem("access_token") // Controlla se il token è presente
    );

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        setIsLoggedIn(!!token); // Aggiorna lo stato in base al token
    }, []);

    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login onLogin={() => setIsLoggedIn(true)} />} />
                <Route path="/register" element={<Register />} />
                <Route path="/home" element={isLoggedIn ? <Home /> : <Navigate to="/" />} />
                <Route path="/assets" element={isLoggedIn ? <Assets /> : <Navigate to="/" />} />
                <Route path="/locations" element={isLoggedIn ? <Locations /> : <Navigate to="/" />} />
                <Route path="/owners" element={isLoggedIn ? <Owners /> : <Navigate to="/" />} />
                <Route path="/ownerships" element={isLoggedIn ? <Ownerships /> : <Navigate to="/" />} />
                <Route path="/reports" element={isLoggedIn ? <Reports /> : <Navigate to="/" />} />
            </Routes>
        </Router>
    );
}

export default App;




