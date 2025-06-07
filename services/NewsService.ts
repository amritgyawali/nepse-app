import AsyncStorage from '@react-native-async-storage/async-storage';
import { NEPSEStock } from './NEPSEDataService';

interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  source: string;
  author?: string;
  publishedAt: Date;
  updatedAt?: Date;
  category: NewsCategory;
  tags: string[];
  relatedSymbols: string[];
  imageUrl?: string;
  url: string;
  sentiment: SentimentAnalysis;
  readTime: number; // in minutes
  views: number;
  likes: number;
  bookmarked: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  verified: boolean;
  language: 'en' | 'ne';
}

interface SentimentAnalysis {
  score: number; // -1 to 1 (negative to positive)
  magnitude: number; // 0 to 1 (neutral to strong)
  label: 'very_negative' | 'negative' | 'neutral' | 'positive' | 'very_positive';
  confidence: number; // 0 to 1
  keywords: string[];
  entities: EntityMention[];
}

interface EntityMention {
  name: string;
  type: 'PERSON' | 'ORGANIZATION' | 'LOCATION' | 'EVENT' | 'STOCK' | 'SECTOR';
  sentiment: number;
  salience: number; // importance score
}

type NewsCategory = 
  | 'market_news'
  | 'company_news'
  | 'economic_indicators'
  | 'regulatory_updates'
  | 'earnings'
  | 'ipo_news'
  | 'sector_analysis'
  | 'global_markets'
  | 'cryptocurrency'
  | 'commodities'
  | 'banking'
  | 'insurance'
  | 'hydropower'
  | 'manufacturing'
  | 'tourism'
  | 'technology'
  | 'real_estate'
  | 'education'
  | 'breaking_news';

interface NewsFilter {
  categories: NewsCategory[];
  symbols: string[];
  sources: string[];
  sentiment: ('positive' | 'negative' | 'neutral')[];
  dateRange: {
    from: Date;
    to: Date;
  };
  language: 'en' | 'ne' | 'both';
  priority: ('low' | 'medium' | 'high' | 'urgent')[];
  verified: boolean;
}

interface NewsSource {
  id: string;
  name: string;
  url: string;
  rssUrl?: string;
  apiUrl?: string;
  credibilityScore: number; // 0 to 1
  updateFrequency: number; // minutes
  language: 'en' | 'ne';
  categories: NewsCategory[];
  active: boolean;
}

interface NewsAlert {
  id: string;
  type: 'keyword' | 'symbol' | 'category' | 'sentiment';
  criteria: {
    keywords?: string[];
    symbols?: string[];
    categories?: NewsCategory[];
    sentimentThreshold?: number;
  };
  enabled: boolean;
  frequency: 'immediate' | 'hourly' | 'daily';
  lastTriggered?: Date;
  createdAt: Date;
}

interface TrendingTopic {
  keyword: string;
  mentions: number;
  sentiment: number;
  growth: number; // percentage change
  relatedSymbols: string[];
  category: NewsCategory;
  timeframe: '1h' | '6h' | '24h' | '7d';
}

interface NewsAnalytics {
  totalArticles: number;
  categoriesDistribution: { [key in NewsCategory]?: number };
  sentimentDistribution: {
    positive: number;
    negative: number;
    neutral: number;
  };
  topSources: { source: string; count: number; credibility: number }[];
  trendingTopics: TrendingTopic[];
  mostReadArticles: NewsArticle[];
  recentBreakingNews: NewsArticle[];
}

interface PersonalizedFeed {
  userId: string;
  preferences: {
    categories: NewsCategory[];
    symbols: string[];
    sources: string[];
    language: 'en' | 'ne' | 'both';
    sentimentPreference: 'all' | 'positive' | 'negative';
  };
  readingHistory: string[]; // article IDs
  bookmarks: string[]; // article IDs
  lastUpdated: Date;
}

class NewsService {
  private static instance: NewsService;
  private articles: Map<string, NewsArticle> = new Map();
  private sources: Map<string, NewsSource> = new Map();
  private alerts: Map<string, NewsAlert> = new Map();
  private personalizedFeed: PersonalizedFeed | null = null;
  private subscribers: Map<string, (data: any) => void> = new Map();
  private updateInterval: NodeJS.Timeout | number | null = null;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private constructor() {
    this.initializeDefaultSources();
    this.loadStoredData();
    this.startPeriodicUpdates();
  }

  public static getInstance(): NewsService {
    if (!NewsService.instance) {
      NewsService.instance = new NewsService();
    }
    return NewsService.instance;
  }

  // Subscription Management
  public subscribe(event: string, callback: (data: any) => void): string {
    const id = `${event}_${Date.now()}_${Math.random()}`;
    this.subscribers.set(id, callback);
    return id;
  }

  public unsubscribe(id: string): void {
    this.subscribers.delete(id);
  }

  // News Fetching
  public async fetchLatestNews(force: boolean = false): Promise<NewsArticle[]> {
    const cacheKey = 'latest_news';
    
    if (!force) {
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;
    }

    try {
      const articles = await this.fetchFromMultipleSources();
      this.setCache(cacheKey, articles);
      
      // Update local storage
      articles.forEach(article => {
        this.articles.set(article.id, article);
      });
      
      await this.saveArticlesToStorage();
      this.notifySubscribers('news_updated', articles);
      
      return articles;
    } catch (error) {
      console.error('Failed to fetch latest news:', error);
      return this.getMockNews();
    }
  }

  private async fetchFromMultipleSources(): Promise<NewsArticle[]> {
    const activeSources = Array.from(this.sources.values()).filter(s => s.active);
    const fetchPromises = activeSources.map(source => this.fetchFromSource(source));
    
    const results = await Promise.allSettled(fetchPromises);
    const allArticles: NewsArticle[] = [];
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        allArticles.push(...result.value);
      } else {
        console.warn(`Failed to fetch from source ${activeSources[index].name}:`, result.reason);
      }
    });
    
    // Remove duplicates and sort by relevance
    const uniqueArticles = this.removeDuplicates(allArticles);
    return this.sortByRelevance(uniqueArticles);
  }

  private async fetchFromSource(source: NewsSource): Promise<NewsArticle[]> {
    // In a real implementation, this would fetch from actual news APIs
    // For now, return mock data based on source
    return this.generateMockArticlesForSource(source);
  }

  private generateMockArticlesForSource(source: NewsSource): NewsArticle[] {
    const mockArticles: NewsArticle[] = [];
    const categories = source.categories;
    const articlesPerCategory = Math.floor(10 / categories.length);
    
    categories.forEach(category => {
      for (let i = 0; i < articlesPerCategory; i++) {
        const article = this.generateMockArticle(source, category);
        mockArticles.push(article);
      }
    });
    
    return mockArticles;
  }

  private generateMockArticle(source: NewsSource, category: NewsCategory): NewsArticle {
    const titles = {
      market_news: [
        'NEPSE Index Reaches New High Amid Strong Trading Volume',
        'Banking Sector Shows Resilient Performance in Q3',
        'Foreign Investment in Nepal Stock Market Increases by 25%'
      ],
      company_news: [
        'NABIL Bank Announces Strong Quarterly Results',
        'Himalayan Bank Plans Major Digital Transformation',
        'NIC Asia Bank Expands Rural Banking Network'
      ],
      economic_indicators: [
        'Nepal GDP Growth Projected at 6.5% for FY 2024',
        'Inflation Rate Stabilizes at 4.2% in Latest Report',
        'Foreign Exchange Reserves Hit Record High'
      ],
      regulatory_updates: [
        'SEBON Introduces New Trading Rules for Retail Investors',
        'Nepal Rastra Bank Revises Interest Rate Policy',
        'New IPO Guidelines Announced by Securities Board'
      ]
    };
    
    const categoryTitles = titles[category as keyof typeof titles] || titles.market_news;
    const title = categoryTitles[Math.floor(Math.random() * categoryTitles.length)];
    
    const sentiment = this.generateSentimentAnalysis(title);
    const relatedSymbols = this.extractRelatedSymbols(title);
    
    return {
      id: `article_${Date.now()}_${Math.random()}`,
      title,
      summary: `${title.substring(0, 100)}...`,
      content: this.generateMockContent(title, category),
      source: source.name,
      author: this.generateRandomAuthor(),
      publishedAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
      category,
      tags: this.generateTags(category),
      relatedSymbols,
      imageUrl: `https://picsum.photos/400/200?random=${Math.random()}`,
      url: `${source.url}/article/${Date.now()}`,
      sentiment,
      readTime: Math.ceil(Math.random() * 10) + 2,
      views: Math.floor(Math.random() * 10000),
      likes: Math.floor(Math.random() * 500),
      bookmarked: false,
      priority: this.determinePriority(sentiment, category),
      verified: source.credibilityScore > 0.7,
      language: source.language
    };
  }

  private generateSentimentAnalysis(title: string): SentimentAnalysis {
    const positiveWords = ['high', 'strong', 'growth', 'increase', 'profit', 'success', 'record'];
    const negativeWords = ['decline', 'loss', 'fall', 'crisis', 'concern', 'risk', 'drop'];
    
    const words = title.toLowerCase().split(' ');
    let score = 0;
    const keywords: string[] = [];
    
    words.forEach(word => {
      if (positiveWords.includes(word)) {
        score += 0.3;
        keywords.push(word);
      } else if (negativeWords.includes(word)) {
        score -= 0.3;
        keywords.push(word);
      }
    });
    
    score = Math.max(-1, Math.min(1, score));
    const magnitude = Math.abs(score);
    
    let label: SentimentAnalysis['label'];
    if (score > 0.6) label = 'very_positive';
    else if (score > 0.2) label = 'positive';
    else if (score < -0.6) label = 'very_negative';
    else if (score < -0.2) label = 'negative';
    else label = 'neutral';
    
    return {
      score,
      magnitude,
      label,
      confidence: 0.7 + Math.random() * 0.3,
      keywords,
      entities: this.extractEntities(title)
    };
  }

  private extractEntities(text: string): EntityMention[] {
    const entities: EntityMention[] = [];
    const stockSymbols = ['NABIL', 'NICA', 'EBL', 'KBL', 'SANIMA', 'MEGA', 'GLOBAL', 'PRIME'];
    const organizations = ['SEBON', 'NRB', 'NEPSE', 'CDS', 'CLEARING'];
    
    stockSymbols.forEach(symbol => {
      if (text.toUpperCase().includes(symbol)) {
        entities.push({
          name: symbol,
          type: 'STOCK',
          sentiment: Math.random() * 2 - 1,
          salience: Math.random()
        });
      }
    });
    
    organizations.forEach(org => {
      if (text.toUpperCase().includes(org)) {
        entities.push({
          name: org,
          type: 'ORGANIZATION',
          sentiment: Math.random() * 2 - 1,
          salience: Math.random()
        });
      }
    });
    
    return entities;
  }

  private extractRelatedSymbols(title: string): string[] {
    const stockSymbols = ['NABIL', 'NICA', 'EBL', 'KBL', 'SANIMA', 'MEGA', 'GLOBAL', 'PRIME'];
    return stockSymbols.filter(symbol => title.toUpperCase().includes(symbol));
  }

  private generateTags(category: NewsCategory): string[] {
    const tagMap: { [key in NewsCategory]: string[] } = {
      market_news: ['market', 'trading', 'volume', 'index'],
      company_news: ['earnings', 'corporate', 'business', 'financial'],
      economic_indicators: ['economy', 'gdp', 'inflation', 'growth'],
      regulatory_updates: ['regulation', 'policy', 'compliance', 'rules'],
      earnings: ['quarterly', 'profit', 'revenue', 'results'],
      ipo_news: ['ipo', 'listing', 'public', 'offering'],
      sector_analysis: ['sector', 'industry', 'analysis', 'trends'],
      global_markets: ['global', 'international', 'world', 'markets'],
      cryptocurrency: ['crypto', 'bitcoin', 'blockchain', 'digital'],
      commodities: ['gold', 'oil', 'commodities', 'resources'],
      banking: ['bank', 'financial', 'credit', 'deposits'],
      insurance: ['insurance', 'coverage', 'premium', 'claims'],
      hydropower: ['energy', 'power', 'electricity', 'renewable'],
      manufacturing: ['production', 'factory', 'industrial', 'manufacturing'],
      tourism: ['tourism', 'hospitality', 'travel', 'hotels'],
      technology: ['tech', 'innovation', 'digital', 'software'],
      real_estate: ['property', 'real estate', 'construction', 'housing'],
      education: ['education', 'learning', 'academic', 'schools'],
      breaking_news: ['breaking', 'urgent', 'alert', 'immediate']
    };
    
    return tagMap[category] || ['general', 'news'];
  }

  private generateMockContent(title: string, category: NewsCategory): string {
    const paragraphs = [
      `${title} - This development marks a significant milestone in Nepal's financial sector.`,
      'Market analysts suggest that this trend reflects growing investor confidence and improved economic fundamentals.',
      'The regulatory environment continues to evolve, providing better protection for retail investors while encouraging institutional participation.',
      'Industry experts believe this momentum will continue in the coming quarters, supported by strong macroeconomic indicators.',
      'Stakeholders are closely monitoring these developments as they could have far-reaching implications for the broader economy.'
    ];
    
    return paragraphs.join('\n\n');
  }

  private generateRandomAuthor(): string {
    const authors = [
      'Rajesh Sharma',
      'Priya Patel',
      'Amit Thapa',
      'Sunita Rai',
      'Deepak Gurung',
      'Kamala Shrestha',
      'Bikash Adhikari',
      'Sita Tamang'
    ];
    
    return authors[Math.floor(Math.random() * authors.length)];
  }

  private determinePriority(sentiment: SentimentAnalysis, category: NewsCategory): 'low' | 'medium' | 'high' | 'urgent' {
    if (category === 'breaking_news') return 'urgent';
    if (category === 'regulatory_updates') return 'high';
    if (Math.abs(sentiment.score) > 0.7) return 'high';
    if (Math.abs(sentiment.score) > 0.3) return 'medium';
    return 'low';
  }

  private removeDuplicates(articles: NewsArticle[]): NewsArticle[] {
    const seen = new Set<string>();
    return articles.filter(article => {
      const key = `${article.title}_${article.source}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private sortByRelevance(articles: NewsArticle[]): NewsArticle[] {
    return articles.sort((a, b) => {
      // Sort by priority, then by publish date, then by sentiment magnitude
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority];
      const bPriority = priorityOrder[b.priority];
      
      if (aPriority !== bPriority) return bPriority - aPriority;
      
      const timeDiff = b.publishedAt.getTime() - a.publishedAt.getTime();
      if (Math.abs(timeDiff) > 60 * 60 * 1000) return timeDiff; // 1 hour threshold
      
      return b.sentiment.magnitude - a.sentiment.magnitude;
    });
  }

  // News Filtering and Search
  public searchNews(query: string, filters?: Partial<NewsFilter>): NewsArticle[] {
    const allArticles = Array.from(this.articles.values());
    
    let filtered = allArticles.filter(article => {
      const matchesQuery = !query || 
        article.title.toLowerCase().includes(query.toLowerCase()) ||
        article.summary.toLowerCase().includes(query.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())) ||
        article.relatedSymbols.some(symbol => symbol.toLowerCase().includes(query.toLowerCase()));
      
      if (!matchesQuery) return false;
      
      if (filters) {
        if (filters.categories && !filters.categories.includes(article.category)) return false;
        if (filters.symbols && !filters.symbols.some(symbol => article.relatedSymbols.includes(symbol))) return false;
        if (filters.sources && !filters.sources.includes(article.source)) return false;
        if (filters.sentiment && !filters.sentiment.includes(this.mapSentimentLabel(article.sentiment.label))) return false;
        if (filters.language && filters.language !== 'both' && article.language !== filters.language) return false;
        if (filters.priority && !filters.priority.includes(article.priority)) return false;
        if (filters.verified !== undefined && article.verified !== filters.verified) return false;
        
        if (filters.dateRange) {
          const publishDate = article.publishedAt;
          if (publishDate < filters.dateRange.from || publishDate > filters.dateRange.to) return false;
        }
      }
      
      return true;
    });
    
    return this.sortByRelevance(filtered);
  }

  private mapSentimentLabel(label: SentimentAnalysis['label']): 'positive' | 'negative' | 'neutral' {
    if (label === 'positive' || label === 'very_positive') return 'positive';
    if (label === 'negative' || label === 'very_negative') return 'negative';
    return 'neutral';
  }

  public getNewsByCategory(category: NewsCategory, limit: number = 20): NewsArticle[] {
    const articles = Array.from(this.articles.values())
      .filter(article => article.category === category)
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
      .slice(0, limit);
    
    return articles;
  }

  public getNewsBySymbol(symbol: string, limit: number = 10): NewsArticle[] {
    const articles = Array.from(this.articles.values())
      .filter(article => article.relatedSymbols.includes(symbol))
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
      .slice(0, limit);
    
    return articles;
  }

  // Trending and Analytics
  public getTrendingTopics(timeframe: '1h' | '6h' | '24h' | '7d' = '24h'): TrendingTopic[] {
    const cutoffTime = this.getTimeframeCutoff(timeframe);
    const recentArticles = Array.from(this.articles.values())
      .filter(article => article.publishedAt >= cutoffTime);
    
    const keywordCounts = new Map<string, {
      count: number;
      sentiment: number;
      symbols: Set<string>;
      category: NewsCategory;
    }>();
    
    recentArticles.forEach(article => {
      article.tags.forEach(tag => {
        const existing = keywordCounts.get(tag) || {
          count: 0,
          sentiment: 0,
          symbols: new Set(),
          category: article.category
        };
        
        existing.count++;
        existing.sentiment += article.sentiment.score;
        article.relatedSymbols.forEach(symbol => existing.symbols.add(symbol));
        keywordCounts.set(tag, existing);
      });
    });
    
    const trending: TrendingTopic[] = [];
    keywordCounts.forEach((data, keyword) => {
      if (data.count >= 3) { // Minimum threshold
        trending.push({
          keyword,
          mentions: data.count,
          sentiment: data.sentiment / data.count,
          growth: this.calculateGrowth(keyword, timeframe),
          relatedSymbols: Array.from(data.symbols),
          category: data.category,
          timeframe
        });
      }
    });
    
    return trending.sort((a, b) => b.mentions - a.mentions).slice(0, 10);
  }

  private getTimeframeCutoff(timeframe: string): Date {
    const now = new Date();
    switch (timeframe) {
      case '1h': return new Date(now.getTime() - 60 * 60 * 1000);
      case '6h': return new Date(now.getTime() - 6 * 60 * 60 * 1000);
      case '24h': return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case '7d': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      default: return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }
  }

  private calculateGrowth(keyword: string, timeframe: string): number {
    // Simplified growth calculation
    return Math.random() * 200 - 100; // -100% to +100%
  }

  public getNewsAnalytics(): NewsAnalytics {
    const articles = Array.from(this.articles.values());
    const last24h = articles.filter(a => 
      a.publishedAt >= new Date(Date.now() - 24 * 60 * 60 * 1000)
    );
    
    // Categories distribution
    const categoriesDistribution: { [key in NewsCategory]?: number } = {};
    articles.forEach(article => {
      categoriesDistribution[article.category] = (categoriesDistribution[article.category] || 0) + 1;
    });
    
    // Sentiment distribution
    const sentimentDistribution = {
      positive: articles.filter(a => a.sentiment.score > 0.2).length,
      negative: articles.filter(a => a.sentiment.score < -0.2).length,
      neutral: articles.filter(a => Math.abs(a.sentiment.score) <= 0.2).length
    };
    
    // Top sources
    const sourceCounts = new Map<string, number>();
    articles.forEach(article => {
      sourceCounts.set(article.source, (sourceCounts.get(article.source) || 0) + 1);
    });
    
    const topSources = Array.from(sourceCounts.entries())
      .map(([source, count]) => ({
        source,
        count,
        credibility: this.sources.get(source)?.credibilityScore || 0.5
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    return {
      totalArticles: articles.length,
      categoriesDistribution,
      sentimentDistribution,
      topSources,
      trendingTopics: this.getTrendingTopics('24h'),
      mostReadArticles: articles.sort((a, b) => b.views - a.views).slice(0, 5),
      recentBreakingNews: articles
        .filter(a => a.priority === 'urgent')
        .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
        .slice(0, 3)
    };
  }

  // Personalization
  public async initializePersonalizedFeed(userId: string, preferences: PersonalizedFeed['preferences']): Promise<void> {
    this.personalizedFeed = {
      userId,
      preferences,
      readingHistory: [],
      bookmarks: [],
      lastUpdated: new Date()
    };
    
    await this.savePersonalizedFeedToStorage();
  }

  public async updatePreferences(preferences: Partial<PersonalizedFeed['preferences']>): Promise<void> {
    if (!this.personalizedFeed) return;
    
    Object.assign(this.personalizedFeed.preferences, preferences);
    this.personalizedFeed.lastUpdated = new Date();
    
    await this.savePersonalizedFeedToStorage();
    this.notifySubscribers('preferences_updated', this.personalizedFeed.preferences);
  }

  public getPersonalizedFeed(limit: number = 20): NewsArticle[] {
    if (!this.personalizedFeed) {
      return this.getLatestArticles(limit);
    }
    
    const { preferences, readingHistory } = this.personalizedFeed;
    const allArticles = Array.from(this.articles.values());
    
    // Score articles based on preferences
    const scoredArticles = allArticles.map(article => {
      let score = 0;
      
      // Category preference
      if (preferences.categories.includes(article.category)) score += 3;
      
      // Symbol preference
      if (preferences.symbols.some(symbol => article.relatedSymbols.includes(symbol))) score += 4;
      
      // Source preference
      if (preferences.sources.includes(article.source)) score += 2;
      
      // Language preference
      if (preferences.language === 'both' || article.language === preferences.language) score += 1;
      
      // Sentiment preference
      if (preferences.sentimentPreference === 'all' ||
          (preferences.sentimentPreference === 'positive' && article.sentiment.score > 0.2) ||
          (preferences.sentimentPreference === 'negative' && article.sentiment.score < -0.2)) {
        score += 1;
      }
      
      // Penalize already read articles
      if (readingHistory.includes(article.id)) score -= 2;
      
      // Boost recent articles
      const hoursOld = (Date.now() - article.publishedAt.getTime()) / (1000 * 60 * 60);
      if (hoursOld < 6) score += 2;
      else if (hoursOld < 24) score += 1;
      
      return { article, score };
    });
    
    return scoredArticles
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.article);
  }

  public async markAsRead(articleId: string): Promise<void> {
    if (!this.personalizedFeed) return;
    
    if (!this.personalizedFeed.readingHistory.includes(articleId)) {
      this.personalizedFeed.readingHistory.push(articleId);
      
      // Keep only last 1000 read articles
      if (this.personalizedFeed.readingHistory.length > 1000) {
        this.personalizedFeed.readingHistory = this.personalizedFeed.readingHistory.slice(-1000);
      }
      
      await this.savePersonalizedFeedToStorage();
    }
    
    // Update article views
    const article = this.articles.get(articleId);
    if (article) {
      article.views++;
      await this.saveArticlesToStorage();
    }
  }

  public async toggleBookmark(articleId: string): Promise<boolean> {
    if (!this.personalizedFeed) return false;
    
    const index = this.personalizedFeed.bookmarks.indexOf(articleId);
    let isBookmarked: boolean;
    
    if (index === -1) {
      this.personalizedFeed.bookmarks.push(articleId);
      isBookmarked = true;
    } else {
      this.personalizedFeed.bookmarks.splice(index, 1);
      isBookmarked = false;
    }
    
    // Update article bookmark status
    const article = this.articles.get(articleId);
    if (article) {
      article.bookmarked = isBookmarked;
    }
    
    await this.savePersonalizedFeedToStorage();
    await this.saveArticlesToStorage();
    
    this.notifySubscribers('bookmark_toggled', { articleId, isBookmarked });
    return isBookmarked;
  }

  public getBookmarkedArticles(): NewsArticle[] {
    if (!this.personalizedFeed) return [];
    
    return this.personalizedFeed.bookmarks
      .map(id => this.articles.get(id))
      .filter(article => article !== undefined) as NewsArticle[];
  }

  // Alert Management
  public async createNewsAlert(alert: Omit<NewsAlert, 'id' | 'createdAt'>): Promise<string> {
    const id = `alert_${Date.now()}_${Math.random()}`;
    const newAlert: NewsAlert = {
      id,
      createdAt: new Date(),
      ...alert
    };
    
    this.alerts.set(id, newAlert);
    await this.saveAlertsToStorage();
    
    this.notifySubscribers('alert_created', newAlert);
    return id;
  }

  public async updateNewsAlert(id: string, updates: Partial<NewsAlert>): Promise<void> {
    const alert = this.alerts.get(id);
    if (!alert) throw new Error('Alert not found');
    
    Object.assign(alert, updates);
    await this.saveAlertsToStorage();
    
    this.notifySubscribers('alert_updated', alert);
  }

  public async deleteNewsAlert(id: string): Promise<void> {
    this.alerts.delete(id);
    await this.saveAlertsToStorage();
    
    this.notifySubscribers('alert_deleted', { id });
  }

  public getNewsAlerts(): NewsAlert[] {
    return Array.from(this.alerts.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Check alerts for new articles
  private async checkAlerts(articles: NewsArticle[]): Promise<void> {
    const activeAlerts = Array.from(this.alerts.values()).filter(alert => alert.enabled);
    
    for (const alert of activeAlerts) {
      const matchingArticles = articles.filter(article => this.articleMatchesAlert(article, alert));
      
      if (matchingArticles.length > 0) {
        await this.triggerAlert(alert, matchingArticles);
      }
    }
  }

  private articleMatchesAlert(article: NewsArticle, alert: NewsAlert): boolean {
    const { criteria } = alert;
    
    if (criteria.keywords) {
      const hasKeyword = criteria.keywords.some(keyword => 
        article.title.toLowerCase().includes(keyword.toLowerCase()) ||
        article.summary.toLowerCase().includes(keyword.toLowerCase())
      );
      if (!hasKeyword) return false;
    }
    
    if (criteria.symbols) {
      const hasSymbol = criteria.symbols.some(symbol => 
        article.relatedSymbols.includes(symbol)
      );
      if (!hasSymbol) return false;
    }
    
    if (criteria.categories) {
      if (!criteria.categories.includes(article.category)) return false;
    }
    
    if (criteria.sentimentThreshold !== undefined) {
      if (Math.abs(article.sentiment.score) < criteria.sentimentThreshold) return false;
    }
    
    return true;
  }

  private async triggerAlert(alert: NewsAlert, articles: NewsArticle[]): Promise<void> {
    // Update last triggered time
    alert.lastTriggered = new Date();
    await this.saveAlertsToStorage();
    
    // Notify subscribers
    this.notifySubscribers('alert_triggered', {
      alert,
      articles: articles.slice(0, 5) // Limit to 5 articles per alert
    });
  }

  // Utility Methods
  public getLatestArticles(limit: number = 20): NewsArticle[] {
    return Array.from(this.articles.values())
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
      .slice(0, limit);
  }

  public getArticle(id: string): NewsArticle | undefined {
    return this.articles.get(id);
  }

  public async likeArticle(articleId: string): Promise<void> {
    const article = this.articles.get(articleId);
    if (article) {
      article.likes++;
      await this.saveArticlesToStorage();
      this.notifySubscribers('article_liked', { articleId, likes: article.likes });
    }
  }

  // Source Management
  private initializeDefaultSources(): void {
    const defaultSources: NewsSource[] = [
      {
        id: 'nepse_official',
        name: 'NEPSE Official',
        url: 'https://nepalstock.com',
        credibilityScore: 0.95,
        updateFrequency: 15,
        language: 'en',
        categories: ['market_news', 'regulatory_updates', 'company_news'],
        active: true
      },
      {
        id: 'sebon_official',
        name: 'SEBON',
        url: 'https://sebon.gov.np',
        credibilityScore: 0.98,
        updateFrequency: 30,
        language: 'en',
        categories: ['regulatory_updates', 'ipo_news'],
        active: true
      },
      {
        id: 'nrb_official',
        name: 'Nepal Rastra Bank',
        url: 'https://nrb.org.np',
        credibilityScore: 0.97,
        updateFrequency: 60,
        language: 'en',
        categories: ['economic_indicators', 'banking', 'regulatory_updates'],
        active: true
      },
      {
        id: 'sharesansar',
        name: 'ShareSansar',
        url: 'https://sharesansar.com',
        credibilityScore: 0.85,
        updateFrequency: 10,
        language: 'en',
        categories: ['market_news', 'company_news', 'sector_analysis'],
        active: true
      },
      {
        id: 'merolagani',
        name: 'MeroLagani',
        url: 'https://merolagani.com',
        credibilityScore: 0.82,
        updateFrequency: 15,
        language: 'en',
        categories: ['market_news', 'company_news', 'earnings'],
        active: true
      }
    ];
    
    defaultSources.forEach(source => {
      this.sources.set(source.id, source);
    });
  }

  // Cache Management
  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // Periodic Updates
  private startPeriodicUpdates(): void {
    // Update news every 5 minutes
    this.updateInterval = setInterval(async () => {


      try {
        const newArticles = await this.fetchLatestNews(true);
        await this.checkAlerts(newArticles);
      } catch (error) {
        console.error('Periodic update failed:', error);
      }
    }, 5 * 60 * 1000);
  }

  // Mock Data
  private getMockNews(): NewsArticle[] {
    const mockSources = Array.from(this.sources.values()).slice(0, 3);
    const allMockArticles: NewsArticle[] = [];
    
    mockSources.forEach(source => {
      const articles = this.generateMockArticlesForSource(source);
      allMockArticles.push(...articles);
    });
    
    return this.sortByRelevance(allMockArticles);
  }

  // Notification
  private notifySubscribers(event: string, data: any): void {
    this.subscribers.forEach((callback, key) => {
      if (key.includes(event)) {
        try {
          callback(data);
        } catch (error) {
          console.error('Error notifying subscriber:', error);
        }
      }
    });
  }

  // Storage Methods
  private async loadStoredData(): Promise<void> {
    try {
      const [articlesData, alertsData, feedData] = await Promise.all([
        AsyncStorage.getItem('news_articles'),
        AsyncStorage.getItem('news_alerts'),
        AsyncStorage.getItem('personalized_feed')
      ]);

      if (articlesData) {
        const articles = JSON.parse(articlesData);
        articles.forEach((article: any) => {
          article.publishedAt = new Date(article.publishedAt);
          if (article.updatedAt) article.updatedAt = new Date(article.updatedAt);
          this.articles.set(article.id, article);
        });
      }

      if (alertsData) {
        const alerts = JSON.parse(alertsData);
        alerts.forEach((alert: any) => {
          alert.createdAt = new Date(alert.createdAt);
          if (alert.lastTriggered) alert.lastTriggered = new Date(alert.lastTriggered);
          this.alerts.set(alert.id, alert);
        });
      }

      if (feedData) {
        const feed = JSON.parse(feedData);
        feed.lastUpdated = new Date(feed.lastUpdated);
        this.personalizedFeed = feed;
      }
    } catch (error) {
      console.error('Failed to load news data:', error);
    }
  }

  private async saveArticlesToStorage(): Promise<void> {
    try {
      const articles = Array.from(this.articles.values());
      await AsyncStorage.setItem('news_articles', JSON.stringify(articles));
    } catch (error) {
      console.error('Failed to save articles:', error);
    }
  }

  private async saveAlertsToStorage(): Promise<void> {
    try {
      const alerts = Array.from(this.alerts.values());
      await AsyncStorage.setItem('news_alerts', JSON.stringify(alerts));
    } catch (error) {
      console.error('Failed to save alerts:', error);
    }
  }

  private async savePersonalizedFeedToStorage(): Promise<void> {
    try {
      if (this.personalizedFeed) {
        await AsyncStorage.setItem('personalized_feed', JSON.stringify(this.personalizedFeed));
      }
    } catch (error) {
      console.error('Failed to save personalized feed:', error);
    }
  }

  // Cleanup
  public cleanup(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    this.subscribers.clear();
    this.cache.clear();
  }
}

export default NewsService;
export type {
  NewsArticle,
  SentimentAnalysis,
  EntityMention,
  NewsCategory,
  NewsFilter,
  NewsSource,
  NewsAlert,
  TrendingTopic,
  NewsAnalytics,
  PersonalizedFeed
};