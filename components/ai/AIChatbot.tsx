import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Send,
  Bot,
  User,
  TrendingUp,
  TrendingDown,
  Brain,
  Lightbulb,
  AlertCircle,
  CheckCircle,
  X,
} from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { aiChatbotResponses } from '@/assets/data/enhancedMockData';

const { width: screenWidth } = Dimensions.get('window');

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'text' | 'analysis' | 'recommendation' | 'alert';
  stockSymbol?: string;
  sentiment?: 'bullish' | 'bearish' | 'neutral';
}

interface QuickAction {
  id: string;
  title: string;
  icon: React.ReactNode;
  query: string;
  color: string;
}

const quickActions: QuickAction[] = [
  {
    id: '1',
    title: 'Market Analysis',
    icon: <TrendingUp size={20} color="#10B981" />,
    query: 'Give me today\'s market analysis',
    color: '#10B981',
  },
  {
    id: '2',
    title: 'Stock Recommendation',
    icon: <Lightbulb size={20} color="#F59E0B" />,
    query: 'Recommend some good stocks to buy',
    color: '#F59E0B',
  },
  {
    id: '3',
    title: 'Portfolio Review',
    icon: <CheckCircle size={20} color="#3B82F6" />,
    query: 'Review my portfolio performance',
    color: '#3B82F6',
  },
  {
    id: '4',
    title: 'Risk Assessment',
    icon: <AlertCircle size={20} color="#EF4444" />,
    query: 'Assess my portfolio risk',
    color: '#EF4444',
  },
];

interface AIChatbotProps {
  onClose?: () => void;
  initialQuery?: string;
}

export default function AIChatbot({ onClose, initialQuery }: AIChatbotProps) {
  const { theme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your NEPSE AI assistant. I can help you with market analysis, stock recommendations, portfolio insights, and answer any questions about investing in Nepal's stock market. How can I assist you today?",
      isUser: false,
      timestamp: new Date(),
      type: 'text',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const typingAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (initialQuery) {
      handleSendMessage(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    if (isTyping) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(typingAnimation, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(typingAnimation, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      typingAnimation.setValue(0);
    }
  }, [isTyping]);

  const generateAIResponse = (userMessage: string): Message => {
    const lowerMessage = userMessage.toLowerCase();
    let response = '';
    let type: Message['type'] = 'text';
    let sentiment: Message['sentiment'] = 'neutral';
    let stockSymbol: string | undefined;

    // Check for stock-specific queries
    if (lowerMessage.includes('nabil')) {
      response = aiChatbotResponses.stockAnalysis.NABIL;
      type = 'analysis';
      sentiment = 'bullish';
      stockSymbol = 'NABIL';
    } else if (lowerMessage.includes('nica')) {
      response = aiChatbotResponses.stockAnalysis.NICA;
      type = 'analysis';
      sentiment = 'neutral';
      stockSymbol = 'NICA';
    } else if (lowerMessage.includes('chcl') || lowerMessage.includes('chilime')) {
      response = aiChatbotResponses.stockAnalysis.CHCL;
      type = 'analysis';
      sentiment = 'bullish';
      stockSymbol = 'CHCL';
    }
    // Check for general questions
    else if (lowerMessage.includes('nepse') || lowerMessage.includes('what is')) {
      response = aiChatbotResponses.generalQuestions['what is nepse'];
    } else if (lowerMessage.includes('invest') || lowerMessage.includes('how to')) {
      response = aiChatbotResponses.generalQuestions['how to invest'];
    } else if (lowerMessage.includes('market hours') || lowerMessage.includes('time')) {
      response = aiChatbotResponses.generalQuestions['market hours'];
    }
    // Market analysis queries
    else if (lowerMessage.includes('market analysis') || lowerMessage.includes('market today')) {
      response = "Today's market shows mixed signals. NEPSE index is up 1.23% with strong performance in hydropower sector (+2.85%). Banking sector is consolidating with slight decline (-0.37%). Overall sentiment remains cautiously optimistic with increased trading volume.";
      type = 'analysis';
      sentiment = 'bullish';
    }
    // Recommendation queries
    else if (lowerMessage.includes('recommend') || lowerMessage.includes('buy') || lowerMessage.includes('good stocks')) {
      response = "Based on current market conditions, I recommend considering: 1) CHCL - Strong momentum in renewable energy sector, 2) NABIL - Solid fundamentals with consistent dividends, 3) UPPER - Excellent growth prospects. Always do your own research and consider your risk tolerance.";
      type = 'recommendation';
      sentiment = 'bullish';
    }
    // Portfolio queries
    else if (lowerMessage.includes('portfolio') || lowerMessage.includes('review')) {
      response = "Your portfolio shows good diversification across banking (45%) and hydropower (30%) sectors. Current performance is +15.8% with moderate risk profile. Consider rebalancing if any sector exceeds 50% allocation.";
      type = 'analysis';
    }
    // Risk assessment
    else if (lowerMessage.includes('risk')) {
      response = "Your portfolio risk assessment: Beta: 1.15 (slightly more volatile than market), Sharpe Ratio: 0.85 (good risk-adjusted returns), Max Drawdown: -12.3%. Risk level: Moderate. Consider diversifying into defensive sectors if concerned about volatility.";
      type = 'alert';
      sentiment = 'neutral';
    }
    // Default responses
    else {
      const greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon'];
      if (greetings.some(greeting => lowerMessage.includes(greeting))) {
        response = aiChatbotResponses.greetings[Math.floor(Math.random() * aiChatbotResponses.greetings.length)];
      } else {
        response = "I understand you're asking about '" + userMessage + "'. While I specialize in NEPSE market analysis, I can help you with stock recommendations, portfolio insights, market trends, and investment education. Could you please rephrase your question or ask about specific stocks or market topics?";
      }
    }

    return {
      id: Date.now().toString(),
      text: response,
      isUser: false,
      timestamp: new Date(),
      type,
      sentiment,
      stockSymbol,
    };
  };

  const handleSendMessage = (text?: string) => {
    const messageText = text || inputText.trim();
    if (!messageText) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse = generateAIResponse(messageText);
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000);
  };

  const handleQuickAction = (action: QuickAction) => {
    handleSendMessage(action.query);
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const renderMessage = (message: Message) => {
    const isUser = message.isUser;
    
    return (
      <View key={message.id} style={[styles.messageContainer, isUser ? styles.userMessage : styles.aiMessage]}>
        {!isUser && (
          <View style={[styles.avatarContainer, { backgroundColor: theme.colors.primary }]}>
            <Bot size={16} color="#FFFFFF" />
          </View>
        )}
        
        <View style={[styles.messageBubble, {
          backgroundColor: isUser ? theme.colors.primary : theme.colors.surface,
          borderColor: theme.colors.border,
        }]}>
          {!isUser && message.type !== 'text' && (
            <View style={styles.messageHeader}>
              <View style={[styles.messageTypeIndicator, {
                backgroundColor: message.sentiment === 'bullish' ? '#10B981' : 
                                message.sentiment === 'bearish' ? '#EF4444' : '#6B7280'
              }]}>
                {message.type === 'analysis' && <Brain size={12} color="#FFFFFF" />}
                {message.type === 'recommendation' && <Lightbulb size={12} color="#FFFFFF" />}
                {message.type === 'alert' && <AlertCircle size={12} color="#FFFFFF" />}
              </View>
              <Text style={[styles.messageTypeText, { color: theme.colors.text }]}>
                {message.type === 'analysis' ? 'AI Analysis' :
                 message.type === 'recommendation' ? 'Recommendation' :
                 message.type === 'alert' ? 'Risk Alert' : 'Response'}
              </Text>
              {message.stockSymbol && (
                <Text style={[styles.stockSymbol, { color: theme.colors.primary }]}>
                  {message.stockSymbol}
                </Text>
              )}
            </View>
          )}
          
          <Text style={[styles.messageText, {
            color: isUser ? '#FFFFFF' : theme.colors.text
          }]}>
            {message.text}
          </Text>
          
          <Text style={[styles.timestamp, {
            color: isUser ? 'rgba(255, 255, 255, 0.7)' : theme.colors.secondary
          }]}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        
        {isUser && (
          <View style={[styles.avatarContainer, { backgroundColor: theme.colors.secondary }]}>
            <User size={16} color="#FFFFFF" />
          </View>
        )}
      </View>
    );
  };

  const renderTypingIndicator = () => {
    if (!isTyping) return null;
    
    return (
      <View style={[styles.messageContainer, styles.aiMessage]}>
        <View style={[styles.avatarContainer, { backgroundColor: theme.colors.primary }]}>
          <Bot size={16} color="#FFFFFF" />
        </View>
        
        <View style={[styles.messageBubble, {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        }]}>
          <View style={styles.typingContainer}>
            {[0, 1, 2].map((index) => (
              <Animated.View
                key={index}
                style={[
                  styles.typingDot,
                  {
                    backgroundColor: theme.colors.primary,
                    opacity: typingAnimation,
                    transform: [{
                      scale: typingAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1.2],
                      })
                    }]
                  }
                ]}
              />
            ))}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.aiIcon}>
              <Brain size={24} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.headerTitle}>NEPSE AI Assistant</Text>
              <Text style={styles.headerSubtitle}>Powered by Advanced Analytics</Text>
            </View>
          </View>
          {onClose && (
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {/* Quick Actions */}
      <View style={[styles.quickActionsContainer, { backgroundColor: theme.colors.surface }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickActions}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={[styles.quickActionButton, { borderColor: action.color }]}
              onPress={() => handleQuickAction(action)}
            >
              {action.icon}
              <Text style={[styles.quickActionText, { color: action.color }]}>
                {action.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map(renderMessage)}
        {renderTypingIndicator()}
      </ScrollView>

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.inputContainer, {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        }]}
      >
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.textInput, {
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.border,
              color: theme.colors.text,
            }]}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask me about stocks, market trends, or investment advice..."
            placeholderTextColor={theme.colors.secondary}
            multiline
            maxLength={500}
            onSubmitEditing={() => handleSendMessage()}
          />
          <TouchableOpacity
            style={[styles.sendButton, {
              backgroundColor: inputText.trim() ? theme.colors.primary : theme.colors.border,
            }]}
            onPress={() => handleSendMessage()}
            disabled={!inputText.trim()}
          >
            <Send size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  closeButton: {
    padding: 8,
  },
  quickActionsContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  quickActions: {
    paddingHorizontal: 16,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  aiMessage: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  messageBubble: {
    maxWidth: screenWidth * 0.75,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    borderWidth: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  messageTypeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 8,
  },
  messageTypeText: {
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
  stockSymbol: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 2,
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    maxHeight: 100,
    fontSize: 15,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});