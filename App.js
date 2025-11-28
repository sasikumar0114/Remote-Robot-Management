import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';  // Add this import
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Devices from './components/Devices';
import DeviceDetails from './components/DeviceDetails';
import Support from './components/Support';
import './styles.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Sidebar />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/devices" element={<Devices />} />
            <Route path="/device/:id" element={<DeviceDetails />} />
            <Route path="/support" element={<Support />} />
          </Routes>
          <ToastContainer />  {/* Add this for notifications */}
        </div>
      </div>
    </Router>
  );
}

export default App;