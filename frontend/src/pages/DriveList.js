import React, { useEffect, useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import api                            from '../api/axiosConfig';
import '../App.css';
import './DriveList.css';
import Topbar from '../components/TopBar';
export default function DriveList() {
  const [drives, setDrives] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/drives')
      .then(res => setDrives(res.data))
      .catch(console.error);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  return (
    <div className="container">
      <Topbar />
      <main className="main-content">
        <h1>Manage Drives</h1>
        <div style={{ marginBottom: '20px' }}>
          <Link to="/drives/new" className="button">
            + Schedule Drive
          </Link>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Vaccine</th>
              <th>Date</th>
              <th>Doses</th>
              <th>Classes</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {drives.map(d => (
              <tr key={d._id}>
                <td>{d.vaccineName}</td>
                <td>{new Date(d.date).toLocaleDateString()}</td>
                <td>{d.dosesAvailable}</td>
                <td>{d.applicableClasses.join(', ')}</td>
                <td>
                  {d.status === 'expired'
                    ? <span className="text-secondary">Expired</span>
                    : d.status
                  }
                </td>
                <td>
                  {d.status === 'scheduled' ? (
                    <Link to={`/drives/${d._id}`} className="button">
                      Edit
                    </Link>
                  ) : (
                    <button className="button" disabled>
                      {d.status === 'completed' ? 'Completed' : 'Expired'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
}
