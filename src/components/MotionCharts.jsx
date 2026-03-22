import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

ChartJS.defaults.color = "#94a3b8";
ChartJS.defaults.font.family = "Outfit";

// We'll maintain a simple local history array for the charts to show a sliding window
// In a real robust app, this would be managed by a global store or hook if we want long history
const maxDataPoints = 20;
let timeLabels = Array(maxDataPoints).fill('');
let accelHistory = { x: Array(maxDataPoints).fill(0), y: Array(maxDataPoints).fill(0), z: Array(maxDataPoints).fill(0) };
let gyroHistory = { x: Array(maxDataPoints).fill(0), y: Array(maxDataPoints).fill(0), z: Array(maxDataPoints).fill(0) };

const MotionCharts = ({ accel, gyro }) => {
  // Update internal history buffers
  if (accel) {
    accelHistory.x.push(accel.x); accelHistory.x.shift();
    accelHistory.y.push(accel.y); accelHistory.y.shift();
    accelHistory.z.push(accel.z); accelHistory.z.shift();
  }
  if (gyro) {
    gyroHistory.x.push(gyro.x); gyroHistory.x.shift();
    gyroHistory.y.push(gyro.y); gyroHistory.y.shift();
    gyroHistory.z.push(gyro.z); gyroHistory.z.shift();
  }
  
  // Just shift a dummy label array to keep charts moving
  timeLabels.push(''); timeLabels.shift();

  const accelData = {
    labels: timeLabels,
    datasets: [
      { label: 'X', data: accelHistory.x, borderColor: 'rgba(239, 68, 68, 0.8)', tension: 0.3, pointRadius: 0 },
      { label: 'Y', data: accelHistory.y, borderColor: 'rgba(16, 185, 129, 0.8)', tension: 0.3, pointRadius: 0 },
      { label: 'Z', data: accelHistory.z, borderColor: 'rgba(59, 130, 246, 0.8)', tension: 0.3, pointRadius: 0 },
    ],
  };

  const gyroData = {
    labels: timeLabels,
    datasets: [
      { label: 'X', data: gyroHistory.x, borderColor: 'rgba(239, 68, 68, 0.8)', tension: 0.3, pointRadius: 0 },
      { label: 'Y', data: gyroHistory.y, borderColor: 'rgba(16, 185, 129, 0.8)', tension: 0.3, pointRadius: 0 },
      { label: 'Z', data: gyroHistory.z, borderColor: 'rgba(59, 130, 246, 0.8)', tension: 0.3, pointRadius: 0 },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 0 }, // turn off ChartJS animations for real-time smoothness
    plugins: {
      legend: { position: 'top', labels: { boxWidth: 10 } }
    },
    scales: {
      x: { display: false }, // hide X axis labels
      y: { grid: { color: 'rgba(255,255,255,0.05)' } }
    }
  };

  return (
    <div className="glass-card col-span-2">
      <h2>📈 Motion Tracking (MPU6050)</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Accelerometer</h3>
          <div style={{ height: '200px' }}>
            <Line data={accelData} options={options} />
          </div>
        </div>
        <div>
          <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Gyroscope</h3>
          <div style={{ height: '200px' }}>
            <Line data={gyroData} options={options} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MotionCharts;
