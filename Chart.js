import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Chart = ({ data, title }) => (
  <Line 
    data={data} 
    options={{ 
      responsive: true, 
      plugins: { title: { display: true, text: title } },
      scales: { y: { beginAtZero: true } }
    }} 
  />
);

export default Chart;