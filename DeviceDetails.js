import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getDevice, updateDevice } from '../deviceDB';
import Card from './Card';
import Button from './Button';
import Chart from './Chart';
import { toast } from 'react-toastify';
import { FaPlay, FaSync, FaEye, FaBatteryHalf, FaArrowUp, FaArrowDown, FaArrowLeft, FaArrowRight, FaStop } from 'react-icons/fa';
import '../styles/deviceDetails.css';

const CHART_LABELS = {
  resource: ['Boot', '1h', '2h', '3h', 'Now'],
  battery: ['0h', '1h', '2h', '3h', '4h', '5h']
};

const DeviceDetails = () => {
  const { id } = useParams();
  const [device, setDevice] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [logsOpen, setLogsOpen] = useState(false);
  const [drivingStatus, setDrivingStatus] = useState('Idle');
  const [deviceLogs, setDeviceLogs] = useState([]);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const dev = await getDevice(Number(id));
        if (isMounted) setDevice(dev);
        const logs = JSON.parse(localStorage.getItem(`deviceLogs_${id}`) || '[]');
        if (isMounted) setDeviceLogs(logs);
      } catch (err) {
        toast.error('Failed to fetch device data.');
      }
    })();
    return () => { isMounted = false; };
  }, [id]);

  const memoryHistory = device?.memoryHistory;
  const diskHistory = device?.diskHistory;
  const batteryHistory = device?.batteryHistory;
  const resourceChart = memoryHistory && diskHistory ? {
    labels: CHART_LABELS.resource,
    datasets: [
      { label: 'Memory Used (MB)', data: memoryHistory, borderColor: '#FFB300' },
      { label: 'Disk Space Used (GB)', data: diskHistory, borderColor: '#1976D2' }
    ]
  } : null;
  const batteryChart = batteryHistory ? {
    labels: CHART_LABELS.battery,
    datasets: [{ label: 'Battery %', data: batteryHistory, borderColor: '#00FFCC' }]
  } : null;

  if (!device) return <Card title="Error">Device not found.</Card>;

  const addLog = (message) => {
    const logs = JSON.parse(localStorage.getItem(`deviceLogs_${id}`) || '[]');
    const newLog = `${new Date().toISOString()} - ${message}`;
    logs.unshift(newLog);
    localStorage.setItem(`deviceLogs_${id}`, JSON.stringify(logs));
    setDeviceLogs(logs);
  };

  const handleAction = async (action) => {
    toast.success(`${action} initiated for ${device.name}!`);
    addLog(`Action performed: ${action}`);
    if (action === 'Update') {
      setDrivingStatus('Updating...');
      setTimeout(async () => {
        try {
          const oldFirmware = device.firmware || 'v2.3.1';
          const firmwareParts = oldFirmware.match(/v(\d+)\.(\d+)\.(\d+)/);
          let newFirmware = oldFirmware;
          if (firmwareParts) {
            const major = Number(firmwareParts[1]);
            const minor = Number(firmwareParts[2]) + 1;
            const patch = Math.floor(Math.random() * 10);
            newFirmware = `v${major}.${minor}.${patch}`;
          }
          const newBattery = Math.max((device.battery || 100) - Math.floor(Math.random() * 5), 0);
          const newCycles = (device.cycles || 0) + Math.floor(Math.random() * 10 + 1);
          const updated = {
            ...device,
            lastUpdate: new Date().toISOString(),
            firmware: newFirmware,
            battery: newBattery,
            cycles: newCycles,
          };
          await updateDevice(updated);
          setDevice(updated);
          addLog(`Device updated: Firmware ${oldFirmware} → ${newFirmware}, Battery ${device.battery}% → ${newBattery}%, Cycles ${device.cycles} → ${newCycles}`);
        } catch (err) {
          toast.error('Update failed.');
        } finally {
          setDrivingStatus('Idle');
        }
      }, 1200);
    }
  };

  const handleDisconnect = async () => {
    try {
      toast.info('Disconnected!');
      addLog('Device disconnected');
      const updated = { ...device, status: 'disconnected', lastUpdate: new Date().toISOString() };
      await updateDevice(updated);
      setDevice(updated);
    } catch (err) {
      toast.error('Disconnect failed.');
    }
  };

  const handleConnect = async () => {
    try {
      toast.success('Device connected!');
      addLog('Device connected');
      const updated = { ...device, status: 'connected', lastUpdate: new Date().toISOString() };
      await updateDevice(updated);
      setDevice(updated);
    } catch (err) {
      toast.error('Connect failed.');
    }
  };

  const handleDrivingAction = (direction) => {
    setDrivingStatus(`Moving ${direction}`);
    toast.info(`Robot is moving ${direction.toLowerCase()}!`);
    addLog(`Teleop: Move ${direction}`);
    setTimeout(() => setDrivingStatus('Idle'), 2000);
  };

  return (
    <div className="device-details-dark-bg" style={{ minHeight: '100vh', background: '#181A20', fontFamily: 'Inter, Roboto, Arial, sans-serif', color: '#F5F6FA', padding: '2px' }}>
      {/* Device Header Card View */}
      <div className="device-header-card">
        {/* Device Name as Title/Brand */}
        <span style={{ fontSize: '1.7rem', fontWeight: 700, letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ display: 'inline-block', width: '32px', height: '32px', background: '#00BFA5', borderRadius: '50%', marginRight: '8px', boxShadow: '0 1px 6px rgba(0,191,165,0.18)' }}>
            <svg width="20" height="20" viewBox="0 0 20 20" style={{ margin: '6px' }}><circle cx="10" cy="10" r="8" fill="#181A20" /><rect x="8" y="5" width="4" height="10" rx="2" fill="#00BFA5" /></svg>
          </span>
          {device.name}
        </span>
        {/* Status Indicator and Disconnect Button - Horizontal Layout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          {/* Status Indicator */}
          <span style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.12rem', fontWeight: 500 }}>
            <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: device.status === 'connected' ? '#00FF88' : '#FF5252', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: device.status === 'connected' ? '0 0 10px #00FF88' : '0 0 10px #FF5252' }}>
              {device.status === 'connected' ? (
                <svg width="14" height="14" viewBox="0 0 14 14"><circle cx="7" cy="7" r="6" fill="#00FF88" /><path d="M4 7l2 2 4-4" stroke="#fff" strokeWidth="2" fill="none" /></svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 14 14"><circle cx="7" cy="7" r="6" fill="#FF5252" /><line x1="4" y1="4" x2="10" y2="10" stroke="#fff" strokeWidth="2" /><line x1="10" y1="4" x2="4" y2="10" stroke="#fff" strokeWidth="2" /></svg>
              )}
            </span>
            <span style={{ color: device.status === 'connected' ? '#00FF88' : '#FF5252' }}>
              {device.status === 'connected' ? 'Connected' : 'Disconnected'}
            </span>
          </span>
          {/* Disconnect/Connect Button */}
          {device.status === 'connected' ? (
            <Button className="disconnect-btn" style={{ background: '#FF1744', color: '#fff', fontWeight: 600, borderRadius: '7px', padding: '10px 26px', fontSize: '1.12rem', boxShadow: '0 1px 4px rgba(255,23,68,0.18)', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={handleDisconnect}>
              <svg width="20" height="20" viewBox="0 0 20 20" style={{ marginRight: '2px' }}><rect x="5" y="9" width="10" height="2" rx="1" fill="#fff" /></svg>
              Disconnect
            </Button>
          ) : (
            <Button className="disconnect-btn" style={{ background: '#00FF88', color: '#181A20', fontWeight: 600, borderRadius: '7px', padding: '10px 26px', fontSize: '1.12rem', boxShadow: '0 1px 4px rgba(0,255,136,0.18)', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={handleConnect}>
              <svg width="20" height="20" viewBox="0 0 20 20" style={{ marginRight: '2px' }}><rect x="5" y="9" width="10" height="2" rx="1" fill="#181A20" /></svg>
              Connect
            </Button>
          )}
        </div>
      </div>

      {/* Device Details Info Section - Card Grid Below Header */}
      <div style={{ marginTop: '18px', marginBottom: '5px' }}>
        <div className="device-details-info-title" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFD600', marginBottom: '12px', letterSpacing: '0.03em', textAlign: 'center' }}>Device Details</div>
        <div className="device-details-info-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', background: '#23263a', borderRadius: '12px', padding: '18px', boxShadow: '0 1px 8px rgba(0,191,165,0.10)' }}>
          <div className="device-details-info-item" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0' }}>
            <span className="device-details-info-icon" role="img" aria-label="map">🗺️</span>
            <span className="device-details-info-label">Map Localization:</span>
            <span className="device-details-info-value">{device.latitude}, {device.longitude}</span>
          </div>
          <div className="device-details-info-item" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0' }}>
            <span className="device-details-info-icon" role="img" aria-label="dock">🚏</span>
            <span className="device-details-info-label">Dock:</span>
            <span className="device-details-info-value">{device.dock || 'Dock 3'}</span>
          </div>
          <div className="device-details-info-item" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0' }}>
            <span className="device-details-info-icon" role="img" aria-label="firmware">🧬</span>
            <span className="device-details-info-label">Firmware:</span>
            <span className="device-details-info-value">{device.firmware}</span>
          </div>
          <div className="device-details-info-item" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0' }}>
            <span className="device-details-info-icon" role="img" aria-label="location">📍</span>
            <span className="device-details-info-label">Location:</span>
            <span className="device-details-info-value">{device.location || 'Zone A'}</span>
          </div>
          <div className="device-details-info-item" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0' }}>
            <span className="device-details-info-icon" role="img" aria-label="status">⚡</span>
            <span className="device-details-info-label">Status:</span>
            <span className="device-details-info-value">{device.status}</span>
          </div>
          <div className="device-details-info-item" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0' }}>
            <span className="device-details-info-icon" role="img" aria-label="task">🛠️</span>
            <span className="device-details-info-label">Current Task:</span>
            <span className="device-details-info-value">{device.currentTask || 'Unloading'}</span>
          </div>
        </div>
      </div>

      {device.status === 'connected' && (
        <div className="card-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px', marginTop: '10px' }}>
          {resourceChart && (
            <Card title={<div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#FFD600' }}><FaPlay /> Tele-op Driving</div>} footer={<span style={{ color: '#888' }}>Control remotely</span>} style={{ minHeight: 340 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <div style={{ color: '#00BFA5', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>Status: <span className="status-connected">Active</span></div>
                <Button onClick={() => setModalOpen(true)} style={{ background: '#00BFA5', color: '#fff', fontWeight: 500, borderRadius: '6px', fontSize: '1rem', boxShadow: '0 1px 4px rgba(0,191,165,0.10)' }}>Open Controls</Button>
              </div>
              <div className="teleop-resource-details" style={{ marginBottom: '8px' }}>
                <div className="resource-row" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <span role="img" aria-label="memory" style={{ fontSize: '1.1em' }}>🧠</span>
                  <span className="resource-label">Memory Used</span>
                  <div className="progress-bar-bg" style={{ flex: 1, margin: '0 8px' }}>
                    <div
                      className="progress-bar-fill memory"
                      style={{ width: `${(resourceChart.datasets[0].data[1] / 512) * 100}%`, background: '#FFD600', height: '8px', borderRadius: '4px' }}
                    ></div>
                  </div>
                  <span className="resource-value memory" style={{ color: '#FFD600', fontWeight: 600 }}>{resourceChart.datasets[0].data[1]} MB / 512 MB</span>
                </div>
                <div className="resource-row" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span role="img" aria-label="disk" style={{ fontSize: '1.1em' }}>💾</span>
                  <span className="resource-label">Disk Used</span>
                  <div className="progress-bar-bg" style={{ flex: 1, margin: '0 8px' }}>
                    <div
                      className="progress-bar-fill disk"
                      style={{ width: `${(resourceChart.datasets[1].data[1] / 64) * 100}%`, background: '#1976D2', height: '8px', borderRadius: '4px' }}
                    ></div>
                  </div>
                  <span className="resource-value disk" style={{ color: '#1976D2', fontWeight: 600 }}>{resourceChart.datasets[1].data[1]} GB / 64 GB</span>
                </div>
              </div>
              <div style={{ borderTop: '1px solid #23263a', margin: '10px 0 0 0' }} />
            </Card>
          )}

          <Card title={<div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#00BFA5' }}><FaSync /> Remote Updates</div>} footer={<span style={{ color: '#888' }}>Push updates</span>} style={{ minHeight: 340 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <span style={{ color: '#00BFA5', fontWeight: 600 }}>Last Update:</span>
              <span style={{ color: '#FFD600', fontWeight: 600 }}>{device.lastUpdate}</span>
            </div>
            <Button onClick={() => handleAction('Update')} style={{ background: '#FFD600', color: '#181A20', fontWeight: 500, borderRadius: '6px', fontSize: '1rem', boxShadow: '0 1px 4px rgba(255,214,0,0.10)' }}>Update Now</Button>
            <div style={{ borderTop: '1px solid #23263a', margin: '10px 0 0 0' }} />
          </Card>

          <Card title={<div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#1976D2' }}><FaEye /> Path Logging</div>} footer={<span style={{ color: '#888' }}>Monitor paths</span>} style={{ minHeight: 340 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <span style={{ color: '#1976D2', fontWeight: 600 }}>Logged Paths:</span>
              <span style={{ color: '#00FFCC', fontWeight: 600 }}>{device.loggedPaths}</span>
            </div>
            <div className="current-path-map-view">
              <span className="current-path-label" style={{ color: '#888' }}>Current Path (Map View):</span>
              <svg className="path-map-svg" width="220" height="120" viewBox="0 0 220 120">
                {/* Example: A1 (30,100), B2 (110,60), C3 (190,30) */}
                <line x1="30" y1="100" x2="110" y2="60" stroke="#1976D2" strokeWidth="3" markerEnd="url(#arrowhead)" />
                <line x1="110" y1="60" x2="190" y2="30" stroke="#1976D2" strokeWidth="3" markerEnd="url(#arrowhead)" />
                <circle cx="30" cy="100" r="16" fill="#1976D2" />
                <text x="30" y="105" textAnchor="middle" fill="#fff" fontWeight="bold" fontSize="1rem">A1</text>
                <circle cx="110" cy="60" r="16" fill="#1976D2" />
                <text x="110" y="65" textAnchor="middle" fill="#fff" fontWeight="bold" fontSize="1rem">B2</text>
                <circle cx="190" cy="30" r="16" fill="#1976D2" />
                <text x="190" y="35" textAnchor="middle" fill="#fff" fontWeight="bold" fontSize="1rem">C3</text>
                <defs>
                  <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto" markerUnits="strokeWidth">
                    <path d="M0,0 L0,6 L8,3 Z" fill="#1976D2" />
                  </marker>
                </defs>
              </svg>
            </div>
            <Button onClick={() => setLogsOpen(true)} style={{ background: '#1976D2', color: '#fff', fontWeight: 500, borderRadius: '6px', fontSize: '1rem', boxShadow: '0 1px 4px rgba(25,118,210,0.10)', marginTop: '10px' }}>View Logs</Button>
            <div style={{ borderTop: '1px solid #23263a', margin: '10px 0 0 0' }} />
          </Card>

          {batteryChart && (
            <Card title={<div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#00FFCC' }}><FaBatteryHalf /> Health Logging</div>} footer={<span style={{ color: '#888' }}>Track health</span>} style={{ minHeight: 340 }}>
              <div className="health-params" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <div className="param" style={{ color: '#FFD600', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}><span role="img" aria-label="cycles">🔄</span> Cycles: {device.cycles}</div>
                <div className="param" style={{ color: '#00FFCC', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}><span role="img" aria-label="battery">🔋</span> Battery: {device.battery}%</div>
              </div>
              <Chart data={batteryChart} title="Battery Trend" />
              <div style={{ borderTop: '1px solid #23263a', margin: '10px 0 0 0' }} />
            </Card>
          )}
        </div>
      )}

      {/* Driving Modal */}
      {modalOpen && (
        <div className="modal">
          <Card title={<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontWeight: 700, fontSize: '1.18rem', color: '#00BFA5' }}>Tele-operated Driving Controls</span>
              <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: drivingStatus === 'Idle' ? '#FFD600' : '#00FF88', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: drivingStatus === 'Idle' ? '0 0 10px #FFD600' : '0 0 10px #00FF88' }}>
                {drivingStatus === 'Idle' ? (
                  <svg width="14" height="14" viewBox="0 0 14 14"><circle cx="7" cy="7" r="6" fill="#FFD600" /><text x="7" y="10" textAnchor="middle" fill="#181A20" fontWeight="bold" fontSize="0.8rem">I</text></svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 14 14"><circle cx="7" cy="7" r="6" fill="#00FF88" /><text x="7" y="10" textAnchor="middle" fill="#181A20" fontWeight="bold" fontSize="0.8rem">M</text></svg>
                )}
              </span>
            </span>
            <Button onClick={() => setModalOpen(false)} style={{background: 'none', border: 'none', boxShadow: 'none', padding: 0}}>
              <span style={{fontSize: '1.5rem', color: '#888', cursor: 'pointer'}}>&#10005;</span>
            </Button>
          </div>}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
              <span style={{ fontWeight: 600, color: '#888', fontSize: '1.08rem' }}>Current Status:</span>
              <span style={{ color: drivingStatus === 'Idle' ? '#FFD600' : '#00FF88', fontWeight: 700, fontSize: '1.08rem' }}>{drivingStatus}</span>
            </div>
            <div style={{ borderTop: '1px solid #23263a', margin: '10px 0 18px 0' }} />
            <div className="control-panel" style={{ display: 'flex', flexDirection: 'row', minHeight: '350px', gap: '24px' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Camera Panel with Online Play Indicator and Play/Pause Button */}
                  <div className="camera-feed-panel" style={{ background: '#23263a', borderRadius: '10px', padding: '10px', boxShadow: '0 1px 6px rgba(0,191,165,0.10)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <div style={{ fontWeight: 600, color: '#00BFA5', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span role="img" aria-label="camera" style={{ fontSize: '1.2em' }}>📷</span> Camera View
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#00FF88', fontWeight: 600, fontSize: '0.98em' }}>Online</span>
                        <Button style={{ background: '#00BFA5', color: '#fff', borderRadius: '50%', width: '32px', height: '32px', padding: 0 }} onClick={() => toast.info('Play/Pause toggled!')}>
                          <svg width="18" height="18" viewBox="0 0 18 18">
                            <polygon points="6,4 14,9 6,14" fill="#fff" />
                          </svg>
                        </Button>
                      </div>
                    </div>
                      <video
                        src={"https://www.w3schools.com/html/mov_bbb.mp4"}
                        style={{ width: '100%', height: '240px', objectFit: 'cover', borderRadius: '8px', background: '#181A20', border: '1px solid #23263a' }}
                      >
                        Your browser does not support the video tag.
                      </video>
                    <div style={{ color: '#888', fontSize: '0.95em', marginTop: '4px' }}>
                      Last updated: {device.cameraFeedTimestamp ? new Date(device.cameraFeedTimestamp).toLocaleString() : 'Just now'}
                    </div>
                  </div>
                  {/* 3D Map Simulation Panel */}
                  <div className="camera-feed-panel" style={{ background: '#23263a', borderRadius: '10px', padding: '10px', boxShadow: '0 1px 6px rgba(0,191,165,0.10)' }}>
                    <div style={{ fontWeight: 600, color: '#FFD600', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span role="img" aria-label="heatmap" style={{ fontSize: '1.2em' }}>🌡️</span> 3D Robot View
                    </div>
                    {/* Placeholder for 3D map, replace with actual 3D component or iframe if available */}
                    <div style={{ width: '100%', height: '140px', background: '#181A20', borderRadius: '8px', border: '1px solid #23263a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFD600', fontWeight: 600, fontSize: '1.1em' }}>
                      [3D Map]
                    </div>
                    <div style={{ color: '#888', fontSize: '0.95em', marginTop: '4px' }}>
                      Last updated: {device.map3dTimestamp ? new Date(device.map3dTimestamp).toLocaleString() : 'Just now'}
                    </div>
                  </div>
              </div>
              <div style={{ flex: 1 }}>
                <div className="humanoid-controls" style={{ marginBottom: '18px' }}>
                  <h4 style={{ color: '#00BFA5', marginBottom: '8px' }}>Gestures</h4>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <Button onClick={() => toast.info('Wave Hand')}>Wave Hand</Button>
                    <Button onClick={() => toast.info('Nod Head')}>Nod Head</Button>
                    <Button onClick={() => toast.info('Sit Down')}>Sit Down</Button>
                    <Button onClick={() => toast.info('Stand Up')}>Stand Up</Button>
                  </div>
                </div>
                <div className="driving-controls" style={{ marginTop: '8px' }}>
                  <Button onClick={() => handleDrivingAction('Forward')} className="control-btn">
                    <FaArrowUp /> Forward
                  </Button>
                  <div className="control-row">
                    <Button onClick={() => handleDrivingAction('Left')} className="control-btn">
                      <FaArrowLeft /> Left
                    </Button>
                    <Button onClick={() => handleDrivingAction('Stop')} className="control-btn stop">
                      <FaStop /> Stop
                    </Button>
                    <Button onClick={() => handleDrivingAction('Right')} className="control-btn">
                      <FaArrowRight /> Right
                    </Button>
                  </div>
                  <Button onClick={() => handleDrivingAction('Backward')} className="control-btn">
                    <FaArrowDown /> Backward
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Logs Modal */}
      {logsOpen && (
        <div className="modal">
          <Card title={<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <span>Device Logs</span>
            <Button onClick={() => setLogsOpen(false)} style={{background: 'none', border: 'none', boxShadow: 'none', padding: 0}}>
              <span style={{fontSize: '1.5rem', color: '#888', cursor: 'pointer'}}>&#10005;</span>
            </Button>
          </div>}>
            <div className="logs-list">
              {deviceLogs.length === 0 ? (
                <div style={{ color: '#888', fontFamily: 'monospace', marginBottom: '8px' }}>No logs yet.</div>
              ) : (
                deviceLogs.map((log, idx) => (
                  <div key={idx} className="log-entry" style={{
                    animation: `fadeInLog 0.5s ease ${idx * 0.15}s both`,
                    color: '#00BFA5',
                    marginBottom: '8px',
                    fontFamily: 'monospace',
                  }}>{log}</div>
                ))
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DeviceDetails;