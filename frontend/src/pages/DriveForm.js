import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import api from '../api/axiosConfig';
import '../App.css';
import './DriveForm.css';
import Topbar from '../components/TopBar';

export default function DriveForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [vaccineName, setVaccineName]       = useState('');
  const [date, setDate]                     = useState('');
  const [dosesAvailable, setDosesAvailable] = useState('');
  const [applicableClasses, setAppClasses]  = useState('');

  useEffect(() => {
    if (isEdit) {
      api.get(`/drives/${id}`)
        .then(res => {
          const d = res.data;
          setVaccineName(d.vaccineName);
          setDate(d.date.split('T')[0]);
          setDosesAvailable(d.dosesAvailable);
          setAppClasses(d.applicableClasses.join(', '));
        })
        .catch(console.error);
    }
  }, [id, isEdit]);

  const handleSubmit = async e => {
    e.preventDefault();
    const payload = {
      vaccineName,
      date,
      dosesAvailable: Number(dosesAvailable),
      applicableClasses: applicableClasses.split(',').map(s => s.trim())
    };
    try {
      if (isEdit) await api.put(`/drives/${id}`, payload);
      else        await api.post('/drives', payload);
      navigate('/drives');
    } catch {
      alert('Vaccination drive conflict');
    }
  };

  return (
    <div className="container">
      <Topbar />

      <main className="main-content">
        <h1>{isEdit ? 'Edit Drive' : 'Schedule Drive'}</h1>
        <form onSubmit={handleSubmit} className="form-box">
          <div className="form-group">
            <label>Vaccine Name</label>
            <input value={vaccineName} onChange={e => setVaccineName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Doses Available</label>
            <input
              type="number"
              value={dosesAvailable}
              onChange={e => setDosesAvailable(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Applicable Classes (comma-separated)</label>
            <input
              value={applicableClasses}
              onChange={e => setAppClasses(e.target.value)}
              placeholder="e.g. 1A, 2B"
              required
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="button">
              {isEdit ? 'Update Drive' : 'Create Drive'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )}