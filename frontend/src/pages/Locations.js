import React, { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import "../style.css";
import { BsThreeDotsVertical } from "react-icons/bs";

const dummyLocations = [
    { id: 1, name: "Magazzino Centrale", address: "Via Roma 10" },
    { id: 2, name: "Ufficio Milano", address: "Corso Como 20" },
];

function Locations() {
    const [locations, setLocations] = useState(dummyLocations);
    const [menuOpen, setMenuOpen] = useState(null);
    const menuRefs = useRef({});

    useEffect(() => {
        function handleClickOutside(event) {
            if (menuOpen !== null && !menuRefs.current[menuOpen]?.contains(event.target)) {
                setMenuOpen(null);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuOpen]);

    const toggleMenu = (id) => {
        setMenuOpen(menuOpen === id ? null : id);
    };

    const handleAction = (action, id) => {
        alert(`Hai selezionato "${action}" per la location con ID ${id}`);
        setMenuOpen(null);
    };

    return (
        <>
            <Navbar />
            <div className="table-container">
                <h1>Gestione Locations</h1>
                <table className="styled-table">
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nome</th>
                        <th>Indirizzo</th>
                        <th>Azioni</th>
                    </tr>
                    </thead>
                    <tbody>
                    {locations.map((location) => (
                        <tr key={location.id}>
                            <td>{location.id}</td>
                            <td>{location.name}</td>
                            <td>{location.address}</td>
                            <td className="actions-column">
                                <div className="dropdown" ref={(el) => (menuRefs.current[location.id] = el)}>
                                    <BsThreeDotsVertical className="menu-icon" onClick={() => toggleMenu(location.id)} />
                                    {menuOpen === location.id && (
                                        <div className="dropdown-menu show">
                                            <p onClick={() => handleAction("Modifica", location.id)}>✏️ Modifica</p>
                                            <p onClick={() => handleAction("Rimuovi", location.id)}>🗑️ Rimuovi</p>
                                        </div>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}

export default Locations;

