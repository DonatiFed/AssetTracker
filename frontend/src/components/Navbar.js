import React from "react";
import { Link } from "react-router-dom";
import "../style.css";

function Navbar() {
    return (
        <nav className="navbar">
            <ul>
                <li><Link to="/">🏠 Home</Link></li>
                <li><Link to="/assets">📦 Assets</Link></li>
                <li><Link to="/locations">📍 Locations</Link></li>
                <li><Link to="/owners">👤 Owners</Link></li>
                <li><Link to="/ownerships">🔗 Ownerships</Link></li>
                <li><Link to="/reports">📊 Reports</Link></li>
            </ul>
        </nav>
    );
}

export default Navbar;


