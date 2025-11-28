import React from 'react';
import { useDeviceData } from '../hooks/useDeviceData';
import Card from './Card';
import Chart from './Chart';
import Button from './Button';

const Dashboard = () => {
  const { devices, loading, refreshData } = useDeviceData();
  const connectedDevices = devices.filter(d => d.status === 'connected');
  const totalCycles = connectedDevices.reduce((sum, d) => sum + d.cycles, 0);

  const chartData = {
    labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4'],
    datasets: [{
      label: 'Total Cycles',
      data: connectedDevices.map(d => d.cycles).slice(0, 4),  // Simplified
      borderColor: '#00BFA5',
      backgroundColor: 'rgba(0, 191, 165, 0.2)',
    }]
  };

  return (
    <div className="dashboard-dark-bg" style={{ minHeight: '100vh', background: '#181A20', fontFamily: 'Inter, Roboto, Arial, sans-serif', color: '#F5F6FA', padding: 0 }}>
      {/* Dashboard Header - Simple Title Only */}
      <div className="dashboard-header" style={{
        display: 'flex', alignItems: 'center', background: '#23242A', color: '#fff', padding: '20px 40px', borderRadius: '0 0 18px 18px', boxShadow: '0 2px 12px rgba(0,191,165,0.08)', fontSize: '1.25rem', fontWeight: 600, marginBottom: '36px', letterSpacing: '0.02em', justifyContent: 'flex-start', gap: '18px'
      }}>
        <span style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ display: 'inline-block', width: '28px', height: '28px', background: '#00BFA5', borderRadius: '50%', marginRight: '8px', boxShadow: '0 1px 6px rgba(0,191,165,0.18)' }}>
            <svg width="18" height="18" viewBox="0 0 18 18" style={{ margin: '5px' }}><circle cx="9" cy="9" r="7" fill="#181A20" /><rect x="7" y="4" width="4" height="8" rx="2" fill="#00BFA5" /></svg>
          </span>
          Robot Monitoring System
        </span>
      </div>
      {/* ...existing dashboard content... */}
      <div style={{ padding: '0 40px' }}>
        <Button onClick={refreshData} disabled={loading} style={{ marginBottom: '18px', background: '#00BFA5', color: '#fff', fontWeight: 500, borderRadius: '6px', fontSize: '1rem', boxShadow: '0 1px 4px rgba(0,191,165,0.10)' }}>Refresh Data</Button>
        {loading && <p style={{ color: '#FFB300', fontWeight: 500 }}>Loading...</p>}
        <Card title="Connected Devices Activity">
          <p>Total Connected: <span className="status-connected" style={{ color: '#00BFA5', fontWeight: 600 }}>{connectedDevices.length}</span></p>
          <p>Total Cycles: <span style={{ color: '#00BFA5', fontWeight: 600 }}>{totalCycles}</span></p>
          <Chart data={chartData} title="Cycle Trends" />
        </Card>
        {connectedDevices.length === 0 && <Card title="Alert">No devices connected. Check status.</Card>}
      </div>
    </div>
  );
};

export default Dashboard;