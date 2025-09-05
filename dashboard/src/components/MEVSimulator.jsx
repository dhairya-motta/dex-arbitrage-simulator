import React, { useState, useEffect } from 'react';
import { Zap, Target, Shield, Play, Pause, RotateCcw } from 'lucide-react';
import { MEV_STRATEGIES, generateMockTransactions } from '../data/dexData';

const MEVSimulator = () => {
  const [selectedStrategy, setSelectedStrategy] = useState('SANDWICH');
  const [isSimulating, setIsSimulating] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [mevResults, setMevResults] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [simulationSpeed, setSimulationSpeed] = useState(1000);

  useEffect(() => {
    setTransactions(generateMockTransactions(20));
  }, []);

  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      simulateMEVStrategy();
    }, simulationSpeed);

    return () => clearInterval(interval);
  }, [isSimulating, selectedStrategy, simulationSpeed]);

  const simulateMEVStrategy = () => {
    const strategy = MEV_STRATEGIES[selectedStrategy];
    const targetTx = transactions.find(tx => tx.mevOpportunity && !tx.exploited);
    
    if (!targetTx) return;

    // Mark transaction as exploited
    setTransactions(prev => prev.map(tx => 
      tx.id === targetTx.id ? { ...tx, exploited: true } : tx
    ));

    // Create MEV result
    const mevResult = {
      id: `mev_${Date.now()}`,
      strategy: selectedStrategy,
      targetTx: targetTx.id,
      profit: calculateMEVProfit(selectedStrategy, targetTx),
      gasUsed: Math.floor(Math.random() * 200000 + 100000),
      gasPrice: targetTx.gasPrice + Math.floor(Math.random() * 50 + 10),
      success: Math.random() > 0.2, // 80% success rate
      timestamp: Date.now(),
      steps: strategy.steps
    };

    setMevResults(prev => [mevResult, ...prev.slice(0, 9)]); // Keep last 10 results
  };

  const calculateMEVProfit = (strategy, targetTx) => {
    const baseProfit = parseFloat(targetTx.potentialProfit) || 0;
    
    switch (strategy) {
      case 'SANDWICH':
        return baseProfit * (0.3 + Math.random() * 0.4); // 30-70% of potential
      case 'FRONTRUNNING':
        return baseProfit * (0.2 + Math.random() * 0.3); // 20-50% of potential
      case 'ARBITRAGE':
        return baseProfit * (0.8 + Math.random() * 0.2); // 80-100% of potential
      default:
        return baseProfit * 0.5;
    }
  };

  const startSimulation = () => {
    setIsSimulating(true);
    setCurrentStep(0);
  };

  const stopSimulation = () => {
    setIsSimulating(false);
  };

  const resetSimulation = () => {
    setIsSimulating(false);
    setMevResults([]);
    setCurrentStep(0);
    setTransactions(generateMockTransactions(20));
  };

  const getStrategyIcon = (strategy) => {
    switch (strategy) {
      case 'SANDWICH': return <Target className="h-5 w-5" />;
      case 'FRONTRUNNING': return <Zap className="h-5 w-5" />;
      case 'ARBITRAGE': return <Shield className="h-5 w-5" />;
      default: return <Zap className="h-5 w-5" />;
    }
  };

  const getSuccessColor = (success) => success ? 'text-green-600' : 'text-red-600';
  const getSuccessIcon = (success) => success ? '✅' : '❌';

  const totalProfit = mevResults.reduce((sum, result) => 
    sum + (result.success ? result.profit : 0), 0
  );

  const successRate = mevResults.length > 0 
    ? (mevResults.filter(r => r.success).length / mevResults.length * 100).toFixed(1)
    : 0;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <Zap className="mr-2 text-purple-600" />
          MEV Strategy Simulator
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={isSimulating ? stopSimulation : startSimulation}
            className={`px-4 py-2 rounded-md font-medium flex items-center space-x-2 ${
              isSimulating 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {isSimulating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            <span>{isSimulating ? 'Stop' : 'Start'}</span>
          </button>
          <button
            onClick={resetSimulation}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md font-medium flex items-center space-x-2"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Strategy Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Select MEV Strategy</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(MEV_STRATEGIES).map(([key, strategy]) => (
            <div
              key={key}
              onClick={() => setSelectedStrategy(key)}
              className={`cursor-pointer border-2 rounded-lg p-4 transition-all ${
                selectedStrategy === key
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center mb-2">
                {getStrategyIcon(key)}
                <h4 className="ml-2 font-semibold text-gray-800">{strategy.name}</h4>
              </div>
              <p className="text-sm text-gray-600 mb-2">{strategy.description}</p>
              <div className="flex justify-between text-xs">
                <span className={`px-2 py-1 rounded ${
                  strategy.riskLevel === 'Low' ? 'bg-green-100 text-green-800' :
                  strategy.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {strategy.riskLevel} Risk
                </span>
                <span className="text-gray-500">{strategy.profitability}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strategy Steps */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Strategy Steps</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <ol className="space-y-2">
            {MEV_STRATEGIES[selectedStrategy].steps.map((step, index) => (
              <li key={index} className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
                  {index + 1}
                </span>
                <span className="text-gray-700">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-700">{mevResults.length}</div>
          <div className="text-sm text-blue-600">Attempts</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-700">${totalProfit.toFixed(2)}</div>
          <div className="text-sm text-green-600">Total Profit</div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-700">{successRate}%</div>
          <div className="text-sm text-purple-600">Success Rate</div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-orange-700">
            {transactions.filter(tx => tx.mevOpportunity && !tx.exploited).length}
          </div>
          <div className="text-sm text-orange-600">Opportunities Left</div>
        </div>
      </div>

      {/* Simulation Results */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Recent MEV Executions</h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {mevResults.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Zap className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No MEV executions yet. Start the simulation to see results.</p>
            </div>
          ) : (
            mevResults.map((result, index) => (
              <div key={result.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-gray-800">#{mevResults.length - index}</span>
                    <span className="text-sm text-gray-600">{MEV_STRATEGIES[result.strategy].name}</span>
                    <span className="text-lg">{getSuccessIcon(result.success)}</span>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${getSuccessColor(result.success)}`}>
                      {result.success ? `+$${result.profit.toFixed(2)}` : '$0.00'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Gas Used:</span> {result.gasUsed.toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">Gas Price:</span> {result.gasPrice} gwei
                  </div>
                  <div>
                    <span className="font-medium">Target:</span> {result.targetTx}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Simulation Speed:</label>
          <select
            value={simulationSpeed}
            onChange={(e) => setSimulationSpeed(Number(e.target.value))}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value={500}>Fast (0.5s)</option>
            <option value={1000}>Normal (1s)</option>
            <option value={2000}>Slow (2s)</option>
            <option value={5000}>Very Slow (5s)</option>
          </select>
        </div>
        
        <div className="text-sm text-gray-600">
          Status: <span className={`font-medium ${isSimulating ? 'text-green-600' : 'text-gray-600'}`}>
            {isSimulating ? 'Running' : 'Stopped'}
          </span>
        </div>
      </div>

      {/* Educational Warning */}
      <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
        <h4 className="font-semibold text-red-800 mb-2">⚠️ Educational Disclaimer</h4>
        <p className="text-sm text-red-700">
          This is a simulation for educational purposes only. Real MEV strategies can be complex, 
          risky, and may impact other users negatively. Always consider the ethical implications 
          and potential risks before implementing any trading strategies.
        </p>
      </div>
    </div>
  );
};

export default MEVSimulator;