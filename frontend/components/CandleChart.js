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
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const CandleChart = ({ data, title }) => {
  if (!data || data.length === 0) {
    return (
      <div className="candle-chart">
        <h4>{title}</h4>
        <div className="no-data">No chart data available</div>
      </div>
    );
  }

  // Convert timestamps to readable dates
  const labels = data.map(item => {
    const date = new Date(item.timestamp * 1000);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  });

  // Extract close prices for the line chart
  const closePrices = data.map(item => item.close);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'ETH/USDC Price',
        data: closePrices,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.1,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#3b82f6',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: function(context) {
            return `Date: ${context[0].label}`;
          },
          label: function(context) {
            const dataIndex = context.dataIndex;
            const dataPoint = data[dataIndex];
            return [
              `Price: $${dataPoint.close.toFixed(6)}`,
              `Open: $${dataPoint.open.toFixed(6)}`,
              `High: $${dataPoint.high.toFixed(6)}`,
              `Low: $${dataPoint.low.toFixed(6)}`,
            ];
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12,
          },
        },
      },
      y: {
        display: true,
        grid: {
          color: 'rgba(107, 114, 128, 0.1)',
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12,
          },
          callback: function(value) {
            return `$${value.toFixed(6)}`;
          },
        },
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
    elements: {
      point: {
        hoverBackgroundColor: '#3b82f6',
        hoverBorderColor: '#ffffff',
        hoverBorderWidth: 3,
      },
    },
  };

  return (
    <div className="candle-chart">
      <h4>{title}</h4>
      <div className="chart-container">
        <Line data={chartData} options={options} height={200} />
      </div>
    </div>
  );
};

export default CandleChart; 