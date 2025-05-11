// src/App.js
import React from 'react';                              // ← ensure React is in scope
import { BrowserRouter, Routes, Route } from 'react-router-dom';  
import PrivateRoute from './components/PrivateRoute';    // ← import your PrivateRoute
import Login       from './pages/Login';
import Dashboard   from './pages/Dashboard';
import StudentList from './pages/StudentList';
import StudentForm from './pages/StudentForm';
import DriveList   from './pages/DriveList';
import DriveForm   from './pages/DriveForm';
import Reports     from './pages/Reports';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* All protected routes go here */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/students"
          element={
            <PrivateRoute>
              <StudentList />
            </PrivateRoute>
          }
        />
        <Route
          path="/students/new"
          element={
            <PrivateRoute>
              <StudentForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/students/:id"
          element={
            <PrivateRoute>
              <StudentForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/drives"
          element={
            <PrivateRoute>
              <DriveList />
            </PrivateRoute>
          }
        />
        <Route
          path="/drives/new"
          element={
            <PrivateRoute>
              <DriveForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/drives/:id"
          element={
            <PrivateRoute>
              <DriveForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <PrivateRoute>
              <Reports />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
