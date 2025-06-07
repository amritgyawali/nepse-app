import React, { createContext, useState, useEffect, ReactNode, Key } from 'react';
interface Stock {
  description: string;
  sector: any;
  marketCap: number;
  pe: any;
  dividendYield: any;
  high52W: any;
  low52W: any;
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
}

interface MarketIndex {
  [x: string]: Key | null | undefined;
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

interface NewsItem {
  [x: string]: string;
  relatedSymbols: any;
  id: string;
  title: string;
  description: string;
  date: string;
  source: string;
  url: string;
}

import { PortfolioHolding } from '@/types';

interface Holding extends PortfolioHolding {}
import NEPSEDataService from '@/services/NEPSEDataService';
import { Alert } from 'react-native';

export interface MarketDataContextType {
  allStocks: Stock[];
  marketIndices: MarketIndex[];
  watchlist: Stock[];
  topGainers: Stock[];
  topLosers: Stock[];
  latestNews: NewsItem[];
  holdings: Holding[];
  loading: boolean;
  loadingStates: {
    stocks: boolean;
    indices: boolean;
    gainers: boolean;
    losers: boolean;
    news: boolean;
  };
  errors: {
    stocks?: string;
    indices?: string;
    gainers?: string;
    losers?: string;
    news?: string;
  };
  refreshData: () => Promise<void>;
  getStockBySymbol: (symbol: string) => Stock | undefined;
  addToWatchlist: (stock: Stock) => void;
  removeFromWatchlist: (symbol: string) => void;
  isInWatchlist: (symbol: string) => boolean;
  updateHoldings: (updatedHoldings: PortfolioHolding[], action: 'add' | 'update' | 'delete', symbol: string, holding?: PortfolioHolding | null) => void;
}

export const MarketDataContext = createContext<MarketDataContextType>({
  allStocks: [],
  marketIndices: [],
  watchlist: [],
  topGainers: [],
  topLosers: [],
  latestNews: [],
  holdings: [],
  loading: false,
  loadingStates: {
    stocks: false,
    indices: false,
    gainers: false,
    losers: false,
    news: false
  },
  errors: {},
  refreshData: async () => {},
  getStockBySymbol: () => undefined,
  addToWatchlist: () => {},
  removeFromWatchlist: () => {},
  isInWatchlist: () => false,
  updateHoldings: (updatedHoldings, action, symbol, holding) => {},
});

type MarketDataProviderProps = {
  children: ReactNode;
};

export const MarketDataProvider = ({ children }: { children: ReactNode }) => {
  const [allStocks, setAllStocks] = useState<Stock[]>([]);
  const [marketIndices, setMarketIndices] = useState<MarketIndex[]>([]);
  const [watchlist, setWatchlist] = useState<Stock[]>([]);
  const [topGainers, setTopGainers] = useState<Stock[]>([]);
  const [topLosers, setTopLosers] = useState<Stock[]>([]);
  const [latestNews, setLatestNews] = useState<NewsItem[]>([]);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingStates, setLoadingStates] = useState({
    stocks: false,
    indices: false,
    gainers: false,
    losers: false,
    news: false
  });
  const [errors, setErrors] = useState<{
    stocks?: string;
    indices?: string;
    gainers?: string;
    losers?: string;
    news?: string;
  }>({});
  
  const nepseService = NEPSEDataService.getInstance();
  
  // Function to fetch all data
  const refreshData = async () => {
    // Set overall loading state
    setLoading(true);
    
    // Reset errors
    setErrors({});
    
    // Fetch all stocks
    await fetchStocks();
    
    // Fetch market indices
    await fetchIndices();
    
    // Fetch top gainers
    await fetchTopGainers();
    
    // Fetch top losers
    await fetchTopLosers();
    
    // Fetch news
    await fetchNews();
    
    // Update holdings with current prices
    updateHoldingsWithCurrentPrices();
    
    // Set overall loading state to false
    setLoading(false);
  };
  
  // Function to fetch stocks
  const fetchStocks = async () => {
    setLoadingStates(prev => ({ ...prev, stocks: true }));
    try {
      const stocks = await nepseService.getAllStocks();
      setAllStocks(stocks.map((stock: { ltp: any; change: any; changePercent: any; description: string; sector: any; marketCap: number; pe: any; dividendYield: any; high52W: any; low52W: any; symbol: string; name: string; volume: number; }) => ({
        ...stock,
        price: stock.ltp || 0,
        change: typeof stock.change === 'number' ? stock.change : 0,
        changePercent: stock.changePercent
      })));
      
      // Initialize watchlist if empty
      if (watchlist.length === 0 && stocks.length > 0) {
        setWatchlist(stocks.slice(0, 5).map((stock: { ltp: any; change: any; changePercent: any; description: string; sector: any; marketCap: number; pe: any; dividendYield: any; high52W: any; low52W: any; symbol: string; name: string; volume: number; }) => ({
          ...stock,
          price: stock.ltp,
          change: stock.change,
          changePercent: stock.changePercent || 0
        })));
      }
      
      // Clear any previous error
      setErrors(prev => ({ ...prev, stocks: undefined }));
    } catch (error) {
      console.error('Error fetching stocks:', error);
      setErrors(prev => ({ ...prev, stocks: 'Failed to fetch stocks. Please try again later.' }));
    } finally {
      setLoadingStates(prev => ({ ...prev, stocks: false }));
    }
  };
  
  // Function to fetch indices
  const fetchIndices = async () => {
    setLoadingStates(prev => ({ ...prev, indices: true }));
    try {
      const indices = await nepseService.getIndices();
      setMarketIndices(indices);
      // Clear any previous error
      setErrors(prev => ({ ...prev, indices: undefined }));
    } catch (error) {
      console.error('Error fetching indices:', error);
      setErrors(prev => ({ ...prev, indices: 'Failed to fetch market indices. Please try again later.' }));
    } finally {
      setLoadingStates(prev => ({ ...prev, indices: false }));
    }
  };
  
  // Function to fetch top gainers
  const fetchTopGainers = async () => {
    setLoadingStates(prev => ({ ...prev, gainers: true }));
    try {
      const gainers = await nepseService.getTopGainers();
      setTopGainers(gainers.map((stock: { ltp: any; change: any; changePercent: any; }) => ({
        ...stock,
        price: stock.ltp,
        change: typeof stock.change === 'number' ? stock.change : 0,
        changePercent: stock.changePercent
      })));
      // Clear any previous error
      setErrors(prev => ({ ...prev, gainers: undefined }));
    } catch (error) {
      console.error('Error fetching top gainers:', error);
      setErrors(prev => ({ ...prev, gainers: 'Failed to fetch top gainers. Please try again later.' }));
    } finally {
      setLoadingStates(prev => ({ ...prev, gainers: false }));
    }
  };
  
  // Function to fetch top losers
  const fetchTopLosers = async () => {
    setLoadingStates(prev => ({ ...prev, losers: true }));
    try {
      const losers = await nepseService.getTopLosers();
      setTopLosers(losers.map((stock: { ltp: any; change: any; changePercent: any; }) => ({
        ...stock,
        price: stock.ltp,
        change: stock.change,
        changePercent: stock.changePercent
      })));
      // Clear any previous error
      setErrors(prev => ({ ...prev, losers: undefined }));
    } catch (error) {
      console.error('Error fetching top losers:', error);
      setErrors(prev => ({ ...prev, losers: 'Failed to fetch top losers. Please try again later.' }));
    } finally {
      setLoadingStates(prev => ({ ...prev, losers: false }));
    }
  };
  
  // Function to fetch news
  const fetchNews = async () => {
    setLoadingStates(prev => ({ ...prev, news: true }));
    try {
      const disclosures = await nepseService.getCorporateDisclosures();
      setLatestNews(disclosures.map((news: any) => ({
        id: news.id?.toString() || '',
        title: news.title || news.headline || '',
        description: news.description || news.content || '',
        date: news.date || news.publishedDate || new Date().toISOString(),
        source: news.source || 'NEPSE',
        imageUrl: news.imageUrl || '',
        url: news.url || '',
        relatedSymbols: news.relatedSymbols || []
      })));
      // Clear any previous error
      setErrors(prev => ({ ...prev, news: undefined }));
    } catch (error) {
      console.error('Error fetching news:', error);
      setErrors(prev => ({ ...prev, news: 'Failed to fetch news. Please try again later.' }));
    } finally {
      setLoadingStates(prev => ({ ...prev, news: false }));
    }
  };
  
  // Function to update holdings with current prices
  const updateHoldingsWithCurrentPrices = () => {
    if (allStocks.length === 0 || holdings.length === 0) {
      // If we don't have stocks data yet, create mock holdings
      if (allStocks.length > 0 && holdings.length === 0) {
        const mockHoldings = allStocks.slice(0, 3).map((stock: { symbol: any; price: number; }) => ({
          symbol: stock.symbol,
          quantity: Math.floor(Math.random() * 100) + 1,
          averagePrice: stock.price * 0.95, // Simulate a small profit
          currentPrice: stock.price,
          marketValue: 0,
          profitLoss: 0,
          profitLossPercentage: 0
        }));
        
        // Calculate derived values
        mockHoldings.forEach((holding: { marketValue: number; quantity: number; currentPrice: number; profitLoss: number; averagePrice: number; profitLossPercentage: number; }) => {
          holding.marketValue = holding.quantity * holding.currentPrice;
          holding.profitLoss = (holding.currentPrice - holding.averagePrice) * holding.quantity;
          holding.profitLossPercentage = ((holding.currentPrice - holding.averagePrice) / holding.averagePrice) * 100;
        });
        
        setHoldings(mockHoldings);
      }
      return;
    }
    
    // Update existing holdings with current prices
    const updatedHoldings = holdings.map(holding => {
      const stock = allStocks.find(s => s.symbol === holding.symbol);
      if (!stock) return holding;
      
      const currentPrice = stock.price;
      const marketValue = holding.quantity * currentPrice;
      const profitLoss = (currentPrice - holding.averagePrice) * holding.quantity;
      const profitLossPercentage = ((currentPrice - holding.averagePrice) / holding.averagePrice) * 100;
      
      return {
        ...holding,
        currentPrice,
        marketValue,
        profitLoss,
        profitLossPercentage
      };
    });
    
    setHoldings(updatedHoldings);
  };
  
  // Fetch data on component mount
  useEffect(() => {
    fetchData();
    
    // Set up a refresh interval (every 5 minutes)
    const refreshInterval = setInterval(fetchData, 5 * 60 * 1000);
    
    // Clean up the interval on unmount
    return () => clearInterval(refreshInterval);
  }, []);
  
  const getStockBySymbol = (symbol: string) => {
    return allStocks.find(stock => stock.symbol === symbol);
  };
  
  const addToWatchlist = (stock: Stock) => {
    // Check if stock is already in watchlist
    if (!isInWatchlist(stock.symbol)) {
      setWatchlist(prev => [...prev, stock]);
      Alert.alert('Added to Watchlist', `${stock.symbol} has been added to your watchlist.`);
    } else {
      Alert.alert('Already in Watchlist', `${stock.symbol} is already in your watchlist.`);
    }
  };
  
  const removeFromWatchlist = (symbol: string) => {
    if (isInWatchlist(symbol)) {
      setWatchlist(prev => prev.filter(stock => stock.symbol !== symbol));
      Alert.alert('Removed from Watchlist', `${symbol} has been removed from your watchlist.`);
    }
  };
  
  const isInWatchlist = (symbol: string) => {
    return watchlist.some(stock => stock.symbol === symbol);
  };
  
  const updateHoldings = useCallback((updatedHoldings: PortfolioHolding[], action: 'add' | 'update' | 'delete', symbol: string, holding?: PortfolioHolding | null) => {
    setHoldings(updatedHoldings);
  }, []);
  
  return (
    <MarketDataContext.Provider value={{
      allStocks,
      marketIndices,
      watchlist,
      topGainers,
      topLosers,
      latestNews,
      holdings,
      loading,
      loadingStates,
      errors,
      refreshData,
      getStockBySymbol,
      addToWatchlist,
      removeFromWatchlist,
      isInWatchlist,
      updateHoldings,
      refreshData,
    }}>
      {children}
    </MarketDataContext.Provider>
  );
}