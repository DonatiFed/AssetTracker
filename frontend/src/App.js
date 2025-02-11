import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Assets from "./pages/Assets";
import Locations from "./pages/Locations";
import Owners from "./pages/Owners";
import Ownerships from "./pages/Ownerships";
import Reports from "./pages/Reports";

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    return (
        <Router>
            <Routes>
                <Route path="/" element={isLoggedIn ? <Home /> : <Login onLogin={() => setIsLoggedIn(true)} />} />
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


