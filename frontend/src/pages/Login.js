import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const navigate                = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/auth/login', { username, password });
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('username', username);
      navigate('/');
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Login failed. Check your credentials.'
      );
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.heading}> School Vaccination Portal</h2>
        <h3 style={styles.heading}>Sign In</h3>

        {error && <div style={styles.error}>{error}</div>}

        <label style={styles.label}>
          Username
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            style={styles.input}
            placeholder="Enter your username"
          />
        </label>

        <label style={styles.label}>
          Password
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={styles.input}
            placeholder="••••••••"
          />
        </label>

        <button type="submit" style={styles.button}>
          Login
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    display:           'flex',
    justifyContent:    'center',
    alignItems:        'center',
    height:            '100vh',
    backgroundColor:   '#f0f2f5',
  },
  form: {
    width:             320,
    padding:           24,
    borderRadius:      8,
    backgroundColor:   '#ffffff',
    boxShadow:         '0 4px 12px rgba(0,0,0,0.1)',
    display:           'flex',
    flexDirection:     'column',
  },
  heading: {
    marginBottom:      20,
    textAlign:         'center',
    color:             '#333',
  },
  label: {
    marginBottom:      12,
    fontSize:          14,
    color:             '#555',
    display:           'flex',
    flexDirection:     'column',
  },
  input: {
    marginTop:         6,
    padding:           '8px 10px',
    fontSize:          14,
    borderRadius:      4,
    border:            '1px solid #ccc',
    outline:           'none',
  },
  button: {
    marginTop:         16,
    padding:           '10px 0',
    fontSize:          16,
    borderRadius:      4,
    border:            'none',
    cursor:            'pointer',
    backgroundColor:   '#007bff',
    color:             '#fff',
    transition:        'background-color 0.2s',
  },
  error: {
    marginBottom:      12,
    color:             '#d9534f',
    fontSize:          14,
    textAlign:         'center',
  },
};
