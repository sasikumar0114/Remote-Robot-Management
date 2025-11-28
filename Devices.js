import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from './Card';
import Button from './Button';
import { FaSearch, FaCheckCircle, FaTimesCircle, FaBatteryHalf } from 'react-icons/fa';
import '../styles/devices.css';
import { getAllDevices, ensureDBSeeded } from '../deviceDB';

const statusIcon = (status) =>
  status === 'connected'
    ? <FaCheckCircle className="status-connected" style={{ animation: 'pulse 1s infinite alternate' }} />
    : <FaTimesCircle className="status-not-connected" style={{ animation: 'shake 0.5s infinite alternate' }} />;

const batteryBar = (battery) => (
  <div className="battery-bar">
    <div
      className="battery-bar-inner"
      style={{
        width: `${battery}%`,
        background: battery > 50 ? '#00FFCC' : '#FF4D6D',
      }}
    />
  </div>
);

const Devices = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchDevices = async () => {
    setLoading(true);
    await ensureDBSeeded();
    const dbDevices = await getAllDevices();
    setDevices(dbDevices);
    setLoading(false);
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const filteredDevices = devices.filter(d =>
    d.name?.toLowerCase().includes(search.toLowerCase()) &&
    (filterStatus === 'all' || d.status === filterStatus)
  );

  return (
    <div>
      <h1>Devices</h1>
      <div className="search-bar">
        <FaSearch />
        <input
          type="text"
          placeholder="Search devices..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="device-filter-select"
        >
          <option value="all">All</option>
          <option value="connected">Connected</option>
          <option value="not connected">Not Connected</option>
        </select>
        <Button onClick={fetchDevices} disabled={loading}>Refresh</Button>
      </div>
      {loading && (
        <div style={{ textAlign: 'center', margin: '20px 0' }}>
          <div className="spinner" />
          <p>Loading...</p>
        </div>
      )}
      <div className="device-grid">
        {filteredDevices.map(device => (
          <Link to={`/device/${device.id}`} key={device.id} style={{ textDecoration: 'none' }}>
            <Card title={
              <span className="device-card-title">
                {statusIcon(device.status)}
                <span style={{ color: '#F5F6FA', fontWeight: 600 }}>{device.name}</span>
              </span>
            } footer={
              <span>
                Status: <span style={{ color: device.status === 'connected' ? '#00FF88' : '#FF5252', fontWeight: 500 }}>{device.status === 'connected' ? 'Connected' : 'Not Connected'}</span>
              </span>
            }>
              <div className="device-card-battery">
                <span style={{ color: '#F5F6FA', fontWeight: 500 }}><FaBatteryHalf /> Battery:</span> <span style={{ color: device.battery > 50 ? '#00FFCC' : '#FF4D6D', fontWeight: 500 }}>{device.battery}%</span>
                {batteryBar(device.battery)}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', alignItems: 'center', marginTop: '10px', marginBottom: '2px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#F5F6FA', fontWeight: 500 }}>
                  <span role="img" aria-label="cycles" style={{ fontSize: '1.1em' }}>🔄</span> Cycles: {device.cycles}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#F5F6FA', fontWeight: 500 }}>
                  <span role="img" aria-label="paths" style={{ fontSize: '1.1em' }}>🗺️</span> Paths: {device.loggedPaths}
                </div>
              </div>
              <div style={{ borderTop: '1px solid #23263a', margin: '8px 0 0 0' }} />
            </Card>
          </Link>
        ))}
      </div>
      {/* ...existing code... */}
    </div>
  );
};

export default Devices;