// DeviceDB using IndexedDB via Dexie.js
import Dexie from 'dexie';

const db = new Dexie('DeviceDB');
db.version(1).stores({
  devices: '++id, name, status, battery, cycles, loggedPaths, lastUpdate, latitude, longitude, dock, firmware, location, currentTask, memoryHistory, diskHistory'
  });


const simulationDevices = [
  {
    id: 1,
    name: 'Robot Alpha',
    status: 'connected',
    battery: 85,
    cycles: 120,
    loggedPaths: 15,
    lastUpdate: '2025-11-27 10:02:10',
    latitude: '37.7749',
    longitude: '-122.4194',
    dock: 'Dock 3',
    firmware: 'v2.3.1',
    location: 'Zone A',
    currentTask: 'Unloading',
    batteryHistory: [80, 85, 90, 85],
    cycleHistory: [100, 110, 115, 120],
    memoryHistory: [128, 256, 320, 400, 380],
    diskHistory: [12, 18, 25, 30, 28],
  },
  {
    id: 2,
    name: 'Robot Beta',
    status: 'disconnected',
    battery: 0,
    cycles: 0,
    loggedPaths: 0,
    lastUpdate: 'N/A',
    latitude: '40.7128',
    longitude: '-74.0060',
    dock: 'Dock 1',
    firmware: 'v2.1.0',
    location: 'Zone B',
    currentTask: 'Idle',
    batteryHistory: [0, 0, 0, 0],
    cycleHistory: [0, 0, 0, 0],
    memoryHistory: [0, 0, 0, 0, 0],
    diskHistory: [0, 0, 0, 0, 0],
  },
  {
    id: 3,
    name: 'Robot Gamma',
    status: 'connected',
    battery: 92,
    cycles: 200,
    loggedPaths: 25,
    lastUpdate: '2025-11-27 09:55:00',
    latitude: '34.0522',
    longitude: '-118.2437',
    dock: 'Dock 2',
    firmware: 'v2.2.5',
    location: 'Zone C',
    currentTask: 'Pick & Place',
    batteryHistory: [90, 95, 92, 92],
    cycleHistory: [180, 190, 195, 200],
    memoryHistory: [200, 220, 250, 270, 260],
    diskHistory: [15, 20, 22, 24, 23],
  },
];

// Always clear and re-seed DB on app start
export async function resetDeviceDB() {
  await db.devices.clear();
  await db.devices.bulkPut(simulationDevices);
}

// Immediately reset DB when this module is loaded
resetDeviceDB();

export async function ensureDBSeeded() {
  const count = await db.devices.count();
  if (count === 0) {
    await db.devices.bulkPut(simulationDevices);
  }
}

export async function addDevice(device) {
  await ensureDBSeeded();
  return db.devices.add(device);
}

export async function updateDevice(device) {
  await ensureDBSeeded();
  return db.devices.put(device);
}

export async function getDevice(id) {
  await ensureDBSeeded();
    const device = await db.devices.get(id);
    // Ensure all chart fields are present for UI
    return {
      ...device,
      memoryHistory: device.memoryHistory || [],
      diskHistory: device.diskHistory || [],
      batteryHistory: device.batteryHistory || [],
      cycles: device.cycles || 0,
      loggedPaths: device.loggedPaths || 0,
      battery: device.battery || 0,
    };
}

export async function getAllDevices() {
  await ensureDBSeeded();
  return db.devices.toArray();
}


// Log storage for each device (future: move to DB)
export function addDeviceLog(deviceId, message) {
  const logs = JSON.parse(localStorage.getItem(`deviceLogs_${deviceId}`) || '[]');
  const newLog = `${new Date().toISOString()} - ${message}`;
  logs.unshift(newLog);
  localStorage.setItem(`deviceLogs_${deviceId}`, JSON.stringify(logs));
}

export function getDeviceLogs(deviceId) {
  return JSON.parse(localStorage.getItem(`deviceLogs_${deviceId}`) || '[]');
}
