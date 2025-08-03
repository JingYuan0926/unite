import React from 'react';

const PriceChart = ({ data, title }) => {
  if (!data || data.length === 0) {
    return (
      <div className="price-chart">
        <h4>{title}</h4>
        <div className="no-data">No chart data available</div>
      </div>
    );
  }

  // Find min and max values for scaling
  const prices = data.map(item => parseFloat(item.close)).filter(price => !isNaN(price));
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice;

  // Chart dimensions
  const width = 300;
  const height = 150;
  const padding = 20;

  // Generate SVG path
  const points = data.map((item, index) => {
    const x = padding + (index / (data.length - 1)) * (width - 2 * padding);
    const price = parseFloat(item.close);
    const y = height - padding - ((price - minPrice) / priceRange) * (height - 2 * padding);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="price-chart">
      <h4>{title}</h4>
      <div className="chart-container">
        <svg width={width} height={height} className="chart-svg">
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="50" height="30" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 30" fill="none" stroke="#e2e8f0" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Price line */}
          <polyline
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            points={points}
          />
          
          {/* Data points */}
          {data.map((item, index) => {
            const x = padding + (index / (data.length - 1)) * (width - 2 * padding);
            const price = parseFloat(item.close);
            const y = height - padding - ((price - minPrice) / priceRange) * (height - 2 * padding);
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="3"
                fill="#3b82f6"
              />
            );
          })}
          
          {/* Price labels */}
          <text x={width - padding} y={padding + 10} fontSize="10" fill="#6b7280">
            ${maxPrice.toFixed(6)}
          </text>
          <text x={width - padding} y={height - padding} fontSize="10" fill="#6b7280">
            ${minPrice.toFixed(6)}
          </text>
        </svg>
        
        {/* Price info */}
        <div className="price-info">
          <div className="current-price">
            Current: ${parseFloat(data[data.length - 1]?.close || 0).toFixed(6)}
          </div>
          <div className="price-change">
            {data.length > 1 && (
              <>
                Change: {((parseFloat(data[data.length - 1]?.close || 0) - parseFloat(data[0]?.close || 0)) / parseFloat(data[0]?.close || 1) * 100).toFixed(2)}%
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceChart; 