import React, { useState, useEffect } from 'react';
import { TrendingUp, AlertTriangle, DollarSign } from 'lucide-react';

const ArbitrageDetector = ({ prices = [] }) => {
  const [opportunities, setOpportunities] = useState([]);
  const [minProfitThreshold, setMinProfitThreshold] = useState(0.5);
  const [totalProfitPotential, setTotalProfitPotential] = useState(0);

  useEffect(() => {
    if (prices.length < 2) return;

    const detectArbitrageOpportunities = () => {
      const opportunities = [];
      
      // Find all possible arbitrage pairs
      for (let i = 0; i < prices.length; i++) {
        for (let j = i + 1; j < prices.length; j++) {
          const buyDex = prices[i];
          const sellDex = prices[j];
          
          // Check if we can buy on one DEX and sell on another for profit
          const profitBuyI = sellDex.bid - buyDex.ask;
          const profitBuyJ = buyDex.bid - sellDex.ask;
          
          if (profitBuyI > minProfitThreshold) {
            opportunities.push({
              id: `${buyDex.dex}-${sellDex.dex}-${Date.now()}`,
              buyDex: buyDex.dex,
              sellDex: sellDex.dex,
              buyPrice: buyDex.ask,
              sellPrice: sellDex.bid,
              profit: profitBuyI,
              profitPercent: (profitBuyI / buyDex.ask) * 100,
              pair: buyDex.pair,
              gasEstimate: Math.random() * 50 + 20, // Mock gas estimate
              netProfit: profitBuyI - (Math.random() * 10 + 5), // After gas
              riskLevel: profitBuyI > 10 ? 'Low' : profitBuyI > 5 ? 'Medium' : 'High',
              timestamp: Date.now()
            });
          }
          
          if (profitBuyJ > minProfitThreshold) {
            opportunities.push({
              id: `${sellDex.dex}-${buyDex.dex}-${Date.now()}`,
              buyDex: sellDex.dex,
              sellDex: buyDex.dex,
              buyPrice: sellDex.ask,
              sellPrice: buyDex.bid,
              profit: profitBuyJ,
              profitPercent: (profitBuyJ / sellDex.ask) * 100,
              pair: sellDex.pair,
              gasEstimate: Math.random() * 50 + 20,
              netProfit: profitBuyJ - (Math.random() * 10 + 5),
              riskLevel: profitBuyJ > 10 ? 'Low' : profitBuyJ > 5 ? 'Medium' : 'High',
              timestamp: Date.now()
            });
          }
        }
      }
      
      // Sort by profit potential
      opportunities.sort((a, b) => b.profit - a.profit);
      
      setOpportunities(opportunities.slice(0, 10)); // Keep top 10
      setTotalProfitPotential(opportunities.reduce((sum, opp) => sum + opp.netProfit, 0));
    };

    detectArbitrageOpportunities();
  }, [prices, minProfitThreshold]);

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'Low': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'High': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const executeArbitrage = (opportunity) => {
    // Simulate arbitrage execution
    alert(`Executing arbitrage:\nBuy on ${opportunity.buyDex} at $${opportunity.buyPrice}\nSell on ${opportunity.sellDex} at $${opportunity.sellPrice}\nEstimated profit: $${opportunity.netProfit.toFixed(2)}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <TrendingUp className="mr-2 text-green-600" />
          Arbitrage Detector
        </h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Min Profit ($):</label>
            <input
              type="number"
              value={minProfitThreshold}
              onChange={(e) => setMinProfitThreshold(Number(e.target.value))}
              step="0.1"
              min="0"
              className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-blue-700">{opportunities.length}</div>
              <div className="text-sm text-blue-600">Active Opportunities</div>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-green-700">
                ${totalProfitPotential.toFixed(2)}
              </div>
              <div className="text-sm text-green-600">Total Profit Potential</div>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-purple-700">
                {opportunities.length > 0 ? opportunities[0].profitPercent.toFixed(2) : '0.00'}%
              </div>
              <div className="text-sm text-purple-600">Best Opportunity</div>
            </div>
          </div>
        </div>
      </div>

      {/* Opportunities List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Current Opportunities</h3>
        
        {opportunities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No arbitrage opportunities found above the minimum profit threshold.</p>
            <p className="text-sm mt-2">Try lowering the minimum profit threshold or wait for price changes.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {opportunities.map((opp, index) => (
              <div key={opp.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <span className="font-semibold text-gray-800">#{index + 1}</span>
                      <span className="text-sm text-gray-600">{opp.pair}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(opp.riskLevel)}`}>
                        {opp.riskLevel} Risk
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Buy on</div>
                        <div className="font-medium text-green-600">{opp.buyDex}</div>
                        <div className="font-mono">${opp.buyPrice}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Sell on</div>
                        <div className="font-medium text-red-600">{opp.sellDex}</div>
                        <div className="font-mono">${opp.sellPrice}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Gross Profit</div>
                        <div className="font-medium text-blue-600">${opp.profit.toFixed(4)}</div>
                        <div className="text-xs text-gray-500">{opp.profitPercent.toFixed(2)}%</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Net Profit</div>
                        <div className="font-medium text-purple-600">${opp.netProfit.toFixed(2)}</div>
                        <div className="text-xs text-gray-500">After gas: ${opp.gasEstimate.toFixed(0)}</div>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => executeArbitrage(opp)}
                    className="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
                  >
                    Execute
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Educational Note */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-semibold text-yellow-800 mb-2">💡 Educational Note</h4>
        <p className="text-sm text-yellow-700">
          Arbitrage opportunities exist when the same asset trades at different prices across exchanges. 
          In real trading, consider gas fees, slippage, and execution time. This simulator shows theoretical 
          profits before accounting for all real-world constraints.
        </p>
      </div>
    </div>
  );
};

export default ArbitrageDetector;