// src/components/Topbar.js
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import '../App.css';

export default function Topbar() {
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || 'User';

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    navigate('/login');
  };

  return (
    <div className="topbar">
      <div className="topbar-left">
      <span className="app-name">SCHOOL VACCINATION PORTAL</span>
        <div className="topbar-nav">
          <NavLink to="/" end className={({isActive})=>isActive?'active':''}>
            Dashboard
          </NavLink>
          <NavLink to="/students" className={({isActive})=>isActive?'active':''}>
            Students
          </NavLink>
          <NavLink to="/drives" className={({isActive})=>isActive?'active':''}>
            Drives
          </NavLink>
          <NavLink to="/reports" className={({isActive})=>isActive?'active':''}>
            Reports
          </NavLink>
        </div>
        </div>
        <div className="topbar-right">
          <span className="user-name">{localStorage.getItem('username')}</span>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
        </div>
      </div>

  );
}
