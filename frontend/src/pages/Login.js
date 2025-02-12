import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../style.css';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8001/api/token/', {
                username,
                password
            });

            // Salva i token nel localStorage
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);

            // Recupera i dati dell'utente
            const userResponse = await axios.get('http://localhost:8001/users/me/', {
                headers: { Authorization: `Bearer ${response.data.access}` }
            });

            // Salva il ruolo
            localStorage.setItem('user_role', userResponse.data.role); // "manager" o "user"

            // Reindirizza alla home dopo il login
            navigate('/home');
        } catch (err) {
            setError('Credenziali non valide');
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2>Login</h2>
                {error && <p className="error">{error}</p>}
                <form onSubmit={handleLogin}>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit">Accedi</button>
                </form>
            </div>
        </div>
    );
}

export default Login;



