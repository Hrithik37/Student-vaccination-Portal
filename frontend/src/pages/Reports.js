import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import '../App.css';
import './Reports.css';
import Topbar from '../components/TopBar';

export default function Reports() {
  // const navigate = useNavigate();
  const [vaccineName, setVaccineName] = useState('');
  const [records, setRecords] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [filterName, setFilterName] = useState('');
  const [total, setTotal] = useState(0);
  
useEffect(() => {
  const fetchRecords = async () => {
    const params = { page, limit };
    if (vaccineName) params.vaccineName = vaccineName;
    const res = await api.get('/reports/records', { params });
    setRecords(res.data.data);
    setTotal(res.data.total);
  };
  fetchRecords();
}, [page, vaccineName, limit]);


  const downloadFile = async (type, filename, mime) => {
    try {
      const token = localStorage.getItem('authToken');
      const params = new URLSearchParams({ type });
      if (vaccineName) params.append('vaccineName', vaccineName);

      const res = await fetch(`http://localhost:5000/api/reports/records/export?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`Server responded ${res.status}`);

      const blob = await res.blob();
      const url = window.URL.createObjectURL(new Blob([blob], { type: mime }));
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed', err);
      alert('Download failed: ' + err.message);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="container">
      <Topbar />
      <main className="main-content">
        <h1>Vaccination Report</h1>

        <form onSubmit={e => { e.preventDefault(); setPage(1); setVaccineName(filterName);}} className="form-box">
          <div className="form-group">
            <label>Vaccine Name</label>
            <input
              value={filterName}
              onChange={e => setFilterName(e.target.value)}
              placeholder="Filter by vaccine name"
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="button">Generate Report</button>
          </div>
        </form>

        <div className="form-actions" style={{ gap: '10px', marginBottom: '20px' }}>
          <button
            className="button"
            onClick={() => downloadFile('csv', 'report.csv', 'text/csv')}
          >
            Export CSV
          </button>
          <button
            className="button"
            onClick={() => downloadFile(
              'excel',
              'report.xlsx',
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )}
          >
            Export Excel
          </button>
          <button
            className="button"
            onClick={() => downloadFile('pdf', 'report.pdf', 'application/pdf')}
          >
            Export PDF
          </button>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Name</th><th>Class</th><th>DOB</th><th>Vaccinated</th><th>Vaccinated At</th><th>Vaccine Name</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r,i) => (
              <tr key={i}>
                <td>{r.name}</td>
                <td>{r.class}</td>
                <td>{new Date(r.dateOfBirth).toLocaleDateString()}</td>
                <td>{r.vaccinated ? 'Yes' : 'No'}</td>
                <td>{r.vaccinatedAt ? new Date(r.vaccinatedAt).toLocaleDateString() : ''}</td>
                <td>{r.vaccineName || ''}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="form-actions" style={{ justifyContent: 'center', marginTop: '20px' }}>
          <button
            className="button"
            onClick={() => setPage(p => Math.max(p - 1, 1))}
            disabled={page <= 1}
          >
            Previous
          </button>
          <span style={{ alignSelf: 'center', margin: '0 10px' }}>
            Page {page} of {totalPages}
          </span>
          <button
            className="button"
            onClick={() => setPage(p => Math.min(p + 1, totalPages))}
            disabled={page >= totalPages}
          >
            Next
          </button>
        </div>
      </main>
    </div>
  )}