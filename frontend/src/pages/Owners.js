import React, { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import "../style.css";
import { BsThreeDotsVertical } from "react-icons/bs"; // Icona per il menu a tre puntini
import { fetchOwners } from "../server/api"; // Funzione API per il fetch dei dati
import AddItemModal from "../components/AddItemModal";

function Owners() {
    const [owners, setOwners] = useState([]);
    const [menuOpen, setMenuOpen] = useState(null);
    const [showModal, setShowModal] = useState(false); // Stato per il modal di aggiunta
    const menuRefs = useRef({});

    useEffect(() => {
        const loadOwners = async () => {
            const data = await fetchOwners();
            setOwners(data);
        };
        loadOwners();
    }, []);

    const toggleMenu = (id) => {
        setMenuOpen(menuOpen === id ? null : id);
    };

    const handleAction = (action, id) => {
        alert(`Hai selezionato "${action}" per l'owner con ID ${id}`);
        setMenuOpen(null);
    };

    const handleSave = async (newOwner) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/owners/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newOwner),
            });

            if (!response.ok) {
                throw new Error("Errore nell'aggiunta del proprietario");
            }

            const savedOwner = await response.json();
            setOwners([...owners, savedOwner]); // Aggiorna lo stato con il nuovo owner
            setShowModal(false);
        } catch (error) {
            console.error("Errore nel salvataggio:", error);
        }
    };

    return (
        <>
            <Navbar />
            <div className="table-container">
                <div className="table-header">
                    <h1>Gestione Proprietari</h1>
                    <button className="add-button" onClick={() => setShowModal(true)}>
                        ➕ Aggiungi Proprietario
                    </button>
                </div>
                <table className="styled-table">
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nome</th>
                        <th>Cognome</th>
                        <th>Telefono</th>
                        <th>Azioni</th>
                    </tr>
                    </thead>
                    <tbody>
                    {owners.map((owner) => (
                        <tr key={owner.id}>
                            <td>{owner.id}</td>
                            <td>{owner.first_name}</td>
                            <td>{owner.last_name}</td>
                            <td>{owner.phone_number}</td>
                            <td className="actions-column">
                                <div className="dropdown" ref={(el) => (menuRefs.current[owner.id] = el)}>
                                    <BsThreeDotsVertical className="menu-icon" onClick={() => toggleMenu(owner.id)} />
                                    {menuOpen === owner.id && (
                                        <div className="dropdown-menu show">
                                            <p onClick={() => handleAction("Modifica", owner.id)}>✏️ Modifica</p>
                                            <p onClick={() => handleAction("Rimuovi", owner.id)}>🗑️ Rimuovi</p>
                                        </div>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            <AddItemModal
                show={showModal}
                handleClose={() => setShowModal(false)}
                handleSave={handleSave}
                fields={[
                    { name: "first_name", label: "Nome" },
                    { name: "last_name", label: "Cognome" },
                    { name: "phone_number", label: "Numero di Telefono" },
                ]}
            />
        </>
    );
}

export default Owners;




