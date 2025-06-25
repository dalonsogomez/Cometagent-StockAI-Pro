// Componente de gráfico de resumen del mercado
import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function MarketOverviewChart({ data }) {
  const chartData = {
    labels: ['STRONG_BUY', 'BUY', 'HOLD', 'WEAK_HOLD', 'SELL'],
    datasets: [
      {
        data: [
          data.STRONG_BUY || 0,
          data.BUY || 0,
          data.HOLD || 0,
          data.WEAK_HOLD || 0,
          data.SELL || 0,
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',   // green-500
          'rgba(59, 130, 246, 0.8)',  // blue-500
          'rgba(234, 179, 8, 0.8)',   // yellow-500
          'rgba(249, 115, 22, 0.8)',  // orange-500
          'rgba(239, 68, 68, 0.8)',   // red-500
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(234, 179, 8, 1)',
          'rgba(249, 115, 22, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: 'rgba(255, 255, 255, 0.8)',
          padding: 20,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          }
        }
      },
    },
  };

  return (
    <div className="h-64">
      <Doughnut data={chartData} options={options} />
    </div>
  );
}

