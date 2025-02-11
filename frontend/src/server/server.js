import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const owners = [
    { id: 1, first_name: "Mario", last_name: "Rossi", phone_number: "1234567890" },
    { id: 2, first_name: "Luca", last_name: "Bianchi", phone_number: "0987654321" }
];

const assets = [
    { id: 1, name: "Laptop", description: "MacBook Pro 16”" },
    { id: 2, name: "Smartphone", description: "iPhone 14 Pro" }
];

// Endpoints finti per testing
app.get('/api/owners/', (req, res) => res.json(owners));
app.get('/api/assets/', (req, res) => res.json(assets));

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Mock API in esecuzione su http://localhost:${PORT}`);
});