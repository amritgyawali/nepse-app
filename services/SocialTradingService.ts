import AsyncStorage from '@react-native-async-storage/async-storage';

interface Trader {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  verified: boolean;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  joinDate: Date;
  location?: string;
  followers: number;
  following: number;
  totalTrades: number;
  winRate: number;
  totalReturn: number;
  monthlyReturn: number;
  maxDrawdown: number;
  sharpeRatio: number;
  riskScore: number;
  badges: Badge[];
  specializations: string[];
  isOnline: boolean;
  lastActive: Date;
  subscription: {
    type: 'free' | 'premium' | 'pro';
    expiresAt?: Date;
  };
  settings: {
    allowCopyTrading: boolean;
    allowMessages: boolean;
    showPortfolio: boolean;
    showTrades: boolean;
  };
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  earnedAt: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface Trade {
  id: string;
  traderId: string;
  symbol: string;
  type: 'buy' | 'sell';
  action: 'open' | 'close';
  quantity: number;
  price: number;
  timestamp: Date;
  strategy?: string;
  reasoning?: string;
  tags: string[];
  sentiment: 'bullish' | 'bearish' | 'neutral';
  timeframe: 'scalp' | 'day' | 'swing' | 'position';
  riskLevel: 'low' | 'medium' | 'high';
  targetPrice?: number;
  stopLoss?: number;
  actualReturn?: number;
  status: 'open' | 'closed' | 'cancelled';
  likes: number;
  comments: number;
  shares: number;
  isPublic: boolean;
  copiedBy: string[]; // User IDs who copied this trade
}

interface CopyTrade {
  id: string;
  copyerId: string;
  originalTradeId: string;
  traderId: string;
  symbol: string;
  type: 'buy' | 'sell';
  quantity: number;
  price: number;
  timestamp: Date;
  status: 'pending' | 'executed' | 'failed' | 'cancelled';
  allocation: number; // Percentage of portfolio allocated
  slippage?: number;
  fees: number;
  actualReturn?: number;
  autoClose: boolean;
  stopLoss?: number;
  takeProfit?: number;
}

interface CopySettings {
  traderId: string;
  isActive: boolean;
  allocation: number; // Max percentage of portfolio to allocate
  maxTradeSize: number;
  minTradeSize: number;
  riskLevel: 'conservative' | 'moderate' | 'aggressive';
  allowedSymbols: string[];
  blockedSymbols: string[];
  autoStopLoss: boolean;
  autoTakeProfit: boolean;
  stopLossPercent: number;
  takeProfitPercent: number;
  maxDailyTrades: number;
  maxOpenPositions: number;
  followTimeframe: 'all' | 'day' | 'swing' | 'position';
  notifications: {
    newTrade: boolean;
    tradeUpdate: boolean;
    profitTarget: boolean;
    stopLoss: boolean;
  };
}

interface SocialPost {
  id: string;
  authorId: string;
  type: 'text' | 'trade' | 'analysis' | 'news' | 'poll' | 'image';
  content: string;
  attachments?: {
    type: 'image' | 'chart' | 'trade' | 'link';
    url: string;
    metadata?: any;
  }[];
  tags: string[];
  mentions: string[];
  timestamp: Date;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  isPublic: boolean;
  isPinned: boolean;
  relatedSymbols: string[];
  sentiment?: 'bullish' | 'bearish' | 'neutral';
  poll?: {
    question: string;
    options: string[];
    votes: { [option: string]: number };
    expiresAt: Date;
  };
}

interface Comment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  timestamp: Date;
  likes: number;
  replies: Comment[];
  mentions: string[];
  isEdited: boolean;
  editedAt?: Date;
}

interface Leaderboard {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'all_time';
  category: 'return' | 'win_rate' | 'sharpe_ratio' | 'followers' | 'trades';
  rankings: LeaderboardEntry[];
  lastUpdated: Date;
}

interface LeaderboardEntry {
  rank: number;
  traderId: string;
  trader: Trader;
  value: number;
  change: number; // Change from previous period
  badge?: string;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'trading' | 'prediction' | 'education' | 'social';
  category: 'return' | 'win_rate' | 'risk_management' | 'consistency';
  startDate: Date;
  endDate: Date;
  prize: {
    type: 'cash' | 'badge' | 'subscription' | 'feature';
    value: string;
    description: string;
  };
  rules: string[];
  participants: string[];
  maxParticipants?: number;
  entryFee?: number;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  leaderboard: {
    traderId: string;
    score: number;
    rank: number;
  }[];
  requirements: {
    minLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    minFollowers?: number;
    minTrades?: number;
    verified?: boolean;
  };
}

interface TradingRoom {
  id: string;
  name: string;
  description: string;
  hostId: string;
  type: 'public' | 'private' | 'premium';
  category: 'general' | 'stocks' | 'options' | 'crypto' | 'forex';
  participants: string[];
  maxParticipants: number;
  isLive: boolean;
  startTime?: Date;
  endTime?: Date;
  messages: RoomMessage[];
  rules: string[];
  moderators: string[];
  settings: {
    allowGuests: boolean;
    requireApproval: boolean;
    allowScreenShare: boolean;
    allowVoice: boolean;
    slowMode: number; // Seconds between messages
  };
}

interface RoomMessage {
  id: string;
  roomId: string;
  senderId: string;
  type: 'text' | 'trade' | 'chart' | 'poll' | 'system';
  content: string;
  timestamp: Date;
  mentions: string[];
  reactions: { [emoji: string]: string[] }; // emoji -> user IDs
  isDeleted: boolean;
  isPinned: boolean;
  replyTo?: string;
}

interface Notification {
  id: string;
  userId: string;
  type: 'follow' | 'like' | 'comment' | 'mention' | 'trade_copy' | 'trade_update' | 'challenge' | 'room_invite';
  title: string;
  message: string;
  data?: any;
  timestamp: Date;
  isRead: boolean;
  actionUrl?: string;
}

interface SocialAnalytics {
  userId: string;
  period: 'daily' | 'weekly' | 'monthly';
  metrics: {
    profileViews: number;
    postViews: number;
    postLikes: number;
    postComments: number;
    postShares: number;
    newFollowers: number;
    tradesCopied: number;
    copyTradeProfit: number;
    engagementRate: number;
    reachRate: number;
  };
  topPosts: {
    postId: string;
    views: number;
    engagement: number;
  }[];
  followerGrowth: {
    date: Date;
    count: number;
  }[];
  lastUpdated: Date;
}

class SocialTradingService {
  private static instance: SocialTradingService;
  private traders: Map<string, Trader> = new Map();
  private trades: Map<string, Trade> = new Map();
  private copyTrades: Map<string, CopyTrade> = new Map();
  private copySettings: Map<string, CopySettings[]> = new Map();
  private posts: Map<string, SocialPost> = new Map();
  private comments: Map<string, Comment[]> = new Map();
  private leaderboards: Map<string, Leaderboard> = new Map();
  private challenges: Map<string, Challenge> = new Map();
  private tradingRooms: Map<string, TradingRoom> = new Map();
  private notifications: Map<string, Notification[]> = new Map();
  private analytics: Map<string, SocialAnalytics> = new Map();
  private subscribers: Map<string, (data: any) => void> = new Map();
  private updateInterval: NodeJS.Timeout | number | null = null;

  private constructor() {
    this.loadStoredData();
    this.initializeMockData();
    this.startRealTimeUpdates();
  }

  public static getInstance(): SocialTradingService {
    if (!SocialTradingService.instance) {
      SocialTradingService.instance = new SocialTradingService();
    }
    return SocialTradingService.instance;
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

  // Trader Management
  public async getTrader(id: string): Promise<Trader | undefined> {
    return this.traders.get(id);
  }

  public async updateTrader(id: string, updates: Partial<Trader>): Promise<boolean> {
    const trader = this.traders.get(id);
    if (!trader) return false;

    const updatedTrader = { ...trader, ...updates };
    this.traders.set(id, updatedTrader);
    await this.saveTraderData();
    this.notifySubscribers('trader_updated', updatedTrader);
    return true;
  }

  public async searchTraders(query: string, filters?: {
    level?: string;
    minReturn?: number;
    maxRisk?: number;
    verified?: boolean;
  }): Promise<Trader[]> {
    let traders = Array.from(this.traders.values());

    // Text search
    if (query) {
      const searchTerm = query.toLowerCase();
      traders = traders.filter(trader => 
        trader.username.toLowerCase().includes(searchTerm) ||
        trader.displayName.toLowerCase().includes(searchTerm) ||
        trader.bio?.toLowerCase().includes(searchTerm) ||
        trader.specializations.some(spec => spec.toLowerCase().includes(searchTerm))
      );
    }

    // Apply filters
    if (filters) {
      if (filters.level) {
        traders = traders.filter(trader => trader.level === filters.level);
      }
      if (filters.minReturn !== undefined) {
        traders = traders.filter(trader => trader.totalReturn >= filters.minReturn!);
      }
      if (filters.maxRisk !== undefined) {
        traders = traders.filter(trader => trader.riskScore <= filters.maxRisk!);
      }
      if (filters.verified !== undefined) {
        traders = traders.filter(trader => trader.verified === filters.verified);
      }
    }

    return traders.sort((a, b) => b.totalReturn - a.totalReturn);
  }

  public async followTrader(followerId: string, traderId: string): Promise<boolean> {
    const trader = this.traders.get(traderId);
    const follower = this.traders.get(followerId);
    
    if (!trader || !follower) return false;

    trader.followers += 1;
    follower.following += 1;

    this.traders.set(traderId, trader);
    this.traders.set(followerId, follower);

    // Create notification
    await this.createNotification(traderId, {
      type: 'follow',
      title: 'New Follower',
      message: `${follower.displayName} started following you`,
      data: { followerId }
    });

    await this.saveTraderData();
    this.notifySubscribers('trader_followed', { followerId, traderId });
    return true;
  }

  public async unfollowTrader(followerId: string, traderId: string): Promise<boolean> {
    const trader = this.traders.get(traderId);
    const follower = this.traders.get(followerId);
    
    if (!trader || !follower) return false;

    trader.followers = Math.max(0, trader.followers - 1);
    follower.following = Math.max(0, follower.following - 1);

    this.traders.set(traderId, trader);
    this.traders.set(followerId, follower);

    await this.saveTraderData();
    this.notifySubscribers('trader_unfollowed', { followerId, traderId });
    return true;
  }

  // Trade Management
  public async createTrade(trade: Omit<Trade, 'id' | 'timestamp' | 'likes' | 'comments' | 'shares' | 'copiedBy'>): Promise<string> {
    const id = `trade_${Date.now()}_${Math.random()}`;
    const newTrade: Trade = {
      ...trade,
      id,
      timestamp: new Date(),
      likes: 0,
      comments: 0,
      shares: 0,
      copiedBy: []
    };

    this.trades.set(id, newTrade);
    await this.saveTradeData();
    this.notifySubscribers('trade_created', newTrade);

    // Update trader stats
    const trader = this.traders.get(trade.traderId);
    if (trader) {
      trader.totalTrades += 1;
      this.traders.set(trade.traderId, trader);
    }

    return id;
  }

  public async getTrades(filters?: {
    traderId?: string;
    symbol?: string;
    timeframe?: string;
    status?: string;
    limit?: number;
  }): Promise<Trade[]> {
    let trades = Array.from(this.trades.values());

    if (filters) {
      if (filters.traderId) {
        trades = trades.filter(trade => trade.traderId === filters.traderId);
      }
      if (filters.symbol) {
        trades = trades.filter(trade => trade.symbol === filters.symbol);
      }
      if (filters.timeframe) {
        trades = trades.filter(trade => trade.timeframe === filters.timeframe);
      }
      if (filters.status) {
        trades = trades.filter(trade => trade.status === filters.status);
      }
    }

    trades.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    if (filters?.limit) {
      trades = trades.slice(0, filters.limit);
    }

    return trades;
  }

  public async likeTrade(tradeId: string, userId: string): Promise<boolean> {
    const trade = this.trades.get(tradeId);
    if (!trade) return false;

    trade.likes += 1;
    this.trades.set(tradeId, trade);

    // Create notification for trade author
    if (trade.traderId !== userId) {
      await this.createNotification(trade.traderId, {
        type: 'like',
        title: 'Trade Liked',
        message: `Someone liked your ${trade.symbol} trade`,
        data: { tradeId, userId }
      });
    }

    await this.saveTradeData();
    this.notifySubscribers('trade_liked', { tradeId, userId });
    return true;
  }

  // Copy Trading
  public async createCopySettings(copyerId: string, settings: Omit<CopySettings, 'traderId'>): Promise<boolean> {
    const userSettings = this.copySettings.get(copyerId) || [];
    const newSettings: CopySettings = {
      ...settings,
      traderId: ''
    };

    // Remove existing settings for the same trader
    const filteredSettings = userSettings.filter(s => s.traderId !== newSettings.traderId);
    filteredSettings.push(newSettings);

    this.copySettings.set(copyerId, filteredSettings);
    await this.saveCopySettings();
    this.notifySubscribers('copy_settings_updated', { copyerId, settings: newSettings });
    return true;
  }

  public async getCopySettings(copyerId: string): Promise<CopySettings[]> {
    return this.copySettings.get(copyerId) || [];
  }

  public async executeCopyTrade(originalTradeId: string, copyerId: string): Promise<string | null> {
    const originalTrade = this.trades.get(originalTradeId);
    if (!originalTrade) return null;

    const userSettings = this.copySettings.get(copyerId) || [];
    const settings = userSettings.find(s => s.traderId === originalTrade.traderId && s.isActive);
    
    if (!settings) return null;

    // Check if symbol is allowed
    if (settings.allowedSymbols.length > 0 && !settings.allowedSymbols.includes(originalTrade.symbol)) {
      return null;
    }

    if (settings.blockedSymbols.includes(originalTrade.symbol)) {
      return null;
    }

    const copyTradeId = `copy_${Date.now()}_${Math.random()}`;
    const copyTrade: CopyTrade = {
      id: copyTradeId,
      copyerId,
      originalTradeId,
      traderId: originalTrade.traderId,
      symbol: originalTrade.symbol,
      type: originalTrade.type,
      quantity: Math.min(originalTrade.quantity, settings.maxTradeSize),
      price: originalTrade.price,
      timestamp: new Date(),
      status: 'pending',
      allocation: settings.allocation,
      fees: originalTrade.price * originalTrade.quantity * 0.001, // 0.1% fee
      autoClose: true,
      stopLoss: settings.autoStopLoss ? originalTrade.price * (1 - settings.stopLossPercent / 100) : undefined,
      takeProfit: settings.autoTakeProfit ? originalTrade.price * (1 + settings.takeProfitPercent / 100) : undefined
    };

    this.copyTrades.set(copyTradeId, copyTrade);
    
    // Update original trade
    originalTrade.copiedBy.push(copyerId);
    this.trades.set(originalTradeId, originalTrade);

    await this.saveCopyTradeData();
    this.notifySubscribers('copy_trade_created', copyTrade);

    // Create notifications
    await this.createNotification(copyerId, {
      type: 'trade_copy',
      title: 'Trade Copied',
      message: `Successfully copied ${originalTrade.symbol} trade from ${originalTrade.traderId}`,
      data: { copyTradeId, originalTradeId }
    });

    return copyTradeId;
  }

  public async getCopyTrades(copyerId: string, status?: string): Promise<CopyTrade[]> {
    let copyTrades = Array.from(this.copyTrades.values())
      .filter(ct => ct.copyerId === copyerId);

    if (status) {
      copyTrades = copyTrades.filter(ct => ct.status === status);
    }

    return copyTrades.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Social Posts
  public async createPost(post: Omit<SocialPost, 'id' | 'timestamp' | 'likes' | 'comments' | 'shares' | 'views'>): Promise<string> {
    const id = `post_${Date.now()}_${Math.random()}`;
    const newPost: SocialPost = {
      ...post,
      id,
      timestamp: new Date(),
      likes: 0,
      comments: 0,
      shares: 0,
      views: 0
    };

    this.posts.set(id, newPost);
    await this.savePostData();
    this.notifySubscribers('post_created', newPost);

    // Create notifications for mentions
    if (post.mentions.length > 0) {
      for (const mentionedUserId of post.mentions) {
        await this.createNotification(mentionedUserId, {
          type: 'mention',
          title: 'You were mentioned',
          message: `You were mentioned in a post`,
          data: { postId: id, authorId: post.authorId }
        });
      }
    }

    return id;
  }

  public async getPosts(filters?: {
    authorId?: string;
    type?: string;
    tags?: string[];
    symbols?: string[];
    limit?: number;
  }): Promise<SocialPost[]> {
    let posts = Array.from(this.posts.values());

    if (filters) {
      if (filters.authorId) {
        posts = posts.filter(post => post.authorId === filters.authorId);
      }
      if (filters.type) {
        posts = posts.filter(post => post.type === filters.type);
      }
      if (filters.tags && filters.tags.length > 0) {
        posts = posts.filter(post => 
          filters.tags!.some(tag => post.tags.includes(tag))
        );
      }
      if (filters.symbols && filters.symbols.length > 0) {
        posts = posts.filter(post => 
          filters.symbols!.some(symbol => post.relatedSymbols.includes(symbol))
        );
      }
    }

    posts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    if (filters?.limit) {
      posts = posts.slice(0, filters.limit);
    }

    return posts;
  }

  public async likePost(postId: string, userId: string): Promise<boolean> {
    const post = this.posts.get(postId);
    if (!post) return false;

    post.likes += 1;
    this.posts.set(postId, post);

    // Create notification for post author
    if (post.authorId !== userId) {
      await this.createNotification(post.authorId, {
        type: 'like',
        title: 'Post Liked',
        message: `Someone liked your post`,
        data: { postId, userId }
      });
    }

    await this.savePostData();
    this.notifySubscribers('post_liked', { postId, userId });
    return true;
  }

  public async addComment(postId: string, comment: Omit<Comment, 'id' | 'timestamp' | 'likes' | 'replies'>): Promise<string> {
    const post = this.posts.get(postId);
    if (!post) throw new Error('Post not found');

    const commentId = `comment_${Date.now()}_${Math.random()}`;
    const newComment: Comment = {
      ...comment,
      id: commentId,
      timestamp: new Date(),
      likes: 0,
      replies: [],
      isEdited: false
    };

    const postComments = this.comments.get(postId) || [];
    postComments.push(newComment);
    this.comments.set(postId, postComments);

    // Update post comment count
    post.comments += 1;
    this.posts.set(postId, post);

    // Create notification for post author
    if (post.authorId !== comment.authorId) {
      await this.createNotification(post.authorId, {
        type: 'comment',
        title: 'New Comment',
        message: `Someone commented on your post`,
        data: { postId, commentId, authorId: comment.authorId }
      });
    }

    await this.savePostData();
    this.notifySubscribers('comment_added', { postId, comment: newComment });
    return commentId;
  }

  // Leaderboards
  public async getLeaderboard(period: string, category: string): Promise<Leaderboard | undefined> {
    const key = `${period}_${category}`;
    return this.leaderboards.get(key);
  }

  public async updateLeaderboards(): Promise<void> {
    const periods: Array<Leaderboard['period']> = ['daily', 'weekly', 'monthly', 'yearly', 'all_time'];
    const categories: Array<Leaderboard['category']> = ['return', 'win_rate', 'sharpe_ratio', 'followers', 'trades'];

    for (const period of periods) {
      for (const category of categories) {
        const rankings = this.calculateRankings(period, category);
        const leaderboard: Leaderboard = {
          period,
          category,
          rankings,
          lastUpdated: new Date()
        };
        
        this.leaderboards.set(`${period}_${category}`, leaderboard);
      }
    }

    await this.saveLeaderboardData();
    this.notifySubscribers('leaderboards_updated', Array.from(this.leaderboards.values()));
  }

  private calculateRankings(period: string, category: string): LeaderboardEntry[] {
    const traders = Array.from(this.traders.values());
    
    // Sort traders based on category
    let sortedTraders: Trader[];
    switch (category) {
      case 'return':
        sortedTraders = traders.sort((a, b) => b.totalReturn - a.totalReturn);
        break;
      case 'win_rate':
        sortedTraders = traders.sort((a, b) => b.winRate - a.winRate);
        break;
      case 'sharpe_ratio':
        sortedTraders = traders.sort((a, b) => b.sharpeRatio - a.sharpeRatio);
        break;
      case 'followers':
        sortedTraders = traders.sort((a, b) => b.followers - a.followers);
        break;
      case 'trades':
        sortedTraders = traders.sort((a, b) => b.totalTrades - a.totalTrades);
        break;
      default:
        sortedTraders = traders;
    }

    return sortedTraders.slice(0, 100).map((trader, index) => {
      let value: number;
      switch (category) {
        case 'return':
          value = trader.totalReturn;
          break;
        case 'win_rate':
          value = trader.winRate;
          break;
        case 'sharpe_ratio':
          value = trader.sharpeRatio;
          break;
        case 'followers':
          value = trader.followers;
          break;
        case 'trades':
          value = trader.totalTrades;
          break;
        default:
          value = 0;
      }

      return {
        rank: index + 1,
        traderId: trader.id,
        trader,
        value,
        change: Math.floor(Math.random() * 10) - 5, // Mock change
        badge: index < 3 ? ['🥇', '🥈', '🥉'][index] : undefined
      };
    });
  }

  // Challenges
  public async getChallenges(status?: string): Promise<Challenge[]> {
    let challenges = Array.from(this.challenges.values());
    
    if (status) {
      challenges = challenges.filter(challenge => challenge.status === status);
    }

    return challenges.sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
  }

  public async joinChallenge(challengeId: string, userId: string): Promise<boolean> {
    const challenge = this.challenges.get(challengeId);
    if (!challenge || challenge.status !== 'active') return false;

    if (challenge.maxParticipants && challenge.participants.length >= challenge.maxParticipants) {
      return false;
    }

    if (challenge.participants.includes(userId)) {
      return false; // Already joined
    }

    challenge.participants.push(userId);
    this.challenges.set(challengeId, challenge);

    await this.saveChallengeData();
    this.notifySubscribers('challenge_joined', { challengeId, userId });
    return true;
  }

  // Trading Rooms
  public async createTradingRoom(room: Omit<TradingRoom, 'id' | 'participants' | 'messages'>): Promise<string> {
    const id = `room_${Date.now()}_${Math.random()}`;
    const newRoom: TradingRoom = {
      ...room,
      id,
      participants: [room.hostId],
      messages: []
    };

    this.tradingRooms.set(id, newRoom);
    await this.saveTradingRoomData();
    this.notifySubscribers('room_created', newRoom);
    return id;
  }

  public async joinTradingRoom(roomId: string, userId: string): Promise<boolean> {
    const room = this.tradingRooms.get(roomId);
    if (!room) return false;

    if (room.participants.length >= room.maxParticipants) {
      return false;
    }

    if (room.participants.includes(userId)) {
      return false; // Already joined
    }

    room.participants.push(userId);
    this.tradingRooms.set(roomId, room);

    // Add system message
    const trader = this.traders.get(userId);
    if (trader) {
      const systemMessage: RoomMessage = {
        id: `msg_${Date.now()}_${Math.random()}`,
        roomId,
        senderId: 'system',
        type: 'system',
        content: `${trader.displayName} joined the room`,
        timestamp: new Date(),
        mentions: [],
        reactions: {},
        isDeleted: false,
        isPinned: false
      };
      
      room.messages.push(systemMessage);
    }

    await this.saveTradingRoomData();
    this.notifySubscribers('room_joined', { roomId, userId });
    return true;
  }

  public async sendRoomMessage(roomId: string, message: Omit<RoomMessage, 'id' | 'timestamp' | 'reactions' | 'isDeleted' | 'isPinned'>): Promise<string> {
    const room = this.tradingRooms.get(roomId);
    if (!room || !room.participants.includes(message.senderId)) {
      throw new Error('Room not found or user not in room');
    }

    const messageId = `msg_${Date.now()}_${Math.random()}`;
    const newMessage: RoomMessage = {
      ...message,
      id: messageId,
      timestamp: new Date(),
      reactions: {},
      isDeleted: false,
      isPinned: false
    };

    room.messages.push(newMessage);
    
    // Keep only last 1000 messages
    if (room.messages.length > 1000) {
      room.messages = room.messages.slice(-1000);
    }

    this.tradingRooms.set(roomId, room);
    await this.saveTradingRoomData();
    this.notifySubscribers('room_message', { roomId, message: newMessage });
    return messageId;
  }

  // Notifications
  public async createNotification(userId: string, notification: Omit<Notification, 'id' | 'userId' | 'timestamp' | 'isRead'>): Promise<string> {
    const id = `notif_${Date.now()}_${Math.random()}`;
    const newNotification: Notification = {
      ...notification,
      id,
      userId,
      timestamp: new Date(),
      isRead: false
    };

    const userNotifications = this.notifications.get(userId) || [];
    userNotifications.unshift(newNotification);
    
    // Keep only last 100 notifications
    if (userNotifications.length > 100) {
      userNotifications.splice(100);
    }

    this.notifications.set(userId, userNotifications);
    await this.saveNotificationData();
    this.notifySubscribers('notification_created', newNotification);
    return id;
  }

  public async getNotifications(userId: string, unreadOnly: boolean = false): Promise<Notification[]> {
    const notifications = this.notifications.get(userId) || [];
    
    if (unreadOnly) {
      return notifications.filter(n => !n.isRead);
    }
    
    return notifications;
  }

  public async markNotificationRead(userId: string, notificationId: string): Promise<boolean> {
    const notifications = this.notifications.get(userId) || [];
    const notification = notifications.find(n => n.id === notificationId);
    
    if (!notification) return false;
    
    notification.isRead = true;
    this.notifications.set(userId, notifications);
    await this.saveNotificationData();
    this.notifySubscribers('notification_read', { userId, notificationId });
    return true;
  }

  // Analytics
  public async getAnalytics(userId: string, period: string): Promise<SocialAnalytics | undefined> {
    const key = `${userId}_${period}`;
    return this.analytics.get(key);
  }

  public async updateAnalytics(userId: string): Promise<void> {
    const periods: Array<SocialAnalytics['period']> = ['daily', 'weekly', 'monthly'];
    
    for (const period of periods) {
      const analytics = this.calculateAnalytics(userId, period);
      this.analytics.set(`${userId}_${period}`, analytics);
    }

    await this.saveAnalyticsData();
    this.notifySubscribers('analytics_updated', { userId });
  }

  private calculateAnalytics(userId: string, period: SocialAnalytics['period']): SocialAnalytics {
    // Mock analytics calculation
    return {
      userId,
      period,
      metrics: {
        profileViews: Math.floor(Math.random() * 1000),
        postViews: Math.floor(Math.random() * 5000),
        postLikes: Math.floor(Math.random() * 500),
        postComments: Math.floor(Math.random() * 100),
        postShares: Math.floor(Math.random() * 50),
        newFollowers: Math.floor(Math.random() * 20),
        tradesCopied: Math.floor(Math.random() * 10),
        copyTradeProfit: Math.random() * 1000 - 500,
        engagementRate: Math.random() * 10,
        reachRate: Math.random() * 20
      },
      topPosts: [],
      followerGrowth: [],
      lastUpdated: new Date()
    };
  }

  // Initialize Mock Data
  private initializeMockData(): void {
    // Create mock traders
    const mockTraders: Trader[] = [
      {
        id: 'trader_1',
        username: 'nepse_king',
        displayName: 'NEPSE King',
        avatar: 'https://example.com/avatar1.jpg',
        bio: 'Professional trader with 10+ years experience in NEPSE',
        verified: true,
        level: 'expert',
        joinDate: new Date('2020-01-01'),
        location: 'Kathmandu, Nepal',
        followers: 15420,
        following: 234,
        totalTrades: 1250,
        winRate: 68.5,
        totalReturn: 145.2,
        monthlyReturn: 12.8,
        maxDrawdown: -8.5,
        sharpeRatio: 2.1,
        riskScore: 6.5,
        badges: [],
        specializations: ['Banking', 'Hydropower', 'Insurance'],
        isOnline: true,
        lastActive: new Date(),
        subscription: { type: 'pro' },
        settings: {
          allowCopyTrading: true,
          allowMessages: true,
          showPortfolio: true,
          showTrades: true
        }
      },
      {
        id: 'trader_2',
        username: 'value_hunter',
        displayName: 'Value Hunter',
        verified: false,
        level: 'advanced',
        joinDate: new Date('2021-03-15'),
        location: 'Pokhara, Nepal',
        followers: 8750,
        following: 156,
        totalTrades: 890,
        winRate: 72.1,
        totalReturn: 98.7,
        monthlyReturn: 8.9,
        maxDrawdown: -12.3,
        sharpeRatio: 1.8,
        riskScore: 5.2,
        badges: [],
        specializations: ['Value Investing', 'Fundamental Analysis'],
        isOnline: false,
        lastActive: new Date(Date.now() - 3600000),
        subscription: { type: 'premium' },
        settings: {
          allowCopyTrading: true,
          allowMessages: false,
          showPortfolio: false,
          showTrades: true
        }
      }
    ];

    mockTraders.forEach(trader => {
      this.traders.set(trader.id, trader);
    });

    // Create mock challenges
    const mockChallenges: Challenge[] = [
      {
        id: 'challenge_1',
        title: 'Monthly Trading Challenge',
        description: 'Compete for the highest returns this month',
        type: 'trading',
        category: 'return',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        prize: {
          type: 'cash',
          value: 'NPR 50,000',
          description: 'Cash prize for the winner'
        },
        rules: [
          'Minimum 10 trades required',
          'Maximum position size: 20% of portfolio',
          'No penny stocks allowed'
        ],
        participants: ['trader_1', 'trader_2'],
        maxParticipants: 100,
        status: 'active',
        leaderboard: [
          { traderId: 'trader_1', score: 15.2, rank: 1 },
          { traderId: 'trader_2', score: 12.8, rank: 2 }
        ],
        requirements: {
          minLevel: 'intermediate',
          minTrades: 50
        }
      }
    ];

    mockChallenges.forEach(challenge => {
      this.challenges.set(challenge.id, challenge);
    });

    // Initialize leaderboards
    this.updateLeaderboards();
  }

  // Real-time Updates
  private startRealTimeUpdates(): void {
    this.updateInterval = setInterval(() => {

      this.updateTraderStats();
      this.updateLeaderboards();
    }, 60000); // Update every minute
  }

  private updateTraderStats(): void {
    this.traders.forEach(trader => {
      // Simulate small changes in trader stats
      const returnChange = (Math.random() - 0.5) * 2; // ±1%
      trader.totalReturn += returnChange;
      trader.monthlyReturn = trader.totalReturn * 0.1; // Approximate monthly return
      
      // Update last active for online traders
      if (trader.isOnline) {
        trader.lastActive = new Date();
      }
    });
    
    this.notifySubscribers('trader_stats_updated', Array.from(this.traders.values()));
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
      const [tradersData, tradesData, postsData, notificationsData] = await Promise.all([
        AsyncStorage.getItem('social_traders'),
        AsyncStorage.getItem('social_trades'),
        AsyncStorage.getItem('social_posts'),
        AsyncStorage.getItem('social_notifications')
      ]);

      if (tradersData) {
        const traders = JSON.parse(tradersData);
        traders.forEach((trader: any) => {
          trader.joinDate = new Date(trader.joinDate);
          trader.lastActive = new Date(trader.lastActive);
          if (trader.subscription.expiresAt) {
            trader.subscription.expiresAt = new Date(trader.subscription.expiresAt);
          }
          trader.badges.forEach((badge: any) => {
            badge.earnedAt = new Date(badge.earnedAt);
          });
          this.traders.set(trader.id, trader);
        });
      }

      if (tradesData) {
        const trades = JSON.parse(tradesData);
        trades.forEach((trade: any) => {
          trade.timestamp = new Date(trade.timestamp);
          this.trades.set(trade.id, trade);
        });
      }

      if (postsData) {
        const posts = JSON.parse(postsData);
        posts.forEach((post: any) => {
          post.timestamp = new Date(post.timestamp);
          if (post.poll?.expiresAt) {
            post.poll.expiresAt = new Date(post.poll.expiresAt);
          }
          this.posts.set(post.id, post);
        });
      }

      if (notificationsData) {
        const notifications = JSON.parse(notificationsData);
        Object.entries(notifications).forEach(([userId, userNotifs]: [string, any]) => {
          userNotifs.forEach((notif: any) => {
            notif.timestamp = new Date(notif.timestamp);
          });
          this.notifications.set(userId, userNotifs);
        });
      }
    } catch (error) {
      console.error('Failed to load social trading data:', error);
    }
  }

  private async saveTraderData(): Promise<void> {
    try {
      const traders = Array.from(this.traders.values());
      await AsyncStorage.setItem('social_traders', JSON.stringify(traders));
    } catch (error) {
      console.error('Failed to save trader data:', error);
    }
  }

  private async saveTradeData(): Promise<void> {
    try {
      const trades = Array.from(this.trades.values());
      await AsyncStorage.setItem('social_trades', JSON.stringify(trades));
    } catch (error) {
      console.error('Failed to save trade data:', error);
    }
  }

  private async saveCopySettings(): Promise<void> {
    try {
      const settings = Object.fromEntries(this.copySettings);
      await AsyncStorage.setItem('copy_settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save copy settings:', error);
    }
  }

  private async saveCopyTradeData(): Promise<void> {
    try {
      const copyTrades = Array.from(this.copyTrades.values());
      await AsyncStorage.setItem('copy_trades', JSON.stringify(copyTrades));
    } catch (error) {
      console.error('Failed to save copy trade data:', error);
    }
  }

  private async savePostData(): Promise<void> {
    try {
      const posts = Array.from(this.posts.values());
      await AsyncStorage.setItem('social_posts', JSON.stringify(posts));
    } catch (error) {
      console.error('Failed to save post data:', error);
    }
  }

  private async saveLeaderboardData(): Promise<void> {
    try {
      const leaderboards = Object.fromEntries(this.leaderboards);
      await AsyncStorage.setItem('leaderboards', JSON.stringify(leaderboards));
    } catch (error) {
      console.error('Failed to save leaderboard data:', error);
    }
  }

  private async saveChallengeData(): Promise<void> {
    try {
      const challenges = Array.from(this.challenges.values());
      await AsyncStorage.setItem('challenges', JSON.stringify(challenges));
    } catch (error) {
      console.error('Failed to save challenge data:', error);
    }
  }

  private async saveTradingRoomData(): Promise<void> {
    try {
      const rooms = Array.from(this.tradingRooms.values());
      await AsyncStorage.setItem('trading_rooms', JSON.stringify(rooms));
    } catch (error) {
      console.error('Failed to save trading room data:', error);
    }
  }

  private async saveNotificationData(): Promise<void> {
    try {
      const notifications = Object.fromEntries(this.notifications);
      await AsyncStorage.setItem('social_notifications', JSON.stringify(notifications));
    } catch (error) {
      console.error('Failed to save notification data:', error);
    }
  }

  private async saveAnalyticsData(): Promise<void> {
    try {
      const analytics = Object.fromEntries(this.analytics);
      await AsyncStorage.setItem('social_analytics', JSON.stringify(analytics));
    } catch (error) {
      console.error('Failed to save analytics data:', error);
    }
  }

  // Cleanup
  public cleanup(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    
    this.subscribers.clear();
    this.traders.clear();
    this.trades.clear();
    this.copyTrades.clear();
    this.copySettings.clear();
    this.posts.clear();
    this.comments.clear();
    this.leaderboards.clear();
    this.challenges.clear();
    this.tradingRooms.clear();
    this.notifications.clear();
    this.analytics.clear();
  }
}

export default SocialTradingService;
export type {
  Trader,
  Badge,
  Trade,
  CopyTrade,
  CopySettings,
  SocialPost,
  Comment,
  Leaderboard,
  LeaderboardEntry,
  Challenge,
  TradingRoom,
  RoomMessage,
  Notification,
  SocialAnalytics
};