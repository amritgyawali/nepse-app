// Mock stock data with more realistic Nepal market data
export const mockStockData = [
  {
    symbol: 'NABIL',
    name: 'Nabil Bank Limited',
    price: 1425.50,
    change: 2.5,
    volume: 235000,
    marketCap: 128900000000,
    pe: 18.2,
    dividendYield: 3.5,
    high52W: 1580.00,
    low52W: 1180.00,
    open: 1410.00,
    high: 1430.00,
    low: 1405.00,
    sector: 'Banking',
    description: 'Nabil Bank Limited is one of the largest private sector commercial banks in Nepal, providing a comprehensive range of banking services including retail banking, corporate banking, and investment services.',
    priceHistory: Array.from({length: 30}, (_, i) => ({
      date: new Date(Date.now() - (29-i) * 24 * 60 * 60 * 1000),
      price: 1425.50 + Math.random() * 100 - 50,
      volume: 200000 + Math.random() * 100000
    }))
  },
  {
    symbol: 'NICA',
    name: 'NIC Asia Bank',
    price: 890.25,
    change: -1.2,
    volume: 185000,
    marketCap: 98500000000,
    pe: 15.8,
    dividendYield: 2.8,
    high52W: 985.00,
    low52W: 780.00,
    open: 895.00,
    high: 898.00,
    low: 885.00,
    sector: 'Banking',
    description: 'NIC Asia Bank is a commercial bank in Nepal offering a wide range of banking products and services.',
    priceHistory: Array.from({length: 30}, (_, i) => ({
      date: new Date(Date.now() - (29-i) * 24 * 60 * 60 * 1000),
      price: 890.25 + Math.random() * 50 - 25,
      volume: 150000 + Math.random() * 70000
    }))
  },
  {
    symbol: 'CHCL',
    name: 'Chilime Hydropower',
    price: 512.75,
    change: 3.8,
    volume: 125000,
    marketCap: 45600000000,
    pe: 22.4,
    dividendYield: 1.5,
    high52W: 580.00,
    low52W: 420.00,
    open: 495.00,
    high: 515.00,
    low: 490.00,
    sector: 'Hydropower',
    description: 'Chilime Hydropower Company Limited is one of the leading hydropower companies in Nepal.',
    priceHistory: Array.from({length: 30}, (_, i) => ({
      date: new Date(Date.now() - (29-i) * 24 * 60 * 60 * 1000),
      price: 512.75 + Math.random() * 40 - 20,
      volume: 100000 + Math.random() * 50000
    }))
  }
];

// Market indices with actual NEPSE sectors
export const mockMarketIndices = [
  {
    id: 'nepse',
    name: 'NEPSE',
    value: 2405.78,
    change: 1.23,
    previousClose: 2376.45,
    yearHigh: 2845.87,
    yearLow: 1912.34,
    turnover: 3245678900
  },
  {
    id: 'sensitive',
    name: 'NEPSE Sensitive',
    value: 456.89,
    change: 0.82,
    previousClose: 453.17,
    yearHigh: 498.76,
    yearLow: 389.45,
    turnover: 1234567890
  },
  {
    id: 'float',
    name: 'NEPSE Float',
    value: 174.32,
    change: 1.05,
    previousClose: 172.51,
    yearHigh: 189.34,
    yearLow: 145.67,
    turnover: 987654321
  },
  {
    id: 'banking',
    name: 'Banking Sub-Index',
    value: 1325.45,
    change: -0.37,
    previousClose: 1330.37,
    yearHigh: 1456.78,
    yearLow: 1123.45,
    turnover: 2345678901
  }
];

// More realistic market news
export const mockLatestNews = [
  {
    id: '1',
    title: 'NEPSE Implements New Circuit Breaker System',
    content: 'The Nepal Stock Exchange (NEPSE) has implemented a new circuit breaker system to better manage market volatility. The new system includes multiple trigger levels based on the NEPSE index movement.',
    source: 'Share Sansar',
    date: new Date(Date.now() - 3600000).toISOString(),
    imageUrl: 'https://images.pexels.com/photos/7567443/pexels-photo-7567443.jpeg',
    relatedSymbols: [],
    category: 'Market Update'
  },
  {
    id: '2',
    title: 'Nabil Bank Announces 20% Cash Dividend',
    content: 'Nabil Bank Limited (NABIL) has announced a 20% cash dividend for its shareholders following strong quarterly results. The bank reported a 15% increase in net profit.',
    source: 'Nepal Stock News',
    date: new Date(Date.now() - 7200000).toISOString(),
    imageUrl: 'https://images.pexels.com/photos/164527/pexels-photo-164527.jpeg',
    relatedSymbols: ['NABIL'],
    category: 'Corporate Action'
  }
];

// Add mock top gainers (stocks with positive change)
export const mockTopGainers = mockStockData
  .filter(stock => stock.change > 0)
  .sort((a, b) => b.change - a.change);

// Add mock top losers (stocks with negative change)
export const mockTopLosers = mockStockData
  .filter(stock => stock.change < 0)
  .sort((a, b) => a.change - b.change);

// Add mock holdings data
export const mockHoldings = [
  {
    symbol: 'NABIL',
    quantity: 100,
    averagePrice: 1380.50,
    currentPrice: 1425.50,
    profitLoss: 4500,
    profitLossPercentage: 3.26,
    marketValue: 142550
  },
  {
    symbol: 'CHCL',
    quantity: 200,
    averagePrice: 495.00,
    currentPrice: 512.75,
    profitLoss: 3550,
    profitLossPercentage: 3.59,
    marketValue: 102550
  }
];

// Enhanced market data types
export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  volume: number;
  marketCap: number;
  pe: number;
  dividendYield: number;
  high52W: number;
  low52W: number;
  open: number;
  high: number;
  low: number;
  sector: string;
  description: string;
  priceHistory: PricePoint[];
}

export interface PricePoint {
  date: Date;
  price: number;
  volume: number;
}

export interface MarketIndex {
  id: string;
  name: string;
  value: number;
  change: number;
  previousClose: number;
  yearHigh: number;
  yearLow: number;
  turnover: number;
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  source: string;
  date: string;
  imageUrl: string;
  relatedSymbols: string[];
  category: string;
}

export interface Holding {
  symbol: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  profitLoss: number;
  profitLossPercentage: number;
  marketValue: number;
}