// Mock DEX data with realistic AMM pricing simulation
export const TRADING_PAIRS = [
  { symbol: 'ETH/USDC', baseToken: 'ETH', quoteToken: 'USDC' },
  { symbol: 'WBTC/ETH', baseToken: 'WBTC', quoteToken: 'ETH' },
  { symbol: 'UNI/ETH', baseToken: 'UNI', quoteToken: 'ETH' },
  { symbol: 'LINK/USDC', baseToken: 'LINK', quoteToken: 'USDC' },
];

export const DEX_PLATFORMS = [
  { name: 'UniswapV3', fee: 0.003, liquidity: 'High', color: '#FF007A' },
  { name: 'SushiSwap', fee: 0.003, liquidity: 'Medium', color: '#0E4F99' },
  { name: 'PancakeSwap', fee: 0.0025, liquidity: 'Medium', color: '#1FC7D4' },
  { name: '1inch', fee: 0.002, liquidity: 'Low', color: '#94A3B8' },
];

// Market state to maintain continuity and trends
let marketState = {
  'ETH/USDC': {
    basePrice: 2000,
    trend: 0, // -1 to 1, where -1 is strong bearish, 1 is strong bullish
    momentum: 0,
    volatility: 0.001, // Start with low volatility
    volume: 0,
    lastPrices: {},
    trendDuration: 0,
    marketMaturity: 0 // 0 to 1, how developed the market is
  },
  'WBTC/ETH': {
    basePrice: 15.5,
    trend: 0,
    momentum: 0,
    volatility: 0.001,
    volume: 0,
    lastPrices: {},
    trendDuration: 0,
    marketMaturity: 0
  },
  'UNI/ETH': {
    basePrice: 0.003,
    trend: 0,
    momentum: 0,
    volatility: 0.001,
    volume: 0,
    lastPrices: {},
    trendDuration: 0,
    marketMaturity: 0
  },
  'LINK/USDC': {
    basePrice: 12.5,
    trend: 0,
    momentum: 0,
    volatility: 0.001,
    volume: 0,
    lastPrices: {},
    trendDuration: 0,
    marketMaturity: 0
  }
};

// Simulated price data with gradual market building
export const generateMockPrices = (pair, timestamp = Date.now()) => {
  const state = marketState[pair];
  if (!state) return [];

  // Gradually increase market maturity over time
  state.marketMaturity = Math.min(1, state.marketMaturity + 0.002);
  
  // Evolve market trend naturally
  evolveTrend(state);
  
  // Gradually increase volatility as market matures
  const maxVolatility = 0.02; // 2% max volatility
  state.volatility = 0.001 + (state.marketMaturity * maxVolatility * 0.5);
  
  return DEX_PLATFORMS.map((dex, index) => {
    // Get or initialize last price for this DEX
    if (!state.lastPrices[dex.name]) {
      // Start with slight variations around base price
      const initialVariation = (Math.random() - 0.5) * 0.005; // 0.5% initial variation
      state.lastPrices[dex.name] = state.basePrice * (1 + initialVariation);
    }
    
    const lastPrice = state.lastPrices[dex.name];
    
    // Calculate price movement based on trend and momentum
    const trendInfluence = state.trend * 0.001 * state.marketMaturity; // Stronger trends as market matures
    const momentumInfluence = state.momentum * 0.0005;
    const randomWalk = (Math.random() - 0.5) * state.volatility;
    
    // Liquidity effects - less liquid DEXs have more price deviation
    const liquidityMultiplier = dex.liquidity === 'High' ? 1 : 
                               dex.liquidity === 'Medium' ? 1.001 : 1.002;
    
    // DEX-specific lag (some DEXs react slower to market movements)
    const lagFactor = index * 0.1; // Each DEX has slight delay
    const adjustedTrend = state.trend * (1 - lagFactor * 0.3);
    
    // Calculate new price with smooth transitions
    const priceChange = trendInfluence + momentumInfluence + randomWalk + (adjustedTrend * 0.0002);
    const newPrice = lastPrice * (1 + priceChange) * liquidityMultiplier;
    
    // Ensure price doesn't deviate too much from base price early on
    const maxDeviation = 0.05 + (state.marketMaturity * 0.15); // 5% to 20% max deviation
    const clampedPrice = Math.max(
      state.basePrice * (1 - maxDeviation),
      Math.min(state.basePrice * (1 + maxDeviation), newPrice)
    );
    
    // Update last price
    state.lastPrices[dex.name] = clampedPrice;
    
    // Calculate spread based on volatility and liquidity
    const baseSpread = clampedPrice * (dex.fee + state.volatility * 0.5);
    const spread = baseSpread * (dex.liquidity === 'High' ? 0.8 : 
                                dex.liquidity === 'Medium' ? 1.2 : 1.8);
    
    // Volume grows with market maturity and volatility
    const baseVolume = 100000 * state.marketMaturity;
    const volatilityBonus = state.volatility * 1000000;
    const volume24h = baseVolume + volatilityBonus + (Math.random() * baseVolume * 0.5);
    
    // Liquidity grows over time
    const baseLiquidity = 1000000 * state.marketMaturity;
    const liquidity = baseLiquidity * (dex.liquidity === 'High' ? 2 : 
                                     dex.liquidity === 'Medium' ? 1.5 : 1);
    
    return {
      dex: dex.name,
      pair,
      price: Number(clampedPrice.toFixed(6)),
      bid: Number((clampedPrice - spread/2).toFixed(6)),
      ask: Number((clampedPrice + spread/2).toFixed(6)),
      spread: Number(spread.toFixed(6)),
      volume24h: Math.floor(volume24h),
      liquidity: Math.floor(liquidity),
      fee: dex.fee,
      color: dex.color,
      timestamp,
      marketMaturity: state.marketMaturity,
      trend: state.trend
    };
  });
};

// Evolve market trend naturally over time
function evolveTrend(state) {
  state.trendDuration++;
  
  // Chance to change trend direction (higher chance as trend gets older)
  const changeChance = Math.min(0.1, state.trendDuration * 0.001);
  
  if (Math.random() < changeChance) {
    // New trend direction
    const trendStrength = Math.random() * 0.8 - 0.4; // -0.4 to 0.4
    state.trend = trendStrength;
    state.trendDuration = 0;
    
    // Reset momentum when trend changes
    state.momentum = state.trend * 0.3;
  } else {
    // Gradually evolve existing trend
    const evolution = (Math.random() - 0.5) * 0.1;
    state.trend = Math.max(-1, Math.min(1, state.trend + evolution));
    
    // Momentum follows trend with some lag
    const momentumTarget = state.trend * 0.5;
    state.momentum += (momentumTarget - state.momentum) * 0.1;
  }
  
  // Add some market events occasionally
  if (Math.random() < 0.005 * state.marketMaturity) { // 0.5% chance when mature
    triggerMarketEvent(state);
  }
}

// Simulate market events (news, large trades, etc.)
function triggerMarketEvent(state) {
  const eventTypes = ['bullish_news', 'bearish_news', 'whale_trade', 'technical_breakout'];
  const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
  
  switch (eventType) {
    case 'bullish_news':
      state.trend = Math.min(1, state.trend + 0.3);
      state.volatility = Math.min(0.03, state.volatility * 1.5);
      break;
    case 'bearish_news':
      state.trend = Math.max(-1, state.trend - 0.3);
      state.volatility = Math.min(0.03, state.volatility * 1.5);
      break;
    case 'whale_trade':
      state.volatility = Math.min(0.03, state.volatility * 2);
      state.momentum = state.momentum * 1.5;
      break;
    case 'technical_breakout':
      state.trend = state.trend > 0 ? Math.min(1, state.trend * 1.3) : Math.max(-1, state.trend * 1.3);
      break;
  }
}

// Reset market state (useful for starting fresh)
export const resetMarketState = () => {
  Object.keys(marketState).forEach(pair => {
    const state = marketState[pair];
    state.trend = 0;
    state.momentum = 0;
    state.volatility = 0.001;
    state.volume = 0;
    state.lastPrices = {};
    state.trendDuration = 0;
    state.marketMaturity = 0;
  });
};

// Get market insights for educational purposes
export const getMarketInsights = (pair) => {
  const state = marketState[pair];
  if (!state) return null;
  
  return {
    maturity: Math.floor(state.marketMaturity * 100),
    trendDirection: state.trend > 0.1 ? 'Bullish' : state.trend < -0.1 ? 'Bearish' : 'Sideways',
    trendStrength: Math.abs(state.trend),
    volatility: state.volatility,
    phase: state.marketMaturity < 0.3 ? 'Early Development' :
           state.marketMaturity < 0.7 ? 'Growing Market' : 'Mature Market'
  };
};

// MEV strategy templates (unchanged)
export const MEV_STRATEGIES = {
  SANDWICH: {
    name: 'Sandwich Attack',
    description: 'Place trades before and after a large transaction to profit from price impact',
    steps: [
      'Detect large pending transaction in mempool',
      'Place buy order with higher gas to execute first',
      'Target transaction executes at worse price',
      'Place sell order to capture profit'
    ],
    riskLevel: 'High',
    profitability: 'Medium-High'
  },
  FRONTRUNNING: {
    name: 'Front-running',
    description: 'Execute similar trades ahead of detected transactions',
    steps: [
      'Monitor mempool for profitable transactions',
      'Copy transaction with higher gas fee',
      'Execute before original transaction',
      'Profit from first-mover advantage'
    ],
    riskLevel: 'Medium',
    profitability: 'Medium'
  },
  ARBITRAGE: {
    name: 'Cross-DEX Arbitrage',
    description: 'Exploit price differences between different exchanges',
    steps: [
      'Monitor prices across multiple DEXs',
      'Identify profitable price discrepancies',
      'Execute simultaneous buy/sell orders',
      'Capture risk-free profit from price difference'
    ],
    riskLevel: 'Low',
    profitability: 'Low-Medium'
  }
};

// Generate realistic transaction data
export const generateMockTransactions = (count = 50) => {
  const types = ['swap', 'add_liquidity', 'remove_liquidity'];
  const transactions = [];
  
  for (let i = 0; i < count; i++) {
    const pair = TRADING_PAIRS[Math.floor(Math.random() * TRADING_PAIRS.length)];
    const dex = DEX_PLATFORMS[Math.floor(Math.random() * DEX_PLATFORMS.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    const state = marketState[pair.symbol];
    
    // Transaction size and MEV opportunity based on market maturity
    const baseAmount = 10 + (state?.marketMaturity || 0) * 1000;
    const amount = baseAmount * (1 + Math.random());
    
    transactions.push({
      id: `tx_${i}`,
      type,
      pair: pair.symbol,
      dex: dex.name,
      amount: amount.toFixed(4),
      price: (Math.random() * 2000 + 1000).toFixed(2),
      gasPrice: Math.floor(Math.random() * 100 + 20),
      timestamp: Date.now() - Math.random() * 3600000,
      mevOpportunity: Math.random() > (0.9 - (state?.marketMaturity || 0) * 0.2), // More opportunities as market matures
      potentialProfit: Math.random() > 0.7 ? (Math.random() * 500 * (state?.marketMaturity || 0.1)).toFixed(2) : null
    });
  }
  
  return transactions.sort((a, b) => b.timestamp - a.timestamp);
};