import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Solifound from './pages/Solifound';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Profile from './pages/Profile';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow pt-16">
          <Routes>
            <Route path="/solifound" element={<><Navbar /><Solifound /></>} />
            <Route path="/login" element={<><Navbar /><Login /></>} />
            <Route path="/registro" element={<><Navbar /><Registro /></>} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/" element={<Navigate to="/solifound\" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;