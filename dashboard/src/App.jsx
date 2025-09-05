import React, { useState } from 'react';
import DEXSimulator from './components/DEXSimulator';
import ArbitrageDetector from './components/ArbitrageDetector';
import MEVSimulator from './components/MEVSimulator';
import TradingDashboard from './components/TradingDashboard';
import EducationalPanel from './components/EducationalPanel';
import PriceChart from './components/PriceChart';

function App() {
  const [currentPrices, setCurrentPrices] = useState([]);
  const [activeTab, setActiveTab] = useState('simulator');

  const handlePriceUpdate = (newPrices) => {
    setCurrentPrices(newPrices);
  };

  const tabs = [
    { id: 'simulator', name: 'DEX Simulator', icon: '🔄' },
    { id: 'arbitrage', name: 'Arbitrage', icon: '⚡' },
    { id: 'mev', name: 'MEV Strategies', icon: '🎯' },
    { id: 'dashboard', name: 'Dashboard', icon: '📊' },
    { id: 'education', name: 'Learn', icon: '📚' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">🚀</div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">MEV & Arbitrage Simulator</h1>
                <p className="text-sm text-gray-600">Educational DeFi Trading Simulator</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Status:</span>
                <span className={`ml-1 ${currentPrices.length > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                  {currentPrices.length > 0 ? 'Live Data' : 'No Data'}
                </span>
              </div>
              <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'simulator' && (
          <div className="space-y-8">
            <DEXSimulator onPriceUpdate={handlePriceUpdate} />
            {currentPrices.length > 0 && (
              <PriceChart data={[]} selectedPair="ETH/USDC" />
            )}
          </div>
        )}

        {activeTab === 'arbitrage' && (
          <div className="space-y-8">
            <ArbitrageDetector prices={currentPrices} />
            {currentPrices.length === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                <div className="text-yellow-600 mb-2">⚠️ No Price Data</div>
                <p className="text-yellow-700">
                  Please start the DEX Simulator first to generate price data for arbitrage detection.
                </p>
                <button
                  onClick={() => setActiveTab('simulator')}
                  className="mt-3 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md font-medium"
                >
                  Go to DEX Simulator
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'mev' && (
          <div className="space-y-8">
            <MEVSimulator />
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <TradingDashboard prices={currentPrices} />
            {currentPrices.length === 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                <div className="text-blue-600 mb-2">📊 Dashboard Ready</div>
                <p className="text-blue-700">
                  Start the DEX Simulator to see real-time trading data and analytics.
                </p>
                <button
                  onClick={() => setActiveTab('simulator')}
                  className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium"
                >
                  Start Simulation
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'education' && (
          <div className="space-y-8">
            <EducationalPanel />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">About This Simulator</h3>
              <p className="text-gray-600 text-sm">
                An educational tool for understanding MEV strategies, arbitrage opportunities, 
                and DeFi trading mechanics. All simulations use mock data for learning purposes.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Features</h3>
              <ul className="text-gray-600 text-sm space-y-1">
                <li>• Real-time DEX price simulation</li>
                <li>• Arbitrage opportunity detection</li>
                <li>• MEV strategy demonstrations</li>
                <li>• Interactive trading dashboard</li>
                <li>• Comprehensive educational content</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Disclaimer</h3>
              <p className="text-gray-600 text-sm">
                This simulator is for educational purposes only. Real trading involves significant 
                risks and should only be undertaken with proper knowledge and risk management.
              </p>
              <div className="mt-4 flex space-x-4 text-xs text-gray-500">
                <span>🔒 Educational Use Only</span>
                <span>📚 Learn Responsibly</span>
                <span>⚠️ Not Financial Advice</span>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
            <p>© 2024 MEV & Arbitrage Simulator - Built for Educational Purposes</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;