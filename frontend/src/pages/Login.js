import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';
import '../style.css';
import {useEffect} from 'react';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    useEffect(() => {
        localStorage.clear();  // Pulisce tutti i dati salvati localmente
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8001/api/token/', {
                username,
                password
            });
            console.log("✅ Risposta API login:", response.data);
            localStorage.setItem("access_token", response.data.access);
            localStorage.setItem("refresh_token", response.data.refresh);

            // Salva i token nel localStorage
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
            localStorage.setItem('user_id', response.data.user_id);
            localStorage.setItem('user_role', response.data.role);


            // Recupera i dati dell'utente
            const userResponse = await axios.get('http://localhost:8001/users/me/', {
                headers: {Authorization: `Bearer ${response.data.access}`}
            });

            // Salva il ruolo
            localStorage.setItem('user_role', userResponse.data.role); // "manager" o "user"
            localStorage.setItem('user_id', userResponse.data.id);

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



