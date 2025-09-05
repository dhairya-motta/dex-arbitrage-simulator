import React, { useState, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Activity, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

const TradingDashboard = ({ prices = [] }) => {
  const [priceHistory, setPriceHistory] = useState([]);
  const [volumeData, setVolumeData] = useState([]);
  const [spreadData, setSpreadData] = useState([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1m');

  useEffect(() => {
    if (prices.length === 0) return;

    const timestamp = Date.now();
    const newDataPoint = {
      timestamp,
      time: new Date(timestamp).toLocaleTimeString(),
      ...prices.reduce((acc, price) => {
        acc[`${price.dex}_price`] = price.price;
        acc[`${price.dex}_spread`] = price.spread;
        acc[`${price.dex}_volume`] = price.volume24h / 24; // Hourly volume approximation
        return acc;
      }, {})
    };

    setPriceHistory(prev => {
      const updated = [...prev, newDataPoint];
      // Keep last 50 data points for performance
      return updated.slice(-50);
    });

    // Update spread data
    const spreadPoint = {
      timestamp,
      time: new Date(timestamp).toLocaleTimeString(),
      avgSpread: prices.reduce((sum, p) => sum + p.spread, 0) / prices.length,
      maxSpread: Math.max(...prices.map(p => p.spread)),
      minSpread: Math.min(...prices.map(p => p.spread))
    };

    setSpreadData(prev => [...prev, spreadPoint].slice(-50));

    // Update volume data
    const volumePoint = {
      timestamp,
      time: new Date(timestamp).toLocaleTimeString(),
      ...prices.reduce((acc, price) => {
        acc[price.dex] = price.volume24h / 24;
        return acc;
      }, {})
    };

    setVolumeData(prev => [...prev, volumePoint].slice(-50));
  }, [prices]);

  const getLatestPrices = () => {
    if (prices.length === 0) return [];
    
    return prices.map(price => ({
      ...price,
      change: priceHistory.length > 1 ? 
        ((price.price - (priceHistory[priceHistory.length - 2][`${price.dex}_price`] || price.price)) / price.price * 100) : 0
    }));
  };

  const getTotalVolume = () => {
    return prices.reduce((sum, price) => sum + price.volume24h, 0);
  };

  const getAverageSpread = () => {
    if (prices.length === 0) return 0;
    return prices.reduce((sum, price) => sum + price.spread, 0) / prices.length;
  };

  const getPriceRange = () => {
    if (prices.length === 0) return { min: 0, max: 0 };
    const allPrices = prices.map(p => p.price);
    return {
      min: Math.min(...allPrices),
      max: Math.max(...allPrices)
    };
  };

  const latestPrices = getLatestPrices();
  const totalVolume = getTotalVolume();
  const avgSpread = getAverageSpread();
  const priceRange = getPriceRange();

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <Activity className="mr-2 text-blue-600" />
          Trading Dashboard
        </h2>
        <div className="flex items-center space-x-2">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1m">1 Minute</option>
            <option value="5m">5 Minutes</option>
            <option value="15m">15 Minutes</option>
            <option value="1h">1 Hour</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-blue-700">
                ${totalVolume.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <div className="text-sm text-blue-600">24h Volume</div>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-green-700">
                ${priceRange.max.toFixed(4)}
              </div>
              <div className="text-sm text-green-600">Highest Price</div>
            </div>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <TrendingDown className="h-8 w-8 text-red-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-red-700">
                ${priceRange.min.toFixed(4)}
              </div>
              <div className="text-sm text-red-600">Lowest Price</div>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-purple-700">
                ${avgSpread.toFixed(4)}
              </div>
              <div className="text-sm text-purple-600">Avg Spread</div>
            </div>
          </div>
        </div>
      </div>

      {/* Price Chart */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Price Movements</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={priceHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              {prices.map((price, index) => (
                <Line
                  key={price.dex}
                  type="monotone"
                  dataKey={`${price.dex}_price`}
                  stroke={price.color}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Spread Analysis */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Spread Analysis</h3>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={spreadData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="maxSpread" stackId="1" stroke="#ef4444" fill="#fecaca" />
              <Area type="monotone" dataKey="avgSpread" stackId="2" stroke="#3b82f6" fill="#93c5fd" />
              <Area type="monotone" dataKey="minSpread" stackId="3" stroke="#10b981" fill="#86efac" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Volume Chart */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Volume by DEX</h3>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={volumeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              {prices.map((price, index) => (
                <Bar
                  key={price.dex}
                  dataKey={price.dex}
                  fill={price.color}
                  opacity={0.8}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Current Prices Table */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Current Prices</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  DEX
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Change
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Spread
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Volume
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Liquidity
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {latestPrices.map((price, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: price.color }}
                      ></div>
                      <span className="text-sm font-medium text-gray-900">{price.dex}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                    ${price.price}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      price.change >= 0 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {price.change >= 0 ? '+' : ''}{price.change.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                    ${price.spread.toFixed(4)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${price.volume24h.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${price.liquidity.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TradingDashboard;