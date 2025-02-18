import React, {useState, useEffect} from "react";
import {BrowserRouter as Router, Routes, Route, Navigate} from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Assets from "./pages/Assets";
import Locations from "./pages/Locations";
import Reports from "./pages/Reports";
import AcquiredAssets from "./pages/AcquiredAssets";
import Acquisitions from "./pages/Acquisitions";
import Users from "./pages/Users";
import Profile from "./pages/Profile";
import Assignments from "./pages/Assignments";


function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(
        !!localStorage.getItem("access_token") // si controlla se il token è presente
    );

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        console.log("🔍 Controllo iniziale token:", token);
        setIsLoggedIn(!!token); // aggiorno lo stato in base al token
    }, []);
    useEffect(() => {
        console.log("🧩 Stato aggiornato: isLoggedIn =", isLoggedIn);
    }, [isLoggedIn]);

    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage/>}/>
                <Route path="/login" element={<Login onLogin={() => {
                    console.log("🔓 Login effettuato, aggiornamento stato...");
                    setIsLoggedIn(true);
                }}/>}/>
                <Route path="/register" element={<Register/>}/>
                <Route path="/home" element={isLoggedIn ? <Home/> : <Navigate to="/"/>}/>
                <Route path="/assets" element={isLoggedIn ? <Assets/> : <Navigate to="/"/>}/>
                <Route path="/acquired-assets" element={isLoggedIn ? <AcquiredAssets/> : <Navigate to="/"/>}/>
                <Route path="/acquisitions" element={isLoggedIn ? <Acquisitions/> : <Navigate to="/"/>}/>
                <Route path="/assignments" element={isLoggedIn ? <Assignments/> : <Navigate to="/"/>}/>
                <Route path="/locations" element={isLoggedIn ? <Locations/> : <Navigate to="/"/>}/>
                <Route path="/reports" element={isLoggedIn ? <Reports/> : <Navigate to="/"/>}/>
                <Route path="/users" element={isLoggedIn ? <Users/> : <Navigate to="/"/>}/>
                <Route path="/profile" element={isLoggedIn ? <Profile/> : <Navigate to="/"/>}/>

            </Routes>
        </Router>
    );
}

export default App;




