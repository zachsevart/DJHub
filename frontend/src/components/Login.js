import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      const endpoint = isSignup ? 'signup' : 'login';
      const response = await axios.post(`http://127.0.0.1:8000/${endpoint}`, { email, password });
      if (isSignup) {
        alert('Signed up! Please log in.');
        setIsSignup(false);
      } else {
        const token = response.data.access_token;
        console.log('Login token:', token);
        localStorage.setItem('token', token);
        navigate('/upload');
      }
    } catch (error) {
      console.error('Signup/Login error:', error);
      const message = error.response?.data?.detail || error.message || 'Unknown error';
      alert(`Error: ${message} (Status: ${error.response?.status || 'N/A'})`);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4" style={{ width: '300px' }}>
        <h2 className="text-center">DJ Hub</h2>
        <input
          className="form-control mb-2"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="form-control mb-2"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="btn btn-primary mb-2" onClick={handleSubmit}>
          {isSignup ? 'Sign Up' : 'Log In'}
        </button>
        <button
          className="btn btn-link"
          onClick={() => setIsSignup(!isSignup)}
        >
          Switch to {isSignup ? 'Login' : 'Signup'}
        </button>
      </div>
    </div>
  );
}
export default Login;