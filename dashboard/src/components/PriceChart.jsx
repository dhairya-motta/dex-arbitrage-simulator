import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const PriceChart = ({ data = [], selectedPair = 'ETH/USDC' }) => {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Price Chart - {selectedPair}</h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <div className="text-4xl mb-2">📈</div>
            <p>No price data available</p>
            <p className="text-sm">Start the DEX simulator to see price movements</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate spread indicators
  const getSpreadIndicators = () => {
    if (data.length === 0) return { avgSpread: 0, maxSpread: 0, minSpread: 0 };
    
    const spreads = data.map(point => {
      const prices = Object.keys(point)
        .filter(key => key.includes('_price'))
        .map(key => point[key])
        .filter(price => typeof price === 'number');
      
      if (prices.length < 2) return 0;
      return Math.max(...prices) - Math.min(...prices);
    });
    
    return {
      avgSpread: spreads.reduce((a, b) => a + b, 0) / spreads.length,
      maxSpread: Math.max(...spreads),
      minSpread: Math.min(...spreads)
    };
  };

  const spreadIndicators = getSpreadIndicators();

  // Get all price keys for different DEXs
  const priceKeys = Object.keys(data[0] || {}).filter(key => key.includes('_price'));
  
  // DEX colors mapping
  const dexColors = {
    'UniswapV3_price': '#FF007A',
    'SushiSwap_price': '#0E4F99',
    'PancakeSwap_price': '#1FC7D4',
    '1inch_price': '#94A3B8'
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-800">{`Time: ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.dataKey.replace('_price', '')}: $${entry.value?.toFixed(6)}`}
            </p>
          ))}
          {payload.length > 1 && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-600">
                Spread: ${(Math.max(...payload.map(p => p.value)) - Math.min(...payload.map(p => p.value))).toFixed(6)}
              </p>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Price Chart - {selectedPair}</h3>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <span className="text-gray-600">Avg Spread:</span>
            <span className="font-mono text-blue-600">${spreadIndicators.avgSpread.toFixed(6)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-gray-600">Max Spread:</span>
            <span className="font-mono text-red-600">${spreadIndicators.maxSpread.toFixed(6)}</span>
          </div>
        </div>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#d1d5db' }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#d1d5db' }}
              domain={['dataMin - 1', 'dataMax + 1']}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Reference line for average price */}
            {data.length > 0 && (
              <ReferenceLine 
                y={priceKeys.reduce((sum, key) => sum + (data[data.length - 1][key] || 0), 0) / priceKeys.length}
                stroke="#9ca3af" 
                strokeDasharray="5 5"
                label={{ value: "Avg", position: "right" }}
              />
            )}
            
            {/* Price lines for each DEX */}
            {priceKeys.map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={dexColors[key] || `hsl(${index * 60}, 70%, 50%)`}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
                connectNulls={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap justify-center space-x-6">
        {priceKeys.map((key) => {
          const dexName = key.replace('_price', '');
          const color = dexColors[key] || '#666';
          return (
            <div key={key} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
              ></div>
              <span className="text-sm text-gray-700">{dexName}</span>
            </div>
          );
        })}
      </div>

      {/* Chart Controls */}
      <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
        <div className="flex items-center space-x-4">
          <span>📊 Real-time price tracking</span>
          <span>📈 Spread visualization</span>
          <span>🎯 Arbitrage opportunities</span>
        </div>
        <div className="text-xs">
          Data points: {data.length}
        </div>
      </div>
    </div>
  );
};

export default PriceChart;