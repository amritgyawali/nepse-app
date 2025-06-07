// Core Stock Market Data Types
export interface NEPSEStock {
  readonly symbol: string;
  readonly name: string;
  readonly price: number;
  readonly change: number;
  readonly changePercent: number;
  readonly volume: number;
  readonly turnover: number;
  readonly high: number;
  readonly low: number;
  readonly open: number;
  readonly previousClose: number;
  readonly marketCap: number;
  readonly sector: string;
  readonly lastTradedTime: string;
  readonly totalTrades: number;
  readonly averagePrice: number;
  readonly fiftyTwoWeekHigh: number;
  readonly fiftyTwoWeekLow: number;
  readonly eps: number;
  readonly peRatio: number;
  readonly bookValue: number;
  readonly pbRatio: number;
  readonly dividendYield: number;
  readonly beta: number;
  readonly isActive: boolean;
  readonly isSuspended: boolean;
  readonly listingDate?: string;
  readonly faceValue: number;
  readonly outstandingShares: number;
}

export interface NEPSEIndex {
  name: string;
  value: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  turnover: number;
}

export interface MarketDepth {
  bids: Array<{ price: number; quantity: number; orders: number }>;
  asks: Array<{ price: number; quantity: number; orders: number }>;
}

export interface FloorSheet {
  contractNo: string;
  symbol: string;
  buyerMemberId: string;
  sellerMemberId: string;
  quantity: number;
  rate: number;
  amount: number;
  time: string;
}

export interface HistoricalData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  price: number;
}

export interface PriceHistory {
  date: string;
  price: number;
  volume: number;
  change: number;
}

// Chart and Technical Analysis Types
export interface ChartData {
  labels: string[];
  datasets: Array<{
    data: number[];
    color?: (opacity: number) => string;
    strokeWidth?: number;
  }>;
}

export interface TechnicalIndicator {
  name: string;
  type: 'overlay' | 'oscillator' | 'volume';
  data: Array<{
    timestamp: number;
    value: number | { [key: string]: number };
  }>;
  parameters: { [key: string]: number | string | boolean };
}

export interface CandlestickData {
  x: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

// News and Content Types
export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content?: string;
  category: string;
  source: string;
  timestamp: string;
  tags: string[];
  imageUrl?: string;
  url?: string;
}

export interface NewsAlert {
  id: string;
  title: string;
  message: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  timestamp: Date;
  isRead: boolean;
}

// Portfolio Types
export interface PortfolioHolding {
  symbol: string;
  name: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  totalValue: number;
  gainLoss: number;
  gainLossPercent: number;
  transactions: Transaction[];
  profitLoss?: number;
  profitLossPercentage?: number;
}

export interface Transaction {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  quantity: number;
  price: number;
  amount: number;
  fees: number;
  date: Date;
  notes?: string;
}

export interface Watchlist {
  id: string;
  name: string;
  symbols: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PriceAlert {
  id: string;
  symbol: string;
  type: 'above' | 'below' | 'change_percent';
  value: number;
  isActive: boolean;
  createdAt: Date;
  triggeredAt?: Date;
}

// User and Authentication Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  preferences: UserPreferences;
  createdAt: Date;
  lastLoginAt: Date;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  currency: string;
  notifications: NotificationSettings;
  defaultWatchlist?: string;
}

export interface NotificationSettings {
  priceAlerts: boolean;
  newsAlerts: boolean;
  marketUpdates: boolean;
  portfolioUpdates: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

// Market Scanner Types
export interface ScanCriteria {
  id: string;
  name: string;
  description: string;
  category: 'technical' | 'fundamental' | 'volume' | 'price' | 'custom';
  conditions: ScanCondition[];
  isActive: boolean;
  createdAt: Date;
  lastRun?: Date;
  resultsCount?: number;
}

export interface ScanCondition {
  field: string;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'between' | 'in' | 'not_in' | 'contains' | 'starts_with' | 'ends_with';
  value: string | number | string[] | number[];
  logicalOperator?: 'AND' | 'OR';
}

export interface ScanResult {
  symbol: string;
  stockData: NEPSEStock;
  matchedCriteria: string[];
  score: number;
  signals: Signal[];
  timestamp: Date;
}

export interface Signal {
  type: 'buy' | 'sell' | 'hold';
  strength: 'strong' | 'moderate' | 'weak';
  reason: string;
  confidence: number;
}

// Education Types
export interface EducationContent {
  id: string;
  title: string;
  description: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  content: string;
  tags: string[];
  estimatedReadTime: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  questions: Question[];
  passingScore: number;
  timeLimit?: number;
}

export interface Question {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'fill_blank';
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  points: number;
}

export interface QuizResult {
  quizId: string;
  userId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  answers: { [questionId: string]: string | string[] };
  completedAt: Date;
  timeSpent: number;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  readonly status: 'success' | 'error';
  readonly data?: T;
  readonly message: string;
  readonly timestamp: string;
  readonly cached?: boolean;
  readonly count?: number;
  readonly errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  readonly pagination: {
    readonly page: number;
    readonly limit: number;
    readonly total: number;
    readonly totalPages: number;
    readonly hasNext: boolean;
    readonly hasPrev: boolean;
  };
}

// Error Types
export interface ApiError {
  readonly status: 'error';
  readonly message: string;
  readonly timestamp: string;
  readonly path?: string;
  readonly method?: string;
  readonly field?: string;
  readonly invalid_value?: string;
  readonly resource?: string;
  readonly identifier?: string;
}

// WebSocket Types
export interface WebSocketMessage {
  type: string;
  data: unknown;
  timestamp: number;
}

export interface RealTimeUpdate {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: number;
}

// Enums for better type safety
export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc'
}

export enum TimeFrame {
  ONE_DAY = '1D',
  ONE_WEEK = '1W',
  ONE_MONTH = '1M',
  THREE_MONTHS = '3M',
  SIX_MONTHS = '6M',
  ONE_YEAR = '1Y',
  ALL = 'ALL'
}

export enum ThemeMode {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system'
}

export enum OrderType {
  MARKET = 'market',
  LIMIT = 'limit',
  STOP_LOSS = 'stop_loss',
  STOP_LIMIT = 'stop_limit'
}

export enum OrderSide {
  BUY = 'buy',
  SELL = 'sell'
}

export enum OrderStatus {
  PENDING = 'pending',
  EXECUTED = 'executed',
  CANCELLED = 'cancelled',
  REJECTED = 'rejected',
  PARTIALLY_FILLED = 'partially_filled'
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export enum MarketStatus {
  OPEN = 'open',
  CLOSED = 'closed',
  PRE_MARKET = 'pre_market',
  AFTER_MARKET = 'after_market',
  HOLIDAY = 'holiday'
}

export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error'
}

// Utility Types
export type Currency = 'NPR' | 'USD';
export type Language = 'en' | 'ne';
export type TrendDirection = 'up' | 'down' | 'sideways';
export type AlertType = 'price' | 'volume' | 'news' | 'technical';
export type SubscriptionTier = 'free' | 'premium' | 'pro';
export type DataSource = 'nepse' | 'merolagani' | 'sharesansar' | 'cache';

// Generic utility types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type NonEmptyArray<T> = [T, ...T[]];
export type ValueOf<T> = T[keyof T];
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

// Date and time utilities
export type DateString = string; // ISO 8601 format
export type TimeString = string; // HH:MM format
export type TimestampString = string; // ISO 8601 with time

export interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface Subscriber<T> {
  id: string;
  callback: (data: T) => void;
}

export interface ErrorInfo {
  message: string;
  code?: string;
  details?: unknown;
  timestamp: Date;
}

// Component Props Types
export interface StockCardProps {
  stock: NEPSEStock;
  onPress?: (symbol: string) => void;
}

export interface ChartProps {
  data: ChartData | CandlestickData[];
  type: 'line' | 'candlestick' | 'bar';
  height?: number;
  showGrid?: boolean;
  showLabels?: boolean;
}

export interface PickerOption {
  label: string;
  value: string | number;
}

export interface PickerProps {
  options: PickerOption[];
  selectedValue: string | number;
  onValueChange: (value: string | number) => void;
  placeholder?: string;
  style?: object;
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface TransactionForm {
  symbol: string;
  type: 'buy' | 'sell';
  quantity: number;
  price: number;
  date: Date;
  notes?: string;
}

// Market Status Types
export interface MarketStatus {
  isOpen: boolean;
  nextOpenTime?: Date;
  nextCloseTime?: Date;
  timezone: string;
  lastUpdated: Date;
}

export interface MarketSummary {
  totalStocks: number;
  advancers: number;
  decliners: number;
  unchanged: number;
  totalVolume: number;
  totalTurnover: number;
  marketCap: number;
  lastUpdated: Date;
}

// Export all types as a namespace for easier imports
export * from './index';