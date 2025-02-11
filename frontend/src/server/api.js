import axios from "axios";

const API_URL = process.env.REACT_APP_BACKEND_URL ;

console.log("Backend API URL:", API_URL); // Debug: Verifica se l'URL viene letto

export const fetchOwners = async () => {
    try {
        const response = await axios.get(`${API_URL}/owners/`);
        return response.data;
    } catch (error) {
        console.error("Errore nel recupero dei proprietari:", error);
        return [];
    }
};
export const fetchAssets = async () => {
    try {
        const response = await axios.get(`${API_URL}/assets/`);
        return response.data;
    } catch (error) {
        console.error("Errore nel recupero degli assets:", error);
        return [];
    }
};

export const fetchOwnerships = async () => {
    try {
        const response = await axios.get(`${API_URL}/ownerships/`);
        return response.data;
    } catch (error) {
        console.error("Errore nel recupero delle ownerships:", error);
        return [];
    }
};

export const addOwnership = async (ownershipData) => {
    try {
        const response = await axios.post(`${API_URL}/ownerships/`, ownershipData, {
            headers: { "Content-Type": "application/json" },
        });
        return response.data;
    } catch (error) {
        console.error("Errore nell'aggiunta della ownership:", error);
        throw error;
    }
};