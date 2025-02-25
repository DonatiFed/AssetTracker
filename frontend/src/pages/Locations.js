import React, {useState, useEffect} from "react";
import Navbar from "../components/Navbar";
import AddItemModal from "../components/AddItemModal";
import EditItemModal from "../components/EditItemModal";
import UserInfo from "../components/UserInfo";
import "../style.css";
import {BsThreeDotsVertical} from "react-icons/bs";
import axios from "axios";

function Locations() {
    const [locations, setLocations] = useState([]);
    const [menuOpen, setMenuOpen] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [role, setRole] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("access_token");
                const headers = {Authorization: `Bearer ${token}`};
                const API_URL = process.env.REACT_APP_BACKEND_URL;
                const userRole = localStorage.getItem("user_role");
                setRole(userRole);

                const response = await axios.get(`${API_URL}/locations/`, {headers});
                setLocations(response.data);
            } catch (error) {
                console.error("Errore nel recupero delle locations:", error);
            }
        };
        fetchData();
    }, []);

    const toggleMenu = (id) => setMenuOpen(menuOpen === id ? null : id);

    const handleAddLocation = async (data) => {
        try {
            const token = localStorage.getItem("access_token");
            const API_URL = process.env.REACT_APP_BACKEND_URL;
            const headers = {Authorization: `Bearer ${token}`};
            const response = await axios.post(`${API_URL}/locations/`, data, {headers});
            setLocations([...locations, response.data]);
            setShowAddModal(false);
        } catch (error) {
            console.error("Errore durante l'aggiunta della location:", error);
        }
    };

    const handleEditLocation = async (id, data) => {
        const formattedData = {
            name: data.name,
            address: data.address,
            description: data.description,
        };
        try {
            const token = localStorage.getItem("access_token");
            const API_URL = process.env.REACT_APP_BACKEND_URL;
            const headers = {Authorization: `Bearer ${token}`};
            const response = await axios.put(`${API_URL}/locations/${id}/`, formattedData, {headers});
            setLocations(locations.map(loc => (loc.id === id ? response.data : loc)));
            setShowEditModal(false);
        } catch (error) {
            console.error("Errore durante la modifica della location:", error.response ? error.response.data : error);
        }
    };
    const handleRemoveLocation = async (id) => {
        try {
            const token = localStorage.getItem("access_token");
            const API_URL = process.env.REACT_APP_BACKEND_URL;
            const headers = {Authorization: `Bearer ${token}`};
            await axios.delete(`${API_URL}/locations/${id}/`, {headers});
            setLocations(locations.filter(loc => loc.id !== id));
        } catch (error) {
            console.error("Errore durante la rimozione della location:", error);
        }
    };

    return (
        <>
            <Navbar/>
            <div className="content-container">
                <UserInfo/>
                <div className="table-container">
                    <div className="table-header">
                        <h1>Gestione Locations</h1>
                        {role === "manager" && (
                            <button className="add-button" onClick={() => setShowAddModal(true)}>➕ Aggiungi
                                Location</button>
                        )}
                    </div>
                    <table className="styled-table">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nome</th>
                            <th>Indirizzo</th>
                            <th>Descrizione</th>
                            {role === "manager" && <th>Azioni</th>}
                        </tr>
                        </thead>
                        <tbody>
                        {locations.map((location) => (
                            <tr key={location.id}>
                                <td>{location.id}</td>
                                <td>{location.name}</td>
                                <td>{location.address}</td>
                                <td>{location.description}</td>
                                {role === "manager" && (
                                    <td className="actions-column">
                                        <BsThreeDotsVertical className="menu-icon"
                                                             onClick={() => toggleMenu(location.id)}/>
                                        {menuOpen === location.id && (
                                            <div className="dropdown-menu show">
                                                <p onClick={() => {
                                                    setSelectedLocation(location);
                                                    setShowEditModal(true);
                                                }}> Modifica</p>
                                                <p onClick={() => handleRemoveLocation(location.id)}> Rimuovi</p>
                                            </div>
                                        )}
                                    </td>
                                )}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {showAddModal && role === "manager" && (
                <AddItemModal
                    show={showAddModal}
                    handleClose={() => setShowAddModal(false)}
                    handleSave={handleAddLocation}
                    fields={[
                        {name: "name", label: "Nome", type: "text"},
                        {name: "address", label: "Indirizzo", type: "text"},
                        {name: "description", label: "Descrizione", type: "textarea"}
                    ]}
                />
            )}

            {showEditModal && (
                <EditItemModal
                    show={showEditModal}
                    handleClose={() => setShowEditModal(false)}
                    handleSave={(data) => handleEditLocation(selectedLocation.id, data)}
                    initialData={selectedLocation}
                    fields={[
                        {name: "name", label: "Nome", type: "text"},
                        {name: "address", label: "Indirizzo", type: "text"},
                        {name: "description", label: "Descrizione", type: "textarea"}
                    ]}
                />
            )}
        </>
    );
}

export default Locations;


