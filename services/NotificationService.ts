import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NEPSEStock } from './NEPSEDataService';
import { AIInsight } from './AIAnalysisService';

interface NotificationAlert {
  id: string;
  type: 'price' | 'volume' | 'news' | 'ai_insight' | 'market' | 'portfolio' | 'earnings';
  title: string;
  body: string;
  data?: any;
  priority: 'low' | 'normal' | 'high' | 'critical';
  symbol?: string;
  createdAt: Date;
  scheduledFor?: Date;
  delivered: boolean;
  read: boolean;
  actionable: boolean;
  actions?: NotificationAction[];
}

interface NotificationAction {
  id: string;
  title: string;
  type: 'buy' | 'sell' | 'watch' | 'view' | 'dismiss';
  data?: any;
}

interface PriceAlert {
  id: string;
  symbol: string;
  condition: 'above' | 'below' | 'change_percent' | 'volume_spike';
  value: number;
  enabled: boolean;
  oneTime: boolean;
  createdAt: Date;
  triggeredAt?: Date;
}

interface NotificationSettings {
  enabled: boolean;
  priceAlerts: boolean;
  volumeAlerts: boolean;
  newsAlerts: boolean;
  aiInsights: boolean;
  marketUpdates: boolean;
  portfolioUpdates: boolean;
  earningsAlerts: boolean;
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM format
    end: string;
  };
  frequency: {
    priceAlerts: 'immediate' | 'batched_5min' | 'batched_15min' | 'batched_1hour';
    newsAlerts: 'immediate' | 'batched_15min' | 'batched_1hour' | 'daily';
    aiInsights: 'immediate' | 'batched_1hour' | 'daily';
  };
  channels: {
    push: boolean;
    email: boolean;
    sms: boolean;
  };
}

class NotificationService {
  private static instance: NotificationService;
  private alerts: Map<string, NotificationAlert> = new Map();
  private priceAlerts: Map<string, PriceAlert> = new Map();
  private settings: NotificationSettings;
  private batchQueue: Map<string, NotificationAlert[]> = new Map();
  private batchTimers: Map<string, NodeJS.Timeout> = new Map();
  private lastPrices: Map<string, number> = new Map();
  private subscribers: Map<string, (alert: NotificationAlert) => void> = new Map();

  private constructor() {
    this.settings = this.getDefaultSettings();
    this.initializeNotifications();
    this.loadStoredData();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Initialize notification system
  private async initializeNotifications(): Promise<void> {
    try {
      // Configure notification behavior
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });

      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Notification permissions not granted');
        return;
      }

      // Get push token for remote notifications
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });

        // Create specific channels
        await this.createNotificationChannels();
      }

      console.log('Notifications initialized successfully');
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    }
  }

  // Create notification channels for Android
  private async createNotificationChannels(): Promise<void> {
    const channels = [
      {
        id: 'price_alerts',
        name: 'Price Alerts',
        importance: Notifications.AndroidImportance.HIGH,
        description: 'Stock price movement alerts'
      },
      {
        id: 'volume_alerts',
        name: 'Volume Alerts',
        importance: Notifications.AndroidImportance.DEFAULT,
        description: 'Trading volume spike alerts'
      },
      {
        id: 'news_alerts',
        name: 'News Alerts',
        importance: Notifications.AndroidImportance.DEFAULT,
        description: 'Market and stock news updates'
      },
      {
        id: 'ai_insights',
        name: 'AI Insights',
        importance: Notifications.AndroidImportance.HIGH,
        description: 'AI-powered trading insights and recommendations'
      },
      {
        id: 'market_updates',
        name: 'Market Updates',
        importance: Notifications.AndroidImportance.DEFAULT,
        description: 'General market updates and indices'
      },
      {
        id: 'portfolio_updates',
        name: 'Portfolio Updates',
        importance: Notifications.AndroidImportance.DEFAULT,
        description: 'Portfolio performance and changes'
      }
    ];

    for (const channel of channels) {
      await Notifications.setNotificationChannelAsync(channel.id, {
        name: channel.name,
        importance: channel.importance,
        description: channel.description,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#10B981',
      });
    }
  }

  // Subscribe to notifications
  public subscribe(callback: (alert: NotificationAlert) => void): string {
    const id = `sub_${Date.now()}_${Math.random()}`;
    this.subscribers.set(id, callback);
    return id;
  }

  public unsubscribe(id: string): void {
    this.subscribers.delete(id);
  }

  // Process stock price updates
  public async processStockUpdate(stock: NEPSEStock): Promise<void> {
    const previousPrice = this.lastPrices.get(stock.symbol);
    this.lastPrices.set(stock.symbol, stock.ltp);

    if (!previousPrice) return;

    // Check price alerts
    await this.checkPriceAlerts(stock, previousPrice);

    // Check volume spikes
    await this.checkVolumeSpikes(stock);

    // Check significant price movements
    await this.checkSignificantMovements(stock, previousPrice);
  }

  // Check price alerts
  private async checkPriceAlerts(stock: NEPSEStock, previousPrice: number): Promise<void> {
    const stockAlerts = Array.from(this.priceAlerts.values())
      .filter(alert => alert.symbol === stock.symbol && alert.enabled && !alert.triggeredAt);

    for (const alert of stockAlerts) {
      let triggered = false;

      switch (alert.condition) {
        case 'above':
          triggered = stock.ltp >= alert.value && previousPrice < alert.value;
          break;
        case 'below':
          triggered = stock.ltp <= alert.value && previousPrice > alert.value;
          break;
        case 'change_percent':
          const changePercent = Math.abs(stock.changePercent);
          triggered = changePercent >= alert.value;
          break;
      }

      if (triggered) {
        await this.triggerPriceAlert(alert, stock);
      }
    }
  }

  // Check volume spikes
  private async checkVolumeSpikes(stock: NEPSEStock): Promise<void> {
    if (!this.settings.volumeAlerts) return;

    // Calculate average volume (would need historical data in real implementation)
    const avgVolume = 200000; // Placeholder
    const volumeRatio = stock.volume / avgVolume;

    if (volumeRatio >= 3) { // 3x average volume
      await this.createAlert({
        type: 'volume',
        title: `Volume Spike: ${stock.symbol}`,
        body: `${stock.name} trading volume is ${volumeRatio.toFixed(1)}x higher than average`,
        priority: 'high',
        symbol: stock.symbol,
        data: { stock, volumeRatio },
        actionable: true,
        actions: [
          { id: 'view', title: 'View Chart', type: 'view', data: { symbol: stock.symbol } },
          { id: 'watch', title: 'Add to Watchlist', type: 'watch', data: { symbol: stock.symbol } }
        ]
      });
    }
  }

  // Check significant price movements
  private async checkSignificantMovements(stock: NEPSEStock, previousPrice: number): Promise<void> {
    const changePercent = Math.abs((stock.ltp - previousPrice) / previousPrice * 100);

    if (changePercent >= 5) { // 5% or more movement
      const direction = stock.ltp > previousPrice ? 'up' : 'down';
      const emoji = direction === 'up' ? '📈' : '📉';

      await this.createAlert({
        type: 'price',
        title: `${emoji} ${stock.symbol} ${direction.toUpperCase()} ${changePercent.toFixed(1)}%`,
        body: `${stock.name} moved ${direction} by ${changePercent.toFixed(1)}% to NPR ${stock.ltp.toFixed(2)}`,
        priority: changePercent >= 10 ? 'critical' : 'high',
        symbol: stock.symbol,
        data: { stock, changePercent, direction },
        actionable: true,
        actions: [
          { id: 'view', title: 'View Details', type: 'view', data: { symbol: stock.symbol } },
          { id: 'buy', title: direction === 'down' ? 'Buy Dip' : 'Buy More', type: 'buy', data: { symbol: stock.symbol } }
        ]
      });
    }
  }

  // Process AI insights
  public async processAIInsight(insight: AIInsight): Promise<void> {
    if (!this.settings.aiInsights) return;

    const priority = insight.confidence > 80 ? 'critical' : insight.confidence > 60 ? 'high' : 'normal';
    const emoji = insight.type === 'bullish' ? '🚀' : insight.type === 'bearish' ? '⚠️' : '🔍';

    await this.createAlert({
      type: 'ai_insight',
      title: `${emoji} AI Insight: ${insight.title}`,
      body: `${insight.description} (${insight.confidence}% confidence)`,
      priority,
      symbol: insight.symbol,
      data: { insight },
      actionable: true,
      actions: [
        { id: 'view', title: 'View Analysis', type: 'view', data: { symbol: insight.symbol } },
        ...(insight.action === 'buy' ? [{ id: 'buy', title: 'Buy Now', type: 'buy' as const, data: { symbol: insight.symbol } }] : []),
        ...(insight.action === 'sell' ? [{ id: 'sell', title: 'Sell Now', type: 'sell' as const, data: { symbol: insight.symbol } }] : [])
      ]
    });
  }

  // Process market news
  public async processNewsUpdate(news: any): Promise<void> {
    if (!this.settings.newsAlerts) return;

    const priority = news.impact === 'High' ? 'high' : 'normal';
    const emoji = news.sentiment === 'Positive' ? '📰' : news.sentiment === 'Negative' ? '⚠️' : '📄';

    await this.createAlert({
      type: 'news',
      title: `${emoji} ${news.title}`,
      body: news.summary,
      priority,
      symbol: news.symbol,
      data: { news },
      actionable: true,
      actions: [
        { id: 'view', title: 'Read More', type: 'view', data: { newsId: news.id } }
      ]
    });
  }

  // Create and manage alerts
  private async createAlert(alertData: Partial<NotificationAlert>): Promise<string> {
    const alert: NotificationAlert = {
      id: `alert_${Date.now()}_${Math.random()}`,
      createdAt: new Date(),
      delivered: false,
      read: false,
      actionable: false,
      ...alertData
    } as NotificationAlert;

    this.alerts.set(alert.id, alert);

    // Check if we should deliver immediately or batch
    const frequency = this.getAlertFrequency(alert.type);
    
    if (frequency === 'immediate' || alert.priority === 'critical') {
      await this.deliverAlert(alert);
    } else {
      await this.batchAlert(alert, frequency);
    }

    // Notify subscribers
    this.notifySubscribers(alert);

    // Save to storage
    await this.saveAlertsToStorage();

    return alert.id;
  }

  // Deliver alert immediately
  private async deliverAlert(alert: NotificationAlert): Promise<void> {
    if (!this.shouldDeliverNow()) {
      // Schedule for later if in quiet hours
      await this.scheduleAlert(alert);
      return;
    }

    try {
      const channelId = this.getChannelId(alert.type);
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: alert.title,
          body: alert.body,
          data: alert.data,
          priority: this.mapPriority(alert.priority),
          sound: alert.priority === 'critical' ? 'default' : undefined,
          badge: 1
        },
        trigger: null, // Immediate
        identifier: alert.id
      });

      alert.delivered = true;
      console.log(`Alert delivered: ${alert.title}`);
    } catch (error) {
      console.error('Failed to deliver alert:', error);
    }
  }

  // Batch alerts for delivery
  private async batchAlert(alert: NotificationAlert, frequency: string): Promise<void> {
    const batchKey = `${alert.type}_${frequency}`;
    
    if (!this.batchQueue.has(batchKey)) {
      this.batchQueue.set(batchKey, []);
    }
    
    this.batchQueue.get(batchKey)!.push(alert);

    // Set timer if not already set
    if (!this.batchTimers.has(batchKey)) {
      const delay = this.getBatchDelay(frequency);
      const timer = setTimeout(() => {
        this.deliverBatchedAlerts(batchKey);
      }, delay);
      
      this.batchTimers.set(batchKey, timer as unknown as NodeJS.Timeout);
    }
  }

  // Deliver batched alerts
  private async deliverBatchedAlerts(batchKey: string): Promise<void> {
    const alerts = this.batchQueue.get(batchKey) || [];
    if (alerts.length === 0) return;

    const [type] = batchKey.split('_');
    const title = `${alerts.length} ${type} update${alerts.length > 1 ? 's' : ''}`;
    const body = alerts.slice(0, 3).map(a => a.title).join(', ') + 
                 (alerts.length > 3 ? ` and ${alerts.length - 3} more` : '');

    await this.deliverAlert({
      id: `batch_${batchKey}_${Date.now()}`,
      type: type as any,
      title,
      body,
      priority: 'normal',
      data: { alerts: alerts.map(a => a.id) },
      createdAt: new Date(),
      delivered: false,
      read: false,
      actionable: false
    });

    // Mark individual alerts as delivered
    alerts.forEach(alert => {
      alert.delivered = true;
    });

    // Clear batch
    this.batchQueue.delete(batchKey);
    this.batchTimers.delete(batchKey);
  }

  // Schedule alert for later
  private async scheduleAlert(alert: NotificationAlert): Promise<void> {
    const nextDeliveryTime = this.getNextDeliveryTime();
    alert.scheduledFor = nextDeliveryTime;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: alert.title,
        body: alert.body,
        data: alert.data
      },
      trigger: {
        seconds: Math.floor((nextDeliveryTime.getTime() - Date.now()) / 1000),
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      },
      identifier: alert.id
    });
  }

  // Price alert management
  public async createPriceAlert(alert: Omit<PriceAlert, 'id' | 'createdAt'>): Promise<string> {
    const priceAlert: PriceAlert = {
      id: `price_alert_${Date.now()}_${Math.random()}`,
      createdAt: new Date(),
      ...alert
    };

    this.priceAlerts.set(priceAlert.id, priceAlert);
    await this.savePriceAlertsToStorage();
    
    return priceAlert.id;
  }

  public async deletePriceAlert(id: string): Promise<void> {
    this.priceAlerts.delete(id);
    await this.savePriceAlertsToStorage();
  }

  public async updatePriceAlert(id: string, updates: Partial<PriceAlert>): Promise<void> {
    const alert = this.priceAlerts.get(id);
    if (alert) {
      Object.assign(alert, updates);
      await this.savePriceAlertsToStorage();
    }
  }

  public getPriceAlerts(symbol?: string): PriceAlert[] {
    const alerts = Array.from(this.priceAlerts.values());
    return symbol ? alerts.filter(alert => alert.symbol === symbol) : alerts;
  }

  // Trigger price alert
  private async triggerPriceAlert(alert: PriceAlert, stock: NEPSEStock): Promise<void> {
    alert.triggeredAt = new Date();
    
    if (alert.oneTime) {
      alert.enabled = false;
    }

    const emoji = alert.condition === 'above' ? '📈' : alert.condition === 'below' ? '📉' : '⚡';
    const conditionText = alert.condition === 'above' ? 'above' : 
                         alert.condition === 'below' ? 'below' : 
                         'changed by';
    
    await this.createAlert({
      type: 'price',
      title: `${emoji} Price Alert: ${stock.symbol}`,
      body: `${stock.name} is now ${conditionText} ${alert.condition === 'change_percent' ? alert.value + '%' : 'NPR ' + alert.value}`,
      priority: 'high',
      symbol: stock.symbol,
      data: { alert, stock },
      actionable: true,
      actions: [
        { id: 'view', title: 'View Chart', type: 'view', data: { symbol: stock.symbol } },
        { id: 'trade', title: 'Trade Now', type: stock.change > 0 ? 'sell' : 'buy', data: { symbol: stock.symbol } }
      ]
    });

    await this.savePriceAlertsToStorage();
  }

  // Settings management
  public async updateSettings(settings: Partial<NotificationSettings>): Promise<void> {
    this.settings = { ...this.settings, ...settings };
    await this.saveSettingsToStorage();
  }

  public getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  // Alert management
  public getAlerts(options?: {
    unreadOnly?: boolean;
    symbol?: string;
    type?: string;
    limit?: number;
  }): NotificationAlert[] {
    let alerts = Array.from(this.alerts.values());

    if (options?.unreadOnly) {
      alerts = alerts.filter(alert => !alert.read);
    }

    if (options?.symbol) {
      alerts = alerts.filter(alert => alert.symbol === options.symbol);
    }

    if (options?.type) {
      alerts = alerts.filter(alert => alert.type === options.type);
    }

    alerts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    if (options?.limit) {
      alerts = alerts.slice(0, options.limit);
    }

    return alerts;
  }

  public async markAsRead(alertId: string): Promise<void> {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.read = true;
      await this.saveAlertsToStorage();
    }
  }

  public async markAllAsRead(): Promise<void> {
    this.alerts.forEach(alert => {
      alert.read = true;
    });
    await this.saveAlertsToStorage();
  }

  public async deleteAlert(alertId: string): Promise<void> {
    this.alerts.delete(alertId);
    await Notifications.cancelScheduledNotificationAsync(alertId);
    await this.saveAlertsToStorage();
  }

  public getUnreadCount(): number {
    return Array.from(this.alerts.values()).filter(alert => !alert.read).length;
  }

  // Helper methods
  private getDefaultSettings(): NotificationSettings {
    return {
      enabled: true,
      priceAlerts: true,
      volumeAlerts: true,
      newsAlerts: true,
      aiInsights: true,
      marketUpdates: true,
      portfolioUpdates: true,
      earningsAlerts: true,
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00'
      },
      frequency: {
        priceAlerts: 'immediate',
        newsAlerts: 'batched_15min',
        aiInsights: 'immediate'
      },
      channels: {
        push: true,
        email: false,
        sms: false
      }
    };
  }

  private getAlertFrequency(type: string): string {
    switch (type) {
      case 'price':
      case 'volume':
        return this.settings.frequency.priceAlerts;
      case 'news':
        return this.settings.frequency.newsAlerts;
      case 'ai_insight':
        return this.settings.frequency.aiInsights;
      default:
        return 'immediate';
    }
  }

  private getBatchDelay(frequency: string): number {
    switch (frequency) {
      case 'batched_5min': return 5 * 60 * 1000;
      case 'batched_15min': return 15 * 60 * 1000;
      case 'batched_1hour': return 60 * 60 * 1000;
      case 'daily': return 24 * 60 * 60 * 1000;
      default: return 0;
    }
  }

  private shouldDeliverNow(): boolean {
    if (!this.settings.quietHours.enabled) return true;

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const start = this.settings.quietHours.start;
    const end = this.settings.quietHours.end;

    if (start <= end) {
      return currentTime < start || currentTime >= end;
    } else {
      return currentTime >= end && currentTime < start;
    }
  }

  private getNextDeliveryTime(): Date {
    const now = new Date();
    const [endHour, endMinute] = this.settings.quietHours.end.split(':').map(Number);
    
    const nextDelivery = new Date(now);
    nextDelivery.setHours(endHour, endMinute, 0, 0);
    
    if (nextDelivery <= now) {
      nextDelivery.setDate(nextDelivery.getDate() + 1);
    }
    
    return nextDelivery;
  }

  private getChannelId(type: string): string {
    switch (type) {
      case 'price':
      case 'volume':
        return 'price_alerts';
      case 'news':
        return 'news_alerts';
      case 'ai_insight':
        return 'ai_insights';
      case 'market':
        return 'market_updates';
      case 'portfolio':
        return 'portfolio_updates';
      default:
        return 'default';
    }
  }

  private mapPriority(priority: string): Notifications.AndroidNotificationPriority {
    switch (priority) {
      case 'critical':
        return Notifications.AndroidNotificationPriority.MAX;
      case 'high':
        return Notifications.AndroidNotificationPriority.HIGH;
      case 'normal':
        return Notifications.AndroidNotificationPriority.DEFAULT;
      case 'low':
        return Notifications.AndroidNotificationPriority.LOW;
      default:
        return Notifications.AndroidNotificationPriority.DEFAULT;
    }
  }

  private notifySubscribers(alert: NotificationAlert): void {
    this.subscribers.forEach(callback => {
      try {
        callback(alert);
      } catch (error) {
        console.error('Error notifying subscriber:', error);
      }
    });
  }

  // Storage methods
  private async loadStoredData(): Promise<void> {
    try {
      const [alertsData, priceAlertsData, settingsData] = await Promise.all([
        AsyncStorage.getItem('notification_alerts'),
        AsyncStorage.getItem('price_alerts'),
        AsyncStorage.getItem('notification_settings')
      ]);

      if (alertsData) {
        const alerts = JSON.parse(alertsData);
        alerts.forEach((alert: any) => {
          alert.createdAt = new Date(alert.createdAt);
          if (alert.scheduledFor) alert.scheduledFor = new Date(alert.scheduledFor);
          this.alerts.set(alert.id, alert);
        });
      }

      if (priceAlertsData) {
        const priceAlerts = JSON.parse(priceAlertsData);
        priceAlerts.forEach((alert: any) => {
          alert.createdAt = new Date(alert.createdAt);
          if (alert.triggeredAt) alert.triggeredAt = new Date(alert.triggeredAt);
          this.priceAlerts.set(alert.id, alert);
        });
      }

      if (settingsData) {
        this.settings = { ...this.settings, ...JSON.parse(settingsData) };
      }
    } catch (error) {
      console.error('Failed to load stored notification data:', error);
    }
  }

  private async saveAlertsToStorage(): Promise<void> {
    try {
      const alerts = Array.from(this.alerts.values());
      await AsyncStorage.setItem('notification_alerts', JSON.stringify(alerts));
    } catch (error) {
      console.error('Failed to save alerts to storage:', error);
    }
  }

  private async savePriceAlertsToStorage(): Promise<void> {
    try {
      const priceAlerts = Array.from(this.priceAlerts.values());
      await AsyncStorage.setItem('price_alerts', JSON.stringify(priceAlerts));
    } catch (error) {
      console.error('Failed to save price alerts to storage:', error);
    }
  }

  private async saveSettingsToStorage(): Promise<void> {
    try {
      await AsyncStorage.setItem('notification_settings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('Failed to save settings to storage:', error);
    }
  }

  // Cleanup
  public cleanup(): void {
    this.batchTimers.forEach(timer => clearTimeout(timer));
    this.batchTimers.clear();
    this.batchQueue.clear();
    this.subscribers.clear();
  }
}

export default NotificationService;
export type {
  NotificationAlert,
  NotificationAction,
  PriceAlert,
  NotificationSettings
};