import React from 'react';
import { Link } from 'react-router-dom';
import { FaRobot } from 'react-icons/fa';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2><FaRobot /> ReboOper</h2>
      </div>
      <ul>
        <li><Link to="/">Dashboard</Link></li>
        <li><Link to="/devices">Devices</Link></li>
        <li><Link to="/support">Support</Link></li>
      </ul>
    </div>
  );
};

export default Sidebar;