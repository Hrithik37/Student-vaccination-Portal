import React, { useEffect, useState, useRef } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import '../App.css';
import './StudentList.css';
import Topbar from '../components/TopBar';

export default function StudentList() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [filters, setFilters] = useState({ name: '', class: '', id: '', status: 'all' });
  const fileInputRef = useRef();

  // Fetch with current filters
  const fetchStudents = () => {
    const params = {};
    if (filters.name)  params.name = filters.name;
    if (filters.class) params.class = filters.class;
    if (filters.id)    params.id = filters.id;
    if (filters.status !== 'all') params.status = filters.status;

    api.get('/students', { params })
      .then(res => setStudents(res.data))
      .catch(console.error);
  };

  useEffect(fetchStudents, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  const handleUpload = async e => {
    e.preventDefault();
    const file = fileInputRef.current.files[0];
    if (!file) return alert('Please select a CSV file.');
    const form = new FormData();
    form.append('file', file);

    try {
      await api.post('/students/bulk', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fileInputRef.current.value = null;
      fetchStudents();
    } catch {
      alert('Upload failed.');
    }
  };

  const handleFilterChange = e => {
    const { name, value } = e.target;
    setFilters(f => ({ ...f, [name]: value }));
  };

  const handleFilterSubmit = e => {
    e.preventDefault();
    fetchStudents();
  };

  return (
    <div className="container">
      <Topbar />
      <main className="main-content">
        <h1>Manage Students</h1>

        <div style={{ marginBottom: '20px' }}>
          <Link to="/students/new" className="button">+ Add New Student</Link>
        </div>

        <form onSubmit={handleUpload} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <input type="file" accept=".csv" ref={fileInputRef} />
          <button type="submit" className="button">Upload CSV</button>
        </form>

        <form
          onSubmit={handleFilterSubmit}
          className="form-box"
          style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}
        >
          <div className="form-group">
            <label>Name</label>
            <input name="name" value={filters.name} onChange={handleFilterChange} />
          </div>
          <div className="form-group">
            <label>Class</label>
            <input name="class" value={filters.class} onChange={handleFilterChange} />
          </div>
          <div className="form-group">
            <label>ID</label>
            <input name="id" value={filters.id} onChange={handleFilterChange} />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select name="status" value={filters.status} onChange={handleFilterChange}>
              <option value="all">All</option>
              <option value="vaccinated">Vaccinated</option>
              <option value="unvaccinated">Unvaccinated</option>
            </select>
          </div>
          <div className="form-actions">
            <button type="submit" className="button">Apply Filters</button>
          </div>
        </form>

        <table className="table">
          <thead>
            <tr>
              {/* <th>ID</th> */}
              <th>Name</th>
              <th>Class</th>
              <th>DOB</th>
              <th>Vaccinated</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {students.map(s => (
              <tr key={s._id}>
                {/* <td>{s._id}</td> */}
                <td>{s.name}</td>
                <td>{s.class}</td>
                <td>{new Date(s.dateOfBirth).toLocaleDateString()}</td>
                <td>{s.vaccinated ? 'Yes' : 'No'}</td>
                <td>
                  <Link to={`/students/${s._id}`} className="button">Edit</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
}
