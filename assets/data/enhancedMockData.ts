// Enhanced Mock Data for Nepal Stock Market App with 50+ Features

// Comprehensive Stock Data with AI Analysis
export const enhancedStockData = {
  stocks: [

  {
    symbol: 'NABIL'
    name: 'Nabil Bank Limited'
    price: 1425.50
    change: 2.5
    changePercent: 0.18
    volume: 235000
    marketCap: 128900000000
    pe: 18.2
    eps: 78.35
    dividendYield: 3.5
    high52W: 1580.00
    low52W: 1180.00
    open: 1410.00
    high: 1430.00
    low: 1405.00
    previousClose: 1390.50
    sector: 'Banking'
    subSector: 'Commercial Banks'
    beta: 1.2
    bookValue: 890.45
    priceToBook: 1.6
    roe: 15.8
    roa: 1.8
    debtToEquity: 0.85
    currentRatio: 1.45
    description: 'Nabil Bank Limited is one of the largest private sector commercial banks in Nepal providing a comprehensive range of banking services including retail banking corporate banking and investment services.'
    aiAnalysis: {
      sentiment: 'Bullish'
      confidence: 78
      summary: 'Strong fundamentals with consistent dividend payments. Banking sector showing resilience.'
      technicalSignal: 'Buy'
      supportLevel: 1380
      resistanceLevel: 1480
      targetPrice: 1520
      riskLevel: 'Medium'
      recommendation: 'Hold/Accumulate'
    }
    technicalIndicators: {
      rsi: 65.4
      macd: 12.5
      sma20: 1398.75
      sma50: 1365.20
      sma200: 1320.80
      bollingerUpper: 1450.30
      bollingerLower: 1380.20
      stochastic: 72.3
      adx: 45.2
    }
    priceHistory: Array.from({length: 365} (_ i) => ({
      date: new Date(Date.now() - (364-i) * 24 * 60 * 60 * 1000)
      open: 1425.50 + Math.random() * 100 - 50
      high: 1425.50 + Math.random() * 120 - 40
      low: 1425.50 + Math.random() * 80 - 60
      close: 1425.50 + Math.random() * 100 - 50
      volume: 200000 + Math.random() * 100000
    })
)
    financials: {
      revenue: 15600000000
      netIncome: 4200000000
      totalAssets: 285000000000
      totalLiabilities: 245000000000
      shareholderEquity: 40000000000
    }
  }
  {
    symbol: 'NICA'
    name: 'NIC Asia Bank'
    price: 890.25
    change: -1.2
    changePercent: -0.13
    volume: 185000
    marketCap: 98500000000
    pe: 15.8
    eps: 56.35
    dividendYield: 2.8
    high52W: 985.00
    low52W: 780.00
    open: 895.00
    high: 898.00
    low: 885.00
    previousClose: 901.45
    sector: 'Banking'
    subSector: 'Commercial Banks'
    beta: 1.1
    bookValue: 645.30
    priceToBook: 1.38
    roe: 14.2
    roa: 1.6
    debtToEquity: 0.92
    currentRatio: 1.35
    description: 'NIC Asia Bank is a commercial bank in Nepal offering a wide range of banking products and services.'
    aiAnalysis: {
      sentiment: 'Neutral'
      confidence: 65
      summary: 'Stable performance with moderate growth prospects. Recent dip presents buying opportunity.'
      technicalSignal: 'Hold'
      supportLevel: 850
      resistanceLevel: 920
      targetPrice: 950
      riskLevel: 'Medium'
      recommendation: 'Hold'
    }
    technicalIndicators: {
      rsi: 45.2
      macd: -5.8
      sma20: 905.40
      sma50: 912.80
      sma200: 885.60
      bollingerUpper: 925.70
      bollingerLower: 855.30
      stochastic: 38.7
      adx: 32.1
    }
    priceHistory: Array.from({length: 365} (_ i) => ({
      date: new Date(Date.now() - (364-i) * 24 * 60 * 60 * 1000)
      open: 890.25 + Math.random() * 50 - 25
      high: 890.25 + Math.random() * 60 - 20
      low: 890.25 + Math.random() * 40 - 30
      close: 890.25 + Math.random() * 50 - 25
      volume: 150000 + Math.random() * 70000
    })
)
    financials: {
      revenue: 12800000000
      netIncome: 3400000000
      totalAssets: 220000000000
      totalLiabilities: 195000000000
      shareholderEquity: 25000000000
    }
  }
  {
    symbol: 'CHCL'
    name: 'Chilime Hydropower'
    price: 512.75
    change: 3.8
    changePercent: 0.75
    volume: 125000
    marketCap: 45600000000
    pe: 22.4
    eps: 22.89
    dividendYield: 1.5
    high52W: 580.00
    low52W: 420.00
    open: 495.00
    high: 515.00
    low: 490.00
    previousClose: 493.95
    sector: 'Hydropower'
    subSector: 'Power Generation'
    beta: 1.4
    bookValue: 385.20
    priceToBook: 1.33
    roe: 12.5
    roa: 8.2
    debtToEquity: 0.45
    currentRatio: 2.1
    description: 'Chilime Hydropower Company Limited is one of the leading hydropower companies in Nepal.'
    aiAnalysis: {
      sentiment: 'Bullish'
      confidence: 82
      summary: 'Strong momentum in renewable energy sector. Government support for hydropower projects.'
      technicalSignal: 'Strong Buy'
      supportLevel: 480
      resistanceLevel: 540
      targetPrice: 580
      riskLevel: 'Medium-High'
      recommendation: 'Buy'
    }
    technicalIndicators: {
      rsi: 72.8
      macd: 18.3
      sma20: 498.60
      sma50: 485.40
      sma200: 465.80
      bollingerUpper: 535.20
      bollingerLower: 475.40
      stochastic: 78.5
      adx: 52.7
    }
    priceHistory: Array.from({length: 365} (_ i) => ({
      date: new Date(Date.now() - (364-i) * 24 * 60 * 60 * 1000)
      open: 512.75 + Math.random() * 40 - 20
      high: 512.75 + Math.random() * 50 - 15
      low: 512.75 + Math.random() * 30 - 25
      close: 512.75 + Math.random() * 40 - 20
    }]
  ]
  news: [
    {
      id: 'n1'
      title: 'Nabil Bank Reports Strong Q3 Results'
      summary: 'Net profit increased by 18% year-over-year'
      sentiment: 'Positive'
      impact: 'High'
      timestamp: new Date(Date.now() - 86400000).toISOString()
      source: 'The Kathmandu Post'
      url: 'https://kathmandupost.com/nabil-q3'
      tags: ['NABIL' 'Banking' 'Earnings']
      relatedStocks: ['NABIL']
    }
    {
      id: 'n2'
      title: 'NEPSE Index Crosses 2100 Mark'
      summary: 'Market sentiment remains bullish as NEPSE gains momentum.'
      sentiment: 'Positive'
      impact: 'High'
      timestamp: new Date(Date.now() - 2 * 86400000).toISOString()
      source: 'ShareSansar'
      url: 'https://sharesansar.com/nepse-2100'
      tags: ['NEPSE' 'Market' 'Index']
      relatedStocks: []
    }
    {
      id: 'n3'
      title: 'Hydropower Sector Sees Increased Investment'
      summary: 'New projects announced to boost energy production.'
      sentiment: 'Positive'
      impact: 'Medium'
      timestamp: new Date(Date.now() - 5 * 86400000).toISOString()
      source: 'OnlineKhabar'
      url: 'https://onlinekhabar.com/hydropower-investment'
      tags: ['Hydropower' 'Investment' 'Energy']
      relatedStocks: ['CHCL' 'BPCL']
    }
    {
      id: 'n4'
      title: 'Banking Sector Liquidity Tightens'
      summary: 'Banks facing challenges with loanable funds.'
      sentiment: 'Negative'
      impact: 'High'
      timestamp: new Date(Date.now() - 10 * 86400000).toISOString()
      source: 'MyRepublica'
      url: 'https://myrepublica.nagariknetwork.com/banking-liquidity'
      tags: ['Banking' 'Economy' 'Liquidity']
      relatedStocks: ['NABIL' 'NICA']
    }
    {
      id: 'n5'
      title: 'Insurance Companies Announce Dividends'
      summary: 'Several insurance firms declare attractive dividends for shareholders.'
      sentiment: 'Positive'
      impact: 'Medium'
      timestamp: new Date(Date.now() - 15 * 86400000).toISOString()
      source: 'Bizmandu'
      url: 'https://bizmandu.com/insurance-dividends'
      tags: ['Insurance' 'Dividend']
      relatedStocks: ['NLIC' 'SIC']
    }
  }
  aiAnalysis: [
    {
      id: 'a1'
      stockSymbol: 'NABIL'
      timestamp: new Date(Date.now() - 86400000).toISOString()
      summary: 'NABIL Bank shows strong financial health with consistent growth in net profit. Technical indicators suggest a bullish trend making it a good long-term hold. Key risks include potential interest rate fluctuations.'
      recommendation: 'Buy'
      riskLevel: 'Medium'
      targetPrice: 1550
      keyPoints: [
        '18% Y-o-Y net profit growth'
        'Strong technical buy signals (RSI MACD)'
        'Consistent dividend payer'
        'Potential for further market share gain'
      }      technicalSignal: 'Hold'
      supportLevel: 375
      resistanceLevel: 400
      targetPrice: 410
      riskLevel: 'Medium'
      recommendation: 'Hold'
    }
    technicalIndicators: {
      rsi: 42.3
      macd: -3.2
      sma20: 390.80
      sma50: 395.60
      sma200: 385.40
      bollingerUpper: 405.30
      bollingerLower: 370.90
      stochastic: 35.8
      adx: 28.4
    }
    priceHistory: Array.from({length: 365} (_ i) => ({
      date: new Date(Date.now() - (364-i) * 24 * 60 * 60 * 1000)
      open: 385.60 + Math.random() * 30 - 15
      high: 385.60 + Math.random() * 40 - 10
      low: 385.60 + Math.random() * 20 - 20
      close: 385.60 + Math.random() * 30 - 15
      volume: 140000 + Math.random() * 60000
    })
)
    news: []
    financials: {
      revenue: 8900000000
      netIncome: 2100000000
      totalAssets: 165000000000
      totalLiabilities: 145000000000
      shareholderEquity: 20000000000
    }
  }
  ]
      sentiment: 'Positive'
      analyst: 'AI Analyst Pro'
    }
    {
      id: 'a2'
      stockSymbol: 'NEPSE'
      timestamp: new Date(Date.now() - 3 * 86400000).toISOString()
      summary: 'The NEPSE index is currently in an uptrend supported by increased investor confidence and liquidity. However caution is advised as profit booking might occur at higher levels. Key resistance at 2150 points.'
      recommendation: 'Neutral'
      riskLevel: 'Low'
      targetPrice: 2150
      keyPoints: [
        'Index showing strong upward momentum'
        'Increased market participation'
        'Potential for short-term corrections'
        'Economic indicators remain stable'
      }      technicalSignal: 'Hold'
      supportLevel: 375
      resistanceLevel: 400
      targetPrice: 410
      riskLevel: 'Medium'
      recommendation: 'Hold'
    }
    technicalIndicators: {
      rsi: 42.3
      macd: -3.2
      sma20: 390.80
      sma50: 395.60
      sma200: 385.40
      bollingerUpper: 405.30
      bollingerLower: 370.90
      stochastic: 35.8
      adx: 28.4
    }
    priceHistory: Array.from({length: 365} (_ i) => ({
      date: new Date(Date.now() - (364-i) * 24 * 60 * 60 * 1000)
      open: 385.60 + Math.random() * 30 - 15
      high: 385.60 + Math.random() * 40 - 10
      low: 385.60 + Math.random() * 20 - 20
      close: 385.60 + Math.random() * 30 - 15
      volume: 140000 + Math.random() * 60000
    })
)
    news: []
    financials: {
      revenue: 8900000000
      netIncome: 2100000000
      totalAssets: 165000000000
      totalLiabilities: 145000000000
      shareholderEquity: 20000000000
    }
  }
  ]
      sentiment: 'Neutral'
      analyst: 'AI Market Insights'
    }
    {
      id: 'a3'
      stockSymbol: 'CHCL'
      timestamp: new Date(Date.now() - 7 * 86400000).toISOString()
      summary: 'Chilime Hydropower is benefiting from favorable government policies and increasing demand for clean energy. The stock has strong long-term potential but short-term volatility due to project delays is possible.'
      recommendation: 'Strong Buy'
      riskLevel: 'Medium-High'
      targetPrice: 550
      keyPoints: [
        'Beneficiary of green energy policies'
        'High demand for hydropower'
        'Strong project pipeline'
        'Risk of project execution delays'
      }      technicalSignal: 'Hold'
      supportLevel: 375
      resistanceLevel: 400
      targetPrice: 410
      riskLevel: 'Medium'
      recommendation: 'Hold'
    }
    technicalIndicators: {
      rsi: 42.3
      macd: -3.2
      sma20: 390.80
      sma50: 395.60
      sma200: 385.40
      bollingerUpper: 405.30
      bollingerLower: 370.90
      stochastic: 35.8
      adx: 28.4
    }
    priceHistory: Array.from({length: 365} (_ i) => ({
      date: new Date(Date.now() - (364-i) * 24 * 60 * 60 * 1000)
      open: 385.60 + Math.random() * 30 - 15
      high: 385.60 + Math.random() * 40 - 10
      low: 385.60 + Math.random() * 20 - 20
      close: 385.60 + Math.random() * 30 - 15
      volume: 140000 + Math.random() * 60000
    })
)
    news: []
    financials: {
      revenue: 8900000000
      netIncome: 2100000000
      totalAssets: 165000000000
      totalLiabilities: 145000000000
      shareholderEquity: 20000000000
    }
  }
  ]
      sentiment: 'Positive'
      analyst: 'AI Sector Scan'
    }
  }
  educationContent: [
    {
      id: 'e1'
      title: 'Introduction to Stock Market Investing'
      category: 'Basics'
      level: 'Beginner'
      timestamp: new Date(Date.now() - 20 * 86400000).toISOString()
      description: 'Learn the fundamental concepts of stock market investing including what stocks are how the market works and basic investment strategies.'
      url: 'https://example.com/education/basics'
      tags: ['Stocks' 'Investing' 'Beginner' 'Market']
      author: 'Investopedia AI'
      durationMinutes: 30
    }
    {
      id: 'e2'
      title: 'Understanding Technical Analysis Indicators'
      category: 'Technical Analysis'
      level: 'Intermediate'
      timestamp: new Date(Date.now() - 25 * 86400000).toISOString()
      description: 'Dive deeper into technical analysis with explanations of common indicators like RSI MACD and Bollinger Bands and how to use them to make informed trading decisions.'
      url: 'https://example.com/education/technical-analysis'
      tags: ['Technical Analysis' 'Indicators' 'Trading']
      author: 'ChartMaster AI'
      durationMinutes: 45
    }
    {
      id: 'e3'
      title: 'Portfolio Diversification Strategies'
      category: 'Portfolio Management'
      level: 'Advanced'
      timestamp: new Date(Date.now() - 30 * 86400000).toISOString()
      description: 'Explore advanced strategies for diversifying your investment portfolio to minimize risk and maximize returns across different asset classes and sectors.'
      url: 'https://example.com/education/diversification'
      tags: ['Portfolio' 'Diversification' 'Risk Management']
      author: 'WealthBuilder AI'
      durationMinutes: 60
    }
  }

      volume: 100000 + Math.random() * 50000
    })
)
    news: [
      {
        id: 'n2'
        title: 'Hydropower Sector Gets Government Boost'
        summary: 'New policies favor renewable energy investments'
        sentiment: 'Positive'
        impact: 'High'
        date: new Date(Date.now() - 172800000)
      }
    }
    financials: {
      revenue: 2800000000
      netIncome: 1200000000
      totalAssets: 18000000000
      totalLiabilities: 8000000000
      shareholderEquity: 10000000000
    }
  }
  {
    symbol: 'UPPER'
    name: 'Upper Tamakoshi Hydropower'
    price: 425.80
    change: 5.2
    changePercent: 1.24
    volume: 89000
    marketCap: 38500000000
    pe: 19.8
    eps: 21.50
    dividendYield: 2.1
    high52W: 485.00
    low52W: 350.00
    open: 405.00
    high: 428.00
    low: 402.00
    previousClose: 404.60
    sector: 'Hydropower'
    subSector: 'Power Generation'
    beta: 1.6
    bookValue: 320.45
    priceToBook: 1.33
    roe: 14.8
    roa: 9.5
    debtToEquity: 0.38
    currentRatio: 2.3
    description: 'Upper Tamakoshi Hydropower Limited operates one of the largest hydropower projects in Nepal.'
    aiAnalysis: {
      sentiment: 'Very Bullish'
      confidence: 85
      summary: 'Excellent growth prospects with increasing energy demand. Strong technical breakout.'
      technicalSignal: 'Strong Buy'
      supportLevel: 400
      resistanceLevel: 450
      targetPrice: 480
      riskLevel: 'Medium'
      recommendation: 'Strong Buy'
    }
    technicalIndicators: {
      rsi: 68.5
      macd: 15.7
      sma20: 412.30
      sma50: 395.80
      sma200: 378.90
      bollingerUpper: 445.60
      bollingerLower: 385.20
      stochastic: 75.2
      adx: 48.9
    }
    priceHistory: Array.from({length: 365} (_ i) => ({
      date: new Date(Date.now() - (364-i) * 24 * 60 * 60 * 1000)
      open: 425.80 + Math.random() * 35 - 17.5
      high: 425.80 + Math.random() * 45 - 12.5
      low: 425.80 + Math.random() * 25 - 22.5
      close: 425.80 + Math.random() * 35 - 17.5
      volume: 80000 + Math.random() * 40000
    })
)
    news: []
    financials: {
      revenue: 3200000000
      netIncome: 1450000000
      totalAssets: 22000000000
      totalLiabilities: 9500000000
      shareholderEquity: 12500000000
    }
  }
  {
    symbol: 'SANIMA'
    name: 'Sanima Bank'
    price: 385.60
    change: -0.8
    changePercent: -0.21
    volume: 156000
    marketCap: 42800000000
    pe: 16.2
    eps: 23.80
    dividendYield: 3.2
    high52W: 425.00
    low52W: 320.00
    open: 388.00
    high: 390.00
    low: 382.00
    previousClose: 388.40
    sector: 'Banking'
    subSector: 'Commercial Banks'
    beta: 1.0
    bookValue: 285.70
    priceToBook: 1.35
    roe: 13.8
    roa: 1.7
    debtToEquity: 0.88
    currentRatio: 1.42
    description: 'Sanima Bank Limited is a commercial bank providing comprehensive banking services across Nepal.'
    aiAnalysis: {
      sentiment: 'Neutral'
      confidence: 60
      summary: 'Consolidating near support levels. Banking sector facing headwinds but fundamentals remain solid.'
      technicalSignal: 'Hold'
      supportLevel: 375
      resistanceLevel: 400
      targetPrice: 410
      riskLevel: 'Medium'
      recommendation: 'Hold'
    }
    technicalIndicators: {
      rsi: 42.3
      macd: -3.2
      sma20: 390.80
      sma50: 395.60
      sma200: 385.40
      bollingerUpper: 405.30
      bollingerLower: 370.90
      stochastic: 35.8
      adx: 28.4
    }
    priceHistory: Array.from({length: 365} (_ i) => ({
      date: new Date(Date.now() - (364-i) * 24 * 60 * 60 * 1000)
      open: 385.60 + Math.random() * 30 - 15
      high: 385.60 + Math.random() * 40 - 10
      low: 385.60 + Math.random() * 20 - 20
      close: 385.60 + Math.random() * 30 - 15
      volume: 140000 + Math.random() * 60000
    })
)
    news: []
    financials: {
      revenue: 8900000000
      netIncome: 2100000000
      totalAssets: 165000000000
      totalLiabilities: 145000000000
      shareholderEquity: 20000000000
    }
  }
];

// Enhanced Market Indices
export const enhancedMarketIndices = [
  {
    id: 'nepse'
    name: 'NEPSE'
    value: 2405.78
    change: 1.23
    changePercent: 0.051
    previousClose: 2376.45
    yearHigh: 2845.87
    yearLow: 1912.34
    turnover: 3245678900
    volume: 12500000
    marketCap: 4850000000000
    pe: 18.5
    dividendYield: 2.8
    volatility: 1.8
    beta: 1.0
    historicalData: Array.from({length: 365} (_ i) => ({
      date: new Date(Date.now() - (364-i) * 24 * 60 * 60 * 1000)
      value: 2405.78 + Math.random() * 200 - 100
      volume: 10000000 + Math.random() * 5000000
    }])
  }
  {
    id: 'sensitive'
    name: 'NEPSE Sensitive'
    value: 456.89
    change: 0.82
    changePercent: 0.18
    previousClose: 453.17
    yearHigh: 498.76
    yearLow: 389.45
    turnover: 1234567890
    volume: 8500000
    marketCap: 2850000000000
    pe: 17.2
    dividendYield: 3.1
    volatility: 1.6
    beta: 0.95
    historicalData: Array.from({length: 365} (_ i) => ({
      date: new Date(Date.now() - (364-i) * 24 * 60 * 60 * 1000)
      value: 456.89 + Math.random() * 40 - 20
      volume: 7000000 + Math.random() * 3000000
    }])
  }
  {
    id: 'float'
    name: 'NEPSE Float'
    value: 174.32
    change: 1.05
    changePercent: 0.61
    previousClose: 172.51
    yearHigh: 189.34
    yearLow: 145.67
    turnover: 987654321
    volume: 6200000
    marketCap: 1950000000000
    pe: 19.8
    dividendYield: 2.5
    volatility: 2.1
    beta: 1.1
    historicalData: Array.from({length: 365} (_ i) => ({
      date: new Date(Date.now() - (364-i) * 24 * 60 * 60 * 1000)
      value: 174.32 + Math.random() * 15 - 7.5
      volume: 5000000 + Math.random() * 2500000
    }])
  }
  {
    id: 'banking'
    name: 'Banking Sub-Index'
    value: 1325.45
    change: -0.37
    changePercent: -0.028
    previousClose: 1330.37
    yearHigh: 1456.78
    yearLow: 1123.45
    turnover: 2345678901
    volume: 4800000
    marketCap: 2100000000000
    pe: 16.8
    dividendYield: 3.4
    volatility: 1.4
    beta: 0.9
    historicalData: Array.from({length: 365} (_ i) => ({
      date: new Date(Date.now() - (364-i) * 24 * 60 * 60 * 1000)
      value: 1325.45 + Math.random() * 80 - 40
      volume: 4000000 + Math.random() * 2000000
    }])
  }
  {
    id: 'hydropower'
    name: 'Hydropower Sub-Index'
    value: 2156.78
    change: 2.85
    changePercent: 0.132
    previousClose: 2096.93
    yearHigh: 2345.67
    yearLow: 1789.45
    turnover: 1876543210
    volume: 3200000
    marketCap: 1650000000000
    pe: 21.5
    dividendYield: 1.8
    volatility: 2.3
    beta: 1.3
    historicalData: Array.from({length: 365} (_ i) => ({
      date: new Date(Date.now() - (364-i) * 24 * 60 * 60 * 1000)
      value: 2156.78 + Math.random() * 120 - 60
      volume: 2500000 + Math.random() * 1500000
    }])
  }
];

// Comprehensive News Data with AI Analysis
export const enhancedNewsData = [
  {
    id: '1'
    title: 'NEPSE Implements New Circuit Breaker System'
    content: 'The Nepal Stock Exchange (NEPSE) has implemented a new circuit breaker system to better manage market volatility. The new system includes multiple trigger levels based on the NEPSE index movement with automatic trading halts at 5% 10% and 15% movements.'
    summary: 'NEPSE introduces circuit breakers to manage volatility with automatic trading halts.'
    source: 'Share Sansar'
    author: 'Market Desk'
    date: new Date(Date.now() - 3600000)
    imageUrl: 'https://images.pexels.com/photos/7567443/pexels-photo-7567443.jpeg'
    relatedSymbols: []
    category: 'Market Update'
    tags: ['NEPSE' 'Circuit Breaker' 'Volatility' 'Trading']
    sentiment: 'Neutral'
    impact: 'Medium'
    readTime: 3
    views: 15420
    aiInsights: {
      keyPoints: [
        'New circuit breaker system implemented'
        'Three-tier halt system at 5% 10% 15%'
        'Aims to reduce market volatility'
        'Follows international best practices'
      }      technicalSignal: 'Hold'
      supportLevel: 375
      resistanceLevel: 400
      targetPrice: 410
      riskLevel: 'Medium'
      recommendation: 'Hold'
    }
    technicalIndicators: {
      rsi: 42.3
      macd: -3.2
      sma20: 390.80
      sma50: 395.60
      sma200: 385.40
      bollingerUpper: 405.30
      bollingerLower: 370.90
      stochastic: 35.8
      adx: 28.4
    }
    priceHistory: Array.from({length: 365} (_ i) => ({
      date: new Date(Date.now() - (364-i) * 24 * 60 * 60 * 1000)
      open: 385.60 + Math.random() * 30 - 15
      high: 385.60 + Math.random() * 40 - 10
      low: 385.60 + Math.random() * 20 - 20
      close: 385.60 + Math.random() * 30 - 15
      volume: 140000 + Math.random() * 60000
    })
)
    news: []
    financials: {
      revenue: 8900000000
      netIncome: 2100000000
      totalAssets: 165000000000
      totalLiabilities: 145000000000
      shareholderEquity: 20000000000
    }
  }
  ]
      marketImpact: 'Positive for market stability'
      recommendation: 'Monitor implementation effectiveness'
    }
  }
  {
    id: '2'
    title: 'Nabil Bank Announces 20% Cash Dividend'
    content: 'Nabil Bank Limited (NABIL) has announced a 20% cash dividend for its shareholders following strong quarterly results. The bank reported a 15% increase in net profit compared to the same period last year driven by improved lending margins and reduced provisioning.'
    summary: 'NABIL declares 20% cash dividend after reporting 15% profit growth.'
    source: 'Nepal Stock News'
    author: 'Banking Correspondent'
    date: new Date(Date.now() - 7200000)
    imageUrl: 'https://images.pexels.com/photos/164527/pexels-photo-164527.jpeg'
    relatedSymbols: ['NABIL']
    category: 'Corporate Action'
    tags: ['Dividend' 'Banking' 'NABIL' 'Quarterly Results']
    sentiment: 'Positive'
    impact: 'High'
    readTime: 4
    views: 28750
    aiInsights: {
      keyPoints: [
        '20% cash dividend announced'
        '15% increase in net profit'
        'Improved lending margins'
        'Reduced provisioning costs'
      }      technicalSignal: 'Hold'
      supportLevel: 375
      resistanceLevel: 400
      targetPrice: 410
      riskLevel: 'Medium'
      recommendation: 'Hold'
    }
    technicalIndicators: {
      rsi: 42.3
      macd: -3.2
      sma20: 390.80
      sma50: 395.60
      sma200: 385.40
      bollingerUpper: 405.30
      bollingerLower: 370.90
      stochastic: 35.8
      adx: 28.4
    }
    priceHistory: Array.from({length: 365} (_ i) => ({
      date: new Date(Date.now() - (364-i) * 24 * 60 * 60 * 1000)
      open: 385.60 + Math.random() * 30 - 15
      high: 385.60 + Math.random() * 40 - 10
      low: 385.60 + Math.random() * 20 - 20
      close: 385.60 + Math.random() * 30 - 15
      volume: 140000 + Math.random() * 60000
    })
)
    news: []
    financials: {
      revenue: 8900000000
      netIncome: 2100000000
      totalAssets: 165000000000
      totalLiabilities: 145000000000
      shareholderEquity: 20000000000
    }
  }
  ]
      marketImpact: 'Very positive for NABIL shareholders'
      recommendation: 'Consider accumulating before ex-dividend date'
    }
  }
  {
    id: '3'
    title: 'Hydropower Sector Receives Government Policy Support'
    content: 'The Government of Nepal has announced new policies to support the hydropower sector including tax incentives for renewable energy projects and streamlined approval processes. This is expected to boost investor confidence in hydropower stocks.'
    summary: 'Government announces supportive policies for hydropower sector development.'
    source: 'Energy Today'
    author: 'Policy Analyst'
    date: new Date(Date.now() - 14400000)
    imageUrl: 'https://images.pexels.com/photos/2850347/pexels-photo-2850347.jpeg'
    relatedSymbols: ['CHCL' 'UPPER']
    category: 'Policy Update'
    tags: ['Hydropower' 'Government Policy' 'Tax Incentives' 'Renewable Energy']
    sentiment: 'Very Positive'
    impact: 'High'
    readTime: 5
    views: 19680
    aiInsights: {
      keyPoints: [
        'New tax incentives for renewable energy'
        'Streamlined approval processes'
        'Government support for sector growth'
        'Expected boost in investor confidence'
      }      technicalSignal: 'Hold'
      supportLevel: 375
      resistanceLevel: 400
      targetPrice: 410
      riskLevel: 'Medium'
      recommendation: 'Hold'
    }
    technicalIndicators: {
      rsi: 42.3
      macd: -3.2
      sma20: 390.80
      sma50: 395.60
      sma200: 385.40
      bollingerUpper: 405.30
      bollingerLower: 370.90
      stochastic: 35.8
      adx: 28.4
    }
    priceHistory: Array.from({length: 365} (_ i) => ({
      date: new Date(Date.now() - (364-i) * 24 * 60 * 60 * 1000)
      open: 385.60 + Math.random() * 30 - 15
      high: 385.60 + Math.random() * 40 - 10
      low: 385.60 + Math.random() * 20 - 20
      close: 385.60 + Math.random() * 30 - 15
      volume: 140000 + Math.random() * 60000
    })
)
    news: []
    financials: {
      revenue: 8900000000
      netIncome: 2100000000
      totalAssets: 165000000000
      totalLiabilities: 145000000000
      shareholderEquity: 20000000000
    }
  }
  ]
      marketImpact: 'Highly positive for hydropower stocks'
      recommendation: 'Strong buy signal for quality hydropower companies'
    }
  }
  {
    id: '4'
    title: 'Foreign Investment Limit Increased in Banking Sector'
    content: 'Nepal Rastra Bank has increased the foreign investment limit in commercial banks from 20% to 30% opening doors for more international partnerships and capital inflow in the banking sector.'
    summary: 'NRB raises foreign investment ceiling in banks to 30%.'
    source: 'Banking Times'
    author: 'Regulatory Reporter'
    date: new Date(Date.now() - 21600000)
    imageUrl: 'https://images.pexels.com/photos/259027/pexels-photo-259027.jpeg'
    relatedSymbols: ['NABIL' 'NICA' 'SANIMA']
    category: 'Regulatory Update'
    tags: ['Banking' 'Foreign Investment' 'NRB' 'Regulation']
    sentiment: 'Positive'
    impact: 'Medium'
    readTime: 3
    views: 12340
    aiInsights: {
      keyPoints: [
        'Foreign investment limit raised to 30%'
        'Potential for international partnerships'
        'Expected capital inflow in banking'
        'Regulatory support for sector growth'
      }      technicalSignal: 'Hold'
      supportLevel: 375
      resistanceLevel: 400
      targetPrice: 410
      riskLevel: 'Medium'
      recommendation: 'Hold'
    }
    technicalIndicators: {
      rsi: 42.3
      macd: -3.2
      sma20: 390.80
      sma50: 395.60
      sma200: 385.40
      bollingerUpper: 405.30
      bollingerLower: 370.90
      stochastic: 35.8
      adx: 28.4
    }
    priceHistory: Array.from({length: 365} (_ i) => ({
      date: new Date(Date.now() - (364-i) * 24 * 60 * 60 * 1000)
      open: 385.60 + Math.random() * 30 - 15
      high: 385.60 + Math.random() * 40 - 10
      low: 385.60 + Math.random() * 20 - 20
      close: 385.60 + Math.random() * 30 - 15
      volume: 140000 + Math.random() * 60000
    })
)
    news: []
    financials: {
      revenue: 8900000000
      netIncome: 2100000000
      totalAssets: 165000000000
      totalLiabilities: 145000000000
      shareholderEquity: 20000000000
    }
  }
  ]
      marketImpact: 'Positive for banking sector consolidation'
      recommendation: 'Monitor for partnership announcements'
    }
  }
  {
    id: '5'
    title: 'NEPSE Trading Volume Hits Monthly High'
    content: 'Nepal Stock Exchange recorded its highest daily trading volume this month with over NPR 8 billion worth of shares traded. The surge was led by banking and hydropower stocks.'
    summary: 'NEPSE achieves monthly high trading volume of NPR 8 billion.'
    source: 'Market Watch'
    author: 'Trading Desk'
    date: new Date(Date.now() - 28800000)
    imageUrl: 'https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg'
    relatedSymbols: []
    category: 'Market Activity'
    tags: ['Trading Volume' 'NEPSE' 'Market Activity' 'Liquidity']
    sentiment: 'Positive'
    impact: 'Medium'
    readTime: 2
    views: 8950
    aiInsights: {
      keyPoints: [
        'Monthly high trading volume achieved'
        'NPR 8 billion worth of shares traded'
        'Banking and hydropower led the surge'
        'Increased market liquidity'
      }      technicalSignal: 'Hold'
      supportLevel: 375
      resistanceLevel: 400
      targetPrice: 410
      riskLevel: 'Medium'
      recommendation: 'Hold'
    }
    technicalIndicators: {
      rsi: 42.3
      macd: -3.2
      sma20: 390.80
      sma50: 395.60
      sma200: 385.40
      bollingerUpper: 405.30
      bollingerLower: 370.90
      stochastic: 35.8
      adx: 28.4
    }
    priceHistory: Array.from({length: 365} (_ i) => ({
      date: new Date(Date.now() - (364-i) * 24 * 60 * 60 * 1000)
      open: 385.60 + Math.random() * 30 - 15
      high: 385.60 + Math.random() * 40 - 10
      low: 385.60 + Math.random() * 20 - 20
      close: 385.60 + Math.random() * 30 - 15
      volume: 140000 + Math.random() * 60000
    })
)
    news: []
    financials: {
      revenue: 8900000000
      netIncome: 2100000000
      totalAssets: 165000000000
      totalLiabilities: 145000000000
      shareholderEquity: 20000000000
    }
  }
  ]
      marketImpact: 'Positive for market sentiment and liquidity'
      recommendation: 'Good time for portfolio rebalancing'
    }
  }
];

// Educational Content
export const educationalContent = [
  {
    id: 'edu1'
    title: 'Understanding P/E Ratio in NEPSE'
    category: 'Fundamentals'
    difficulty: 'Beginner'
    readTime: 5
    content: 'Price-to-Earnings ratio is one of the most important valuation metrics in stock analysis...'
    keyPoints: [
      'P/E ratio measures stock valuation'
      'Lower P/E may indicate undervaluation'
      'Compare P/E within same sector'
      'Consider growth prospects'
    }
    quiz: [
      {
        question: 'What does P/E ratio measure?'
        options: ['Price vs Earnings' 'Profit vs Equity' 'Price vs Equity' 'Profit vs Expenses']
        correct: 0
      }
    ]
  }
  {
    id: 'edu2'
    title: 'Technical Analysis Basics'
    category: 'Technical Analysis'
    difficulty: 'Intermediate'
    readTime: 8
    content: 'Technical analysis involves studying price charts and patterns to predict future movements...'
    keyPoints: [
      'Charts show price history and patterns'
      'Support and resistance levels'
      'Moving averages indicate trends'
      'Volume confirms price movements'
    }
    quiz: [
      {
        question: 'What is a support level?'
        options: ['Price ceiling' 'Price floor' 'Average price' 'Maximum price']
        correct: 1
      }
    ]
  }
  {
    id: 'edu3'
    title: 'Dividend Investing in Nepal'
    category: 'Investment Strategy'
    difficulty: 'Beginner'
    readTime: 6
    content: 'Dividend investing focuses on stocks that regularly pay dividends to shareholders...'
    keyPoints: [
      'Regular income from dividends'
      'Look for consistent dividend history'
      'Consider dividend yield and growth'
      'Tax implications of dividends'
    }
    quiz: [
      {
        question: 'What is dividend yield?'
        options: ['Annual dividend / Stock price' 'Stock price / Annual dividend' 'Dividend growth rate' 'Total dividends paid']
        correct: 0
      }
    ]
  }
];

// AI Chatbot Responses
export const aiChatbotResponses = {
  greetings: [
    "Hello! I'm your NEPSE AI assistant. How can I help you with your investment questions today?"
    "Welcome to NEPSE AI! I'm here to help you understand the Nepal stock market better."
    "Hi there! Ready to explore the Nepal Stock Exchange? Ask me anything!"
  }
  stockAnalysis: {
    'NABIL': 'NABIL shows strong fundamentals with consistent dividend payments. Current technical indicators suggest a bullish trend with RSI at 65.4.'
    'NICA': 'NICA is consolidating near support levels. The recent dip might present a buying opportunity for long-term investors.'
    'CHCL': 'CHCL is benefiting from government support for renewable energy. Strong momentum with RSI at 72.8 indicates continued bullish sentiment.'
  }
  generalQuestions: {
    'what is nepse': 'NEPSE (Nepal Stock Exchange) is the only stock exchange in Nepal established in 1993. It facilitates trading of stocks bonds and other securities.',
    'how to invest': 'To invest in NEPSE you need to: 1) Open a DEMAT account with a broker 2) Complete KYC requirements 3) Fund your account 4) Start trading through your broker.',
    'market hours': 'NEPSE operates from Sunday to Thursday 11:00 AM to 3:00 PM (Nepal Time). The market is closed on Fridays and public holidays.'
  }
}

// Financial Calculators Data
export const calculatorData = {
  sipCalculator: {
    description: 'Calculate returns from Systematic Investment Plan',
    formula: 'FV = PMT × [((1 + r)^n - 1) / r] × (1 + r)'
  },
  roiCalculator: {
    description: 'Calculate Return on Investment',
    formula: 'ROI = (Current Value - Initial Investment) / Initial Investment × 100'
  },
  peCalculator: {
    description: 'Calculate Price-to-Earnings ratio',
    formula: 'P/E = Market Price per Share / Earnings per Share'
  },
  dividendYieldCalculator: {
    description: 'Calculate Dividend Yield',
    formula: 'Dividend Yield = Annual Dividend per Share / Price per Share × 100'
  }
}

// Portfolio Analytics Data
export const portfolioAnalytics = {
  riskMetrics: {
    beta: 1.15,
    sharpeRatio: 0.85,
    volatility: 18.5,
    maxDrawdown: -12.3,
    var95: -8.7
  },
  sectorAllocation: [
    { sector: 'Banking', percentage: 45, value: 562500 },
    { sector: 'Hydropower', percentage: 30, value: 375000 },
    { sector: 'Insurance', percentage: 15, value: 187500 },
    { sector: 'Others', percentage: 10, value: 125000 }
  },
  performanceMetrics: {
    totalReturn: 15.8,
    annualizedReturn: 12.4,
    totalValue: 1250000,
    totalInvestment: 1080000,
    unrealizedGain: 170000,
    realizedGain: 45000
  }

// Market Sentiment Data
export const marketSentiment = {
  overall: {
    sentiment: 'Bullish',
    confidence: 72,
    fearGreedIndex: 68,
    bullishPercentage: 65,
    bearishPercentage: 25,
    neutralPercentage: 10
  },
  sectorSentiment: [
    { sector: 'Banking', sentiment: 'Neutral', confidence: 60 },
    { sector: 'Hydropower', sentiment: 'Bullish', confidence: 80 },
    { sector: 'Insurance', sentiment: 'Bearish', confidence: 55 },
    { sector: 'Manufacturing', sentiment: 'Neutral', confidence: 50 }
  },
  socialSentiment: {
    twitterMentions: 1250,
    positivePercentage: 68,
    negativePercentage: 22,
    neutralPercentage: 10,
    trendingTopics: ['#NEPSE', '#HydropowerBoom', '#BankingStocks']
  }


// Notification Templates
export const notificationTemplates = {
  priceAlerts: {
    above: 'Price Alert: {symbol} has crossed above NPR {price}',
    below: 'Price Alert: {symbol} has dropped below NPR {price}',
    change: 'Price Alert: {symbol} has moved {percentage}% in the last hour'
  },
  orderAlerts: {
    filled: 'Order Filled: Your {type} order for {quantity} shares of {symbol} has been executed at NPR {price}',
    partial: 'Partial Fill: {filledQuantity} of {totalQuantity} shares of {symbol} filled at NPR {price}',
    cancelled: 'Order Cancelled: Your {type} order for {symbol} has been cancelled'
  },
  newsAlerts: {
    breaking: 'Breaking News: {title}',
    earnings: 'Earnings Alert: {symbol} has announced quarterly results',
    dividend: 'Dividend Alert: {symbol} has declared {percentage}% dividend'
  }
}

// Currency Exchange Rates
export const currencyRates = {
  USD: { rate: 133.50, change: 0.25 },
  EUR: { rate: 145.80, change: -0.15 },
  GBP: { rate: 165.20, change: 0.40 },
  INR: { rate: 1.60, change: 0.02 },
  CNY: { rate: 18.75, change: -0.08 }
}

// Market Depth Data
export const marketDepthData = {
  'NABIL': {
    bids: [
      { price: 1424.00, quantity: 500, orders: 3 },
      { price: 1423.50, quantity: 750, orders: 5 },
      { price: 1423.00, quantity: 1200, orders: 8 },
      { price: 1422.50, quantity: 900, orders: 4 },
      { price: 1422.00, quantity: 600, orders: 2 }
    ],
    asks: [
      { price: 1426.00, quantity: 400, orders: 2 },
      { price: 1426.50, quantity: 650, orders: 4 },
      { price: 1427.00, quantity: 800, orders: 6 },
      { price: 1427.50, quantity: 550, orders: 3 },
      { price: 1428.00, quantity: 700, orders: 5 }
    ]
  }
}

export default {
  enhancedStockData,
  enhancedMarketIndices,
  enhancedNewsData,
  educationalContent,
  aiChatbotResponses,
  calculatorData,
  portfolioAnalytics,
  marketSentiment,
  notificationTemplates,
  currencyRates,
  marketDepthData
}