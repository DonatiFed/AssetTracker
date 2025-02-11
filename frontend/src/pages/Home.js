import React from "react";
import Navbar from "../components/Navbar";
import "../style.css";

function Home() {
    return (
        <>
            <Navbar />
            <div className="home-container">
                <h1>Benvenuto in AssetTracker</h1>
                <p>Gestisci i tuoi asset in modo semplice ed efficiente.</p>
            </div>
        </>
    );
}

export default Home;


