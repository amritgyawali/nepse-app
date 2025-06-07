import { useContext, useEffect } from 'react';
import { MarketDataContext } from '@/context/MarketDataContext';
import MarketDataService from '@/services/MarketDataService';

export function useMarketData() {
  const context = useContext(MarketDataContext);
  const marketDataService = MarketDataService.getInstance();

  useEffect(() => {
    // Start real-time updates when component mounts
    marketDataService.startRealTimeUpdates((update) => {
      // Handle real-time updates here
      console.log('Real-time update:', update);
    });

    // Cleanup on unmount
    return () => {
      marketDataService.stopRealTimeUpdates();
    };
  }, []);

  return {
    ...context,
    getMarketStatus: marketDataService.getMarketStatus,
    getMarketDepth: marketDataService.getMarketDepth,
    getTradingVolume: marketDataService.getTradingVolume
  };
}