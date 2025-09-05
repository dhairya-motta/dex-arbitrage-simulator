import React, { useState } from 'react';
import { BookOpen, HelpCircle, AlertTriangle, Lightbulb, ChevronDown, ChevronRight } from 'lucide-react';

const EducationalPanel = () => {
  const [activeSection, setActiveSection] = useState('arbitrage');
  const [expandedTopics, setExpandedTopics] = useState({});

  const toggleTopic = (topicId) => {
    setExpandedTopics(prev => ({
      ...prev,
      [topicId]: !prev[topicId]
    }));
  };

  const educationalContent = {
    arbitrage: {
      title: 'Arbitrage Trading',
      icon: <Lightbulb className="h-5 w-5" />,
      topics: [
        {
          id: 'what-is-arbitrage',
          title: 'What is Arbitrage?',
          content: `Arbitrage is the practice of taking advantage of price differences for the same asset across different markets or exchanges. In DeFi, this typically involves buying a token on one DEX where it's cheaper and selling it on another DEX where it's more expensive.

Key characteristics:
• Risk-free profit (in theory)
• Requires quick execution
• Helps maintain price equilibrium across markets
• Profits decrease as markets become more efficient`
        },
        {
          id: 'types-of-arbitrage',
          title: 'Types of Arbitrage',
          content: `1. **Cross-Exchange Arbitrage**: Trading between different DEXs
2. **Triangular Arbitrage**: Using three different trading pairs to create a profit loop
3. **Statistical Arbitrage**: Using mathematical models to identify price discrepancies
4. **Flash Loan Arbitrage**: Using flash loans to execute large arbitrage trades without initial capital`
        },
        {
          id: 'arbitrage-risks',
          title: 'Risks and Considerations',
          content: `While arbitrage is theoretically risk-free, real-world factors introduce risks:

• **Gas Fees**: High transaction costs can eliminate profits
• **Slippage**: Large trades can move prices unfavorably
• **Failed Transactions**: Network congestion can cause failed trades
• **Competition**: MEV bots compete for the same opportunities
• **Smart Contract Risk**: Bugs in DEX contracts can cause losses`
        }
      ]
    },
    mev: {
      title: 'Maximal Extractable Value (MEV)',
      icon: <AlertTriangle className="h-5 w-5" />,
      topics: [
        {
          id: 'what-is-mev',
          title: 'What is MEV?',
          content: `MEV (Maximal Extractable Value) refers to the maximum value that can be extracted from block production in excess of the standard block reward and gas fees by including, excluding, and changing the order of transactions in a block.

MEV was previously called "Miner Extractable Value" but the term evolved as Ethereum moved to Proof of Stake, where validators (not miners) propose blocks.

Common MEV strategies include:
• Front-running
• Back-running  
• Sandwich attacks
• Liquidations
• Arbitrage`
        },
        {
          id: 'sandwich-attacks',
          title: 'Sandwich Attacks',
          content: `A sandwich attack occurs when a trader places two transactions around a victim's transaction to profit from the price impact.

**How it works:**
1. Attacker sees a large buy order in the mempool
2. Attacker places a buy order with higher gas to execute first
3. Victim's transaction executes at a worse price due to slippage
4. Attacker immediately sells at the inflated price

**Impact:**
• Increases costs for regular traders
• Can be considered a form of value extraction
• Creates MEV opportunities for sophisticated actors`
        },
        {
          id: 'frontrunning',
          title: 'Front-running',
          content: `Front-running involves copying a pending transaction and submitting it with a higher gas price to execute first.

**Common scenarios:**
• Copying profitable DEX trades
• Front-running liquidations
• Extracting value from oracle updates
• Gaming governance proposals

**Prevention methods:**
• Commit-reveal schemes
• Private mempools
• Batch auctions
• MEV-protection services`
        },
        {
          id: 'mev-protection',
          title: 'MEV Protection',
          content: `Several solutions exist to protect users from MEV:

**Technical Solutions:**
• Flashbots Protect: Private mempool for transactions
• CowSwap: Batch auctions and MEV protection
• 1inch Fusion: MEV-protected swaps
• Private Relayers: Keep transactions private until execution

**Protocol-Level Solutions:**
• MEV-Boost: Democratizes MEV extraction
• Proposer-Builder Separation: Separates block building from validation
• Encrypted Mempools: Hide transaction details until execution`
        }
      ]
    },
    amm: {
      title: 'Automated Market Makers (AMM)',
      icon: <HelpCircle className="h-5 w-5" />,
      topics: [
        {
          id: 'how-amms-work',
          title: 'How AMMs Work',
          content: `Automated Market Makers use mathematical formulas to price assets and facilitate trades without traditional order books.

**Key Concepts:**
• **Liquidity Pools**: Pairs of tokens locked in smart contracts
• **Constant Product Formula**: x * y = k (Uniswap V2)
• **Price Impact**: Larger trades cause more price movement
• **Slippage**: Difference between expected and actual execution price

**Popular AMM Models:**
• Constant Product (Uniswap)
• Constant Sum (suitable for stablecoins)
• Constant Mean (Balancer)
• Concentrated Liquidity (Uniswap V3)`
        },
        {
          id: 'liquidity-provision',
          title: 'Liquidity Provision',
          content: `Liquidity providers (LPs) deposit tokens into pools to earn fees from trades.

**Benefits:**
• Earn trading fees (typically 0.3% per trade)
• Potential token rewards/incentives
• Passive income opportunity

**Risks:**
• **Impermanent Loss**: Loss compared to holding tokens separately
• **Smart Contract Risk**: Bugs or exploits in AMM contracts
• **Rug Pulls**: Malicious developers removing liquidity
• **Fee Competition**: Reduced returns as more LPs join`
        },
        {
          id: 'impermanent-loss',
          title: 'Impermanent Loss',
          content: `Impermanent loss occurs when the price ratio of pooled tokens changes compared to when they were deposited.

**Example:**
• Deposit 1 ETH + 2000 USDC when ETH = $2000
• ETH price rises to $4000
• Pool rebalances: you now have ~0.707 ETH + ~2828 USDC
• Value: $5656 vs $6000 if held separately
• Impermanent loss: $344 (6.1%)

**Mitigation:**
• Choose correlated assets (e.g., stablecoins)
• Consider fee earnings vs. impermanent loss
• Use concentrated liquidity positions strategically`
        }
      ]
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-6">
        <BookOpen className="mr-2 text-indigo-600" />
        <h2 className="text-2xl font-bold text-gray-800">Educational Center</h2>
      </div>

      {/* Section Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {Object.entries(educationalContent).map(([key, section]) => (
          <button
            key={key}
            onClick={() => setActiveSection(key)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${
              activeSection === key
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {section.icon}
            <span>{section.title}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-4">
        {educationalContent[activeSection].topics.map((topic) => (
          <div key={topic.id} className="border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleTopic(topic.id)}
              className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <h3 className="text-lg font-semibold text-gray-800">{topic.title}</h3>
              {expandedTopics[topic.id] ? (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-500" />
              )}
            </button>
            
            {expandedTopics[topic.id] && (
              <div className="px-6 pb-4">
                <div className="prose prose-sm max-w-none text-gray-700">
                  {topic.content.split('\n').map((paragraph, index) => {
                    if (paragraph.trim() === '') return null;
                    
                    // Handle bold text
                    if (paragraph.includes('**')) {
                      const parts = paragraph.split('**');
                      return (
                        <p key={index} className="mb-3">
                          {parts.map((part, i) => 
                            i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                          )}
                        </p>
                      );
                    }
                    
                    // Handle bullet points
                    if (paragraph.trim().startsWith('•')) {
                      return (
                        <div key={index} className="ml-4 mb-2 flex items-start">
                          <span className="text-indigo-600 mr-2">•</span>
                          <span>{paragraph.trim().substring(1).trim()}</span>
                        </div>
                      );
                    }
                    
                    // Handle numbered lists
                    if (/^\d+\./.test(paragraph.trim())) {
                      return (
                        <div key={index} className="ml-4 mb-2">
                          {paragraph.trim()}
                        </div>
                      );
                    }
                    
                    // Regular paragraphs
                    return (
                      <p key={index} className="mb-3">
                        {paragraph.trim()}
                      </p>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Tips */}
      <div className="mt-8 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg">
        <h4 className="font-semibold text-indigo-800 mb-2 flex items-center">
          <Lightbulb className="h-4 w-4 mr-2" />
          Quick Tips for Safe Trading
        </h4>
        <ul className="text-sm text-indigo-700 space-y-1">
          <li>• Always understand the risks before executing any strategy</li>
          <li>• Start with small amounts when testing new strategies</li>
          <li>• Monitor gas fees - they can eliminate arbitrage profits</li>
          <li>• Use MEV protection services when making large trades</li>
          <li>• Keep up with the latest DeFi security best practices</li>
        </ul>
      </div>

      {/* Glossary */}
      <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-3">Key Terms Glossary</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <strong className="text-gray-700">Slippage:</strong>
            <span className="text-gray-600 ml-1">Price difference between expected and actual execution</span>
          </div>
          <div>
            <strong className="text-gray-700">Liquidity:</strong>
            <span className="text-gray-600 ml-1">Available tokens in a trading pool</span>
          </div>
          <div>
            <strong className="text-gray-700">Gas Fee:</strong>
            <span className="text-gray-600 ml-1">Cost to execute transactions on Ethereum</span>
          </div>
          <div>
            <strong className="text-gray-700">Mempool:</strong>
            <span className="text-gray-600 ml-1">Pool of pending transactions waiting to be processed</span>
          </div>
          <div>
            <strong className="text-gray-700">Flash Loan:</strong>
            <span className="text-gray-600 ml-1">Uncollateralized loan that must be repaid in the same transaction</span>
          </div>
          <div>
            <strong className="text-gray-700">TVL:</strong>
            <span className="text-gray-600 ml-1">Total Value Locked in a protocol</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EducationalPanel;