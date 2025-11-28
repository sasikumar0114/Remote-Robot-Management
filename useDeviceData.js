import { useState, useEffect } from 'react';
import { getAllDevices, ensureDBSeeded } from '../deviceDB';

export const useDeviceData = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);

  const refreshData = async () => {
    setLoading(true);
    await ensureDBSeeded();
    const dbDevices = await getAllDevices();
    // Simulate real-time updates for connected devices
    const updatedDevices = dbDevices.map(device => ({
      ...device,
      battery: device.status === 'connected' ? Math.min(100, device.battery + Math.floor(Math.random() * 10) - 5) : 0,
      cycles: device.status === 'connected' ? device.cycles + Math.floor(Math.random() * 5) : 0,
    }));
    setDevices(updatedDevices);
    setLoading(false);
  };

  useEffect(() => {
    refreshData(); // Initial load
    // eslint-disable-next-line
  }, []);

  return { devices, loading, refreshData };
};