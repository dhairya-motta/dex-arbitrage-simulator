# MEV & Arbitrage Simulator - Implementation Plan

## Core Files to Create/Modify:

1. **src/data/dexData.js** - Mock DEX data, price feeds, and trading pairs
2. **src/components/DEXSimulator.jsx** - Main DEX price simulator with AMM pricing
3. **src/components/ArbitrageDetector.jsx** - Arbitrage opportunity detection logic
4. **src/components/MEVSimulator.jsx** - MEV strategy demonstrations (sandwich, front-running)
5. **src/components/TradingDashboard.jsx** - Real-time visualization dashboard
6. **src/components/EducationalPanel.jsx** - Educational content about MEV and arbitrage
7. **src/components/PriceChart.jsx** - Price visualization with spread indicators
8. **src/App.jsx** - Updated main app with new layout

## Key Features:
- Simulated AMM pricing with configurable spreads
- Real-time arbitrage opportunity detection
- MEV strategy visualization (sandwich attacks, front-running)
- Interactive trading simulation
- Educational tooltips and explanations
- Multiple DEX price comparison
- Profit calculation and visualization

## Implementation Strategy:
- Use React hooks for state management
- Implement realistic AMM pricing formulas
- Create educational overlays and tooltips
- Add interactive controls for strategy parameters
- Use Recharts for data visualization