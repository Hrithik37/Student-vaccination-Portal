import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate }      from 'react-router-dom';
import api                           from '../api/axiosConfig';
import '../App.css';
import './Dashboard.css';
import Topbar from '../components/TopBar';


export default function Dashboard() {
  const [metrics, setMetrics] = useState({
    total: 0,
    vaccinated: 0,
    percent: 0,
    upcoming: []
  });
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/reports/metrics')
      .then(res => setMetrics(res.data))
      .catch(console.error);
  }, []);

  const { total, vaccinated, percent, upcoming } = metrics;

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    navigate('/login');
  };

  return (
    <div className="container">
      <Topbar />
      <main className="main-content">
        <h1>Dashboard</h1>
        <div className="cards-container">
          <div className="card">
            <h3>Total Students</h3>
            <p>{total}</p>
          </div>
          <div className="card">
            <h3>Vaccinated Students</h3>
            <p>{vaccinated}</p>
          </div>
          <div className="card">
            <h3>Percent Vaccinated</h3>
            <p>{percent}%</p>
          </div>
          <div className="card">
            <h3>Upcoming Drives (30 days)</h3>
            {upcoming.length > 0 ? (
              <ul>
                {upcoming.map(d => (
                  <li key={d._id}>
                    {d.vaccineName} on{' '}
                    {new Date(d.date).toLocaleDateString()}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No upcoming drives</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
