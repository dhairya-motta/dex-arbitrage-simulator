import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { generateMockPrices, TRADING_PAIRS, resetMarketState, getMarketInsights } from '../data/dexData';
import { TrendingUp, TrendingDown, Minus, RotateCcw, Info } from 'lucide-react';

const DEXSimulator = ({ onPriceUpdate }) => {
  const [selectedPair, setSelectedPair] = useState('ETH/USDC');
  const [prices, setPrices] = useState([]);
  const [priceHistory, setPriceHistory] = useState([]);
  const [isRunning, setIsRunning] = useState(true);
  const [updateInterval, setUpdateInterval] = useState(2000);
  const [marketInsights, setMarketInsights] = useState(null);

  useEffect(() => {
    const updatePrices = () => {
      const newPrices = generateMockPrices(selectedPair);
      setPrices(newPrices);
      
      // Get market insights
      const insights = getMarketInsights(selectedPair);
      setMarketInsights(insights);
      
      // Add to price history for the graph
      const timestamp = Date.now();
      const historyPoint = {
        time: new Date(timestamp).toLocaleTimeString(),
        timestamp,
        ...newPrices.reduce((acc, price) => {
          acc[price.dex] = price.price;
          acc[`${price.dex}_spread`] = price.spread;
          return acc;
        }, {})
      };
      
      setPriceHistory(prev => {
        const updated = [...prev, historyPoint];
        // Keep last 50 data points for better trend visualization
        return updated.slice(-50);
      });
      
      if (onPriceUpdate) {
        onPriceUpdate(newPrices);
      }
    };

    updatePrices(); // Initial update
    
    if (isRunning) {
      const interval = setInterval(updatePrices, updateInterval);
      return () => clearInterval(interval);
    }
  }, [selectedPair, isRunning, updateInterval, onPriceUpdate]);

  // Reset history when pair changes
  useEffect(() => {
    setPriceHistory([]);
  }, [selectedPair]);

  const getBestPrice = (type) => {
    if (prices.length === 0) return null;
    
    if (type === 'buy') {
      return prices.reduce((best, current) => 
        current.ask < best.ask ? current : best
      );
    } else {
      return prices.reduce((best, current) => 
        current.bid > best.bid ? current : best
      );
    }
  };

  const getSpreadAnalysis = () => {
    if (prices.length === 0) return null;
    
    const spreads = prices.map(p => p.spread);
    const avgSpread = spreads.reduce((a, b) => a + b, 0) / spreads.length;
    const maxSpread = Math.max(...spreads);
    const minSpread = Math.min(...spreads);
    
    return { avgSpread, maxSpread, minSpread };
  };

  const handleReset = () => {
    resetMarketState();
    setPriceHistory([]);
    setMarketInsights(null);
  };

  const getTrendIcon = (trend) => {
    if (!trend) return <Minus className="h-4 w-4" />;
    if (trend === 'Bullish') return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend === 'Bearish') return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-600" />;
  };

  const getTrendColor = (trend) => {
    if (trend === 'Bullish') return 'text-green-600 bg-green-50 border-green-200';
    if (trend === 'Bearish') return 'text-red-600 bg-red-50 border-red-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const spreadAnalysis = getSpreadAnalysis();
  const bestBuy = getBestPrice('buy');
  const bestSell = getBestPrice('sell');

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-800">{`Time: ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.dataKey}: $${entry.value?.toFixed(6)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">DEX Price Simulator</h2>
        <div className="flex items-center space-x-4">
          <select
            value={selectedPair}
            onChange={(e) => setSelectedPair(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {TRADING_PAIRS.map(pair => (
              <option key={pair.symbol} value={pair.symbol}>
                {pair.symbol}
              </option>
            ))}
          </select>
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-4 py-2 rounded-md font-medium ${
              isRunning 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {isRunning ? 'Pause' : 'Start'}
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md font-medium flex items-center space-x-2"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset Market</span>
          </button>
        </div>
      </div>

      {/* Market Development Status */}
      {marketInsights && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-blue-800 flex items-center">
              <Info className="h-5 w-5 mr-2" />
              Market Development Status
            </h3>
            <div className={`px-3 py-1 rounded-full border text-sm font-medium flex items-center space-x-2 ${getTrendColor(marketInsights.trendDirection)}`}>
              {getTrendIcon(marketInsights.trendDirection)}
              <span>{marketInsights.trendDirection}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-blue-600 font-medium">Market Phase</div>
              <div className="text-blue-800">{marketInsights.phase}</div>
            </div>
            <div>
              <div className="text-blue-600 font-medium">Maturity</div>
              <div className="text-blue-800">{marketInsights.maturity}%</div>
            </div>
            <div>
              <div className="text-blue-600 font-medium">Trend Strength</div>
              <div className="text-blue-800">{(marketInsights.trendStrength * 100).toFixed(1)}%</div>
            </div>
            <div>
              <div className="text-blue-600 font-medium">Volatility</div>
              <div className="text-blue-800">{(marketInsights.volatility * 100).toFixed(2)}%</div>
            </div>
          </div>
          <div className="mt-3 text-xs text-blue-700">
            💡 Watch how the market gradually develops from low volatility to more dynamic price movements as it matures
          </div>
        </div>
      )}

      {/* Real-time Price Chart */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Live Price Movement - {selectedPair}</h3>
        <div className="h-80 w-full bg-gray-50 rounded-lg p-4">
          {priceHistory.length > 1 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={priceHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  domain={['dataMin - 0.5', 'dataMax + 0.5']}
                />
                <Tooltip content={<CustomTooltip />} />
                
                {prices.map((price, index) => (
                  <Line
                    key={price.dex}
                    type="monotone"
                    dataKey={price.dex}
                    stroke={price.color}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 0 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <div className="text-4xl mb-2">🌱</div>
                <p>Market is developing...</p>
                <p className="text-sm">Building price history and establishing trends</p>
                {marketInsights && (
                  <div className="mt-2 text-xs">
                    Current phase: {marketInsights.phase}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Chart Legend */}
        <div className="mt-4 flex flex-wrap justify-center space-x-6">
          {prices.map((price) => (
            <div key={price.dex} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: price.color }}
              ></div>
              <span className="text-sm text-gray-700">{price.dex}</span>
              <span className="text-sm font-mono text-gray-600">
                ${prices.length > 0 ? price.price : '0.00'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Current Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-800 mb-2">Best Buy Price</h4>
          {bestBuy && (
            <div className="space-y-1 text-sm">
              <div className="font-mono text-lg text-green-700">${bestBuy.ask}</div>
              <div className="text-green-600">on {bestBuy.dex}</div>
            </div>
          )}
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-semibold text-red-800 mb-2">Best Sell Price</h4>
          {bestSell && (
            <div className="space-y-1 text-sm">
              <div className="font-mono text-lg text-red-700">${bestSell.bid}</div>
              <div className="text-red-600">on {bestSell.dex}</div>
            </div>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">Arbitrage Opportunity</h4>
          {spreadAnalysis && bestBuy && bestSell && (
            <div className="space-y-1 text-sm">
              <div className="font-mono text-lg text-blue-700">
                ${(bestSell.bid - bestBuy.ask).toFixed(4)}
              </div>
              <div className="text-blue-600">
                {((bestSell.bid - bestBuy.ask) / bestBuy.ask * 100).toFixed(2)}% profit potential
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Price Table (Collapsed by default) */}
      <details className="mb-4">
        <summary className="cursor-pointer text-lg font-semibold text-gray-800 hover:text-blue-600">
          📊 Detailed Price Data (Click to expand)
        </summary>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {prices.map((price, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-800">{price.dex}</h3>
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: price.color }}
                ></div>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Price:</span>
                  <span className="font-mono">${price.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-600">Bid:</span>
                  <span className="font-mono text-red-600">${price.bid}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-600">Ask:</span>
                  <span className="font-mono text-green-600">${price.ask}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Volume:</span>
                  <span className="font-mono">${price.volume24h.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Liquidity:</span>
                  <span className="font-mono">${price.liquidity.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </details>

      {/* Update Interval Control */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Update Speed:</label>
          <select
            value={updateInterval}
            onChange={(e) => setUpdateInterval(Number(e.target.value))}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={1000}>Fast (1s)</option>
            <option value={2000}>Normal (2s)</option>
            <option value={3000}>Slow (3s)</option>
            <option value={5000}>Very Slow (5s)</option>
          </select>
        </div>
        
        <div className="text-sm text-gray-600">
          Data Points: {priceHistory.length} | Status: 
          <span className={`ml-1 font-medium ${isRunning ? 'text-green-600' : 'text-gray-600'}`}>
            {isRunning ? 'Live' : 'Paused'}
          </span>
        </div>
      </div>

      {/* Educational Note */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-semibold text-yellow-800 mb-2">🎓 How Market Building Works</h4>
        <p className="text-sm text-yellow-700">
          This simulator shows realistic market development: starting with low volatility and small spreads, 
          gradually building momentum, trends, and liquidity over time. Watch how arbitrage opportunities 
          become more frequent as the market matures and develops natural price inefficiencies.
        </p>
      </div>
    </div>
  );
};

export default DEXSimulator;