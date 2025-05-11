// src/pages/StudentForm.js
import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import api from '../api/axiosConfig';
import '../App.css';
import './StudentForm.css';
import Topbar from '../components/TopBar';

export default function StudentForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  // Student fields
  const [name, setName]                 = useState('');
  const [studentClass, setStudentClass] = useState('');     // e.g. "1A"
  const [dateOfBirth, setDateOfBirth]   = useState('');

  // Vaccination state
  const [vaccinations, setVaccinations]         = useState([]);
  const [drives, setDrives]                     = useState([]);
  const [availableDrives, setAvailableDrives]   = useState([]);
  const [selectedDrive, setSelectedDrive]       = useState('');
  const [vaccError, setVaccError]               = useState('');

  // 1) Load all drives
  useEffect(() => {
    api.get('/drives')
      .then(res => setDrives(res.data))
      .catch(console.error);
  }, []);

  // 2) If editing, load student + their vaccinations
  useEffect(() => {
    if (!isEdit) return;
    api.get(`/students/${id}`)
      .then(res => {
        const s = res.data;
        setName(s.name);
        setStudentClass(s.class);
        setDateOfBirth(s.dateOfBirth.split('T')[0]);
        setVaccinations(s.vaccinations || []);
      })
      .catch(console.error);
  }, [id, isEdit]);

  // 3) Compute drives the student **hasn't** received **and** are **applicable** to their class
  useEffect(() => {
    const received = vaccinations.map(v => v.vaccineName);
    const avail = drives.filter(d =>
      d.status === 'scheduled' &&
      !received.includes(d.vaccineName) &&
      d.applicableClasses.includes(studentClass)
    );
    setAvailableDrives(avail);
  }, [drives, vaccinations, studentClass]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  const handleSaveStudent = async e => {
    e.preventDefault();
    const payload = { name, class: studentClass, dateOfBirth };
    try {
      if (isEdit) await api.put(`/students/${id}`, payload);
      else        await api.post('/students', payload);
      navigate('/students');
    } catch {
      alert('Failed to save student');
    }
  };

  const handleVaccinate = async e => {
    e.preventDefault();
    if (!selectedDrive) {
      return setVaccError('Please select a drive');
    }
    try {
      const res = await api.post(
        `/drives/${selectedDrive}/vaccinate`,
        { studentId: id }
      );
      // Append new vaccination to state
      setVaccinations([
        ...vaccinations,
        {
          vaccineName: res.data.vaccineName,
          vaccinatedAt: res.data.vaccinatedAt
        }
      ]);
      setSelectedDrive('');
      setVaccError('');
    } catch (err) {
      setVaccError(err.response?.data?.message || 'Vaccination failed');
    }
  };

  return (
    <div className="container">
      <Topbar />
      <main className="main-content">
        <h1>{isEdit ? 'Edit Student' : 'Add Student'}</h1>

        <form onSubmit={handleSaveStudent} className="form-box">
          <div className="form-group">
            <label>Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Class</label>
            <input
              value={studentClass}
              onChange={e => setStudentClass(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Date of Birth</label>
            <input
              type="date"
              value={dateOfBirth}
              onChange={e => setDateOfBirth(e.target.value)}
              required
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="button">
              {isEdit ? 'Update Student' : 'Create Student'}
            </button>
          </div>
        </form>

        {isEdit && (
          <div className="form-box" style={{ marginTop: '30px' }}>
            <h2>Vaccination Records</h2>

            {/* Show past vaccinations */}
            {vaccinations.length > 0 && (
              <ul style={{ marginBottom: '20px' }}>
                {vaccinations.map((v, i) => (
                  <li key={i}>
                    {v.vaccineName} – {new Date(v.vaccinatedAt).toLocaleDateString()}
                  </li>
                ))}
              </ul>
            )}

            {/* If there are drives left for this class & not yet given */}
            {availableDrives.length > 0 ? (
              <form onSubmit={handleVaccinate}>
                {vaccError && (
                  <p style={{ color: '#d9534f' }}>{vaccError}</p>
                )}
                <div className="form-group">
                  <label>Select Drive</label>
                  <select
                    value={selectedDrive}
                    onChange={e => setSelectedDrive(e.target.value)}
                    required
                  >
                    <option value="">-- Select --</option>
                    {availableDrives.map(d => (
                      <option key={d._id} value={d._id}>
                        {d.vaccineName} on {new Date(d.date).toLocaleDateString()}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-actions">
                  <button type="submit" className="button">
                    Add Vaccination
                  </button>
                </div>
              </form>
            ) : (
              <p style={{ color: 'var(--text-secondary)' }}>
                No more drives available for class {studentClass}.
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
