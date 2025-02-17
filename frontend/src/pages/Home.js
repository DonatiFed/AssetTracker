import React from "react";
import Navbar from "../components/Navbar";
import UserInfo from "../components/UserInfo";
import "../style.css";

function Home() {
    return (
        <>
            <Navbar/>
            <UserInfo/>
            <div className="home-container">
                <h1>Benvenuto in AssetTracker</h1>
                <p>Gestisci i tuoi asset in modo semplice ed efficiente.</p>
            </div>
        </>
    );
}

export default Home;


