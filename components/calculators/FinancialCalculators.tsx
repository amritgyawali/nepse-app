import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Calculator,
  TrendingUp,
  PieChart,
  DollarSign,
  Target,
  Calendar,
  Percent,
  BarChart3,
  ArrowRight,
  Info,
} from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';

const { width: screenWidth } = Dimensions.get('window');

interface CalculatorResult {
  title: string;
  value: string;
  description: string;
  color: string;
}

interface Calculator {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string[];
  inputs: CalculatorInput[];
  calculate: (inputs: { [key: string]: number }) => CalculatorResult[];
}

interface CalculatorInput {
  key: string;
  label: string;
  placeholder: string;
  suffix?: string;
  type: 'number' | 'percentage';
}

const calculators: Calculator[] = [
  {
    id: 'sip',
    title: 'SIP Calculator',
    description: 'Calculate returns from Systematic Investment Plan',
    icon: <Calendar size={24} color="#FFFFFF" />,
    gradient: ['#667eea', '#764ba2'],
    inputs: [
      { key: 'monthlyAmount', label: 'Monthly Investment', placeholder: '10000', suffix: 'NPR', type: 'number' },
      { key: 'annualReturn', label: 'Expected Annual Return', placeholder: '12', suffix: '%', type: 'percentage' },
      { key: 'years', label: 'Investment Period', placeholder: '10', suffix: 'Years', type: 'number' },
    ],
    calculate: (inputs) => {
      const { monthlyAmount, annualReturn, years } = inputs;
      const monthlyRate = annualReturn / 100 / 12;
      const months = years * 12;
      const totalInvestment = monthlyAmount * months;
      
      const futureValue = monthlyAmount * (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate));
      const totalReturns = futureValue - totalInvestment;
      
      return [
        {
          title: 'Future Value',
          value: `NPR ${futureValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
          description: 'Total amount after investment period',
          color: '#10B981',
        },
        {
          title: 'Total Investment',
          value: `NPR ${totalInvestment.toLocaleString('en-IN')}`,
          description: 'Amount you will invest',
          color: '#3B82F6',
        },
        {
          title: 'Total Returns',
          value: `NPR ${totalReturns.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
          description: 'Profit from your investment',
          color: '#F59E0B',
        },
        {
          title: 'Return Percentage',
          value: `${((totalReturns / totalInvestment) * 100).toFixed(1)}%`,
          description: 'Overall return percentage',
          color: '#8B5CF6',
        },
      ];
    },
  },
  {
    id: 'roi',
    title: 'ROI Calculator',
    description: 'Calculate Return on Investment',
    icon: <TrendingUp size={24} color="#FFFFFF" />,
    gradient: ['#f093fb', '#f5576c'],
    inputs: [
      { key: 'initialInvestment', label: 'Initial Investment', placeholder: '100000', suffix: 'NPR', type: 'number' },
      { key: 'currentValue', label: 'Current Value', placeholder: '120000', suffix: 'NPR', type: 'number' },
      { key: 'timeHeld', label: 'Time Held', placeholder: '2', suffix: 'Years', type: 'number' },
    ],
    calculate: (inputs) => {
      const { initialInvestment, currentValue, timeHeld } = inputs;
      const totalReturn = currentValue - initialInvestment;
      const roiPercentage = (totalReturn / initialInvestment) * 100;
      const annualizedReturn = Math.pow(currentValue / initialInvestment, 1 / timeHeld) - 1;
      
      return [
        {
          title: 'Total Return',
          value: `NPR ${totalReturn.toLocaleString('en-IN')}`,
          description: totalReturn >= 0 ? 'Profit made' : 'Loss incurred',
          color: totalReturn >= 0 ? '#10B981' : '#EF4444',
        },
        {
          title: 'ROI Percentage',
          value: `${roiPercentage.toFixed(2)}%`,
          description: 'Return on investment',
          color: roiPercentage >= 0 ? '#10B981' : '#EF4444',
        },
        {
          title: 'Annualized Return',
          value: `${(annualizedReturn * 100).toFixed(2)}%`,
          description: 'Average annual return',
          color: '#3B82F6',
        },
        {
          title: 'Investment Multiple',
          value: `${(currentValue / initialInvestment).toFixed(2)}x`,
          description: 'Times money multiplied',
          color: '#8B5CF6',
        },
      ];
    },
  },
  {
    id: 'pe',
    title: 'P/E Ratio Calculator',
    description: 'Calculate Price-to-Earnings ratio',
    icon: <BarChart3 size={24} color="#FFFFFF" />,
    gradient: ['#4facfe', '#00f2fe'],
    inputs: [
      { key: 'marketPrice', label: 'Market Price per Share', placeholder: '1425', suffix: 'NPR', type: 'number' },
      { key: 'earningsPerShare', label: 'Earnings per Share', placeholder: '78', suffix: 'NPR', type: 'number' },
      { key: 'industryPE', label: 'Industry Average P/E', placeholder: '16', suffix: '', type: 'number' },
    ],
    calculate: (inputs) => {
      const { marketPrice, earningsPerShare, industryPE } = inputs;
      const peRatio = marketPrice / earningsPerShare;
      const premiumDiscount = ((peRatio - industryPE) / industryPE) * 100;
      const earningsYield = (earningsPerShare / marketPrice) * 100;
      
      return [
        {
          title: 'P/E Ratio',
          value: peRatio.toFixed(2),
          description: 'Price to earnings multiple',
          color: '#3B82F6',
        },
        {
          title: 'vs Industry Average',
          value: `${premiumDiscount > 0 ? '+' : ''}${premiumDiscount.toFixed(1)}%`,
          description: premiumDiscount > 0 ? 'Premium to industry' : 'Discount to industry',
          color: premiumDiscount > 0 ? '#EF4444' : '#10B981',
        },
        {
          title: 'Earnings Yield',
          value: `${earningsYield.toFixed(2)}%`,
          description: 'Annual earnings as % of price',
          color: '#F59E0B',
        },
        {
          title: 'Valuation',
          value: peRatio < industryPE * 0.8 ? 'Undervalued' : peRatio > industryPE * 1.2 ? 'Overvalued' : 'Fair Value',
          description: 'Based on industry comparison',
          color: peRatio < industryPE * 0.8 ? '#10B981' : peRatio > industryPE * 1.2 ? '#EF4444' : '#F59E0B',
        },
      ];
    },
  },
  {
    id: 'dividend',
    title: 'Dividend Yield Calculator',
    description: 'Calculate dividend yield and income',
    icon: <DollarSign size={24} color="#FFFFFF" />,
    gradient: ['#fa709a', '#fee140'],
    inputs: [
      { key: 'sharePrice', label: 'Share Price', placeholder: '1425', suffix: 'NPR', type: 'number' },
      { key: 'annualDividend', label: 'Annual Dividend per Share', placeholder: '50', suffix: 'NPR', type: 'number' },
      { key: 'shares', label: 'Number of Shares', placeholder: '100', suffix: 'Shares', type: 'number' },
    ],
    calculate: (inputs) => {
      const { sharePrice, annualDividend, shares } = inputs;
      const dividendYield = (annualDividend / sharePrice) * 100;
      const annualIncome = annualDividend * shares;
      const totalInvestment = sharePrice * shares;
      const monthlyIncome = annualIncome / 12;
      
      return [
        {
          title: 'Dividend Yield',
          value: `${dividendYield.toFixed(2)}%`,
          description: 'Annual dividend as % of price',
          color: '#10B981',
        },
        {
          title: 'Annual Income',
          value: `NPR ${annualIncome.toLocaleString('en-IN')}`,
          description: 'Total yearly dividend income',
          color: '#3B82F6',
        },
        {
          title: 'Monthly Income',
          value: `NPR ${monthlyIncome.toLocaleString('en-IN')}`,
          description: 'Average monthly dividend',
          color: '#F59E0B',
        },
        {
          title: 'Yield on Investment',
          value: `${((annualIncome / totalInvestment) * 100).toFixed(2)}%`,
          description: 'Return on total investment',
          color: '#8B5CF6',
        },
      ];
    },
  },
  {
    id: 'goal',
    title: 'Investment Goal Planner',
    description: 'Plan your investment to reach financial goals',
    icon: <Target size={24} color="#FFFFFF" />,
    gradient: ['#a8edea', '#fed6e3'],
    inputs: [
      { key: 'targetAmount', label: 'Target Amount', placeholder: '1000000', suffix: 'NPR', type: 'number' },
      { key: 'timeFrame', label: 'Time Frame', placeholder: '5', suffix: 'Years', type: 'number' },
      { key: 'expectedReturn', label: 'Expected Annual Return', placeholder: '12', suffix: '%', type: 'percentage' },
      { key: 'currentSavings', label: 'Current Savings', placeholder: '50000', suffix: 'NPR', type: 'number' },
    ],
    calculate: (inputs) => {
      const { targetAmount, timeFrame, expectedReturn, currentSavings } = inputs;
      const monthlyRate = expectedReturn / 100 / 12;
      const months = timeFrame * 12;
      
      // Future value of current savings
      const futureValueCurrentSavings = currentSavings * Math.pow(1 + expectedReturn / 100, timeFrame);
      
      // Amount needed from monthly investments
      const amountNeededFromSIP = targetAmount - futureValueCurrentSavings;
      
      // Required monthly SIP
      const requiredMonthlySIP = amountNeededFromSIP / (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate));
      
      const totalMonthlyInvestment = requiredMonthlySIP;
      const totalInvestmentNeeded = (totalMonthlyInvestment * months) + currentSavings;
      
      return [
        {
          title: 'Required Monthly SIP',
          value: `NPR ${Math.max(0, requiredMonthlySIP).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
          description: 'Monthly investment needed',
          color: '#3B82F6',
        },
        {
          title: 'Total Investment',
          value: `NPR ${totalInvestmentNeeded.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
          description: 'Total amount you need to invest',
          color: '#F59E0B',
        },
        {
          title: 'Current Savings Growth',
          value: `NPR ${futureValueCurrentSavings.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
          description: 'Value of current savings at maturity',
          color: '#10B981',
        },
        {
          title: 'Goal Achievability',
          value: requiredMonthlySIP > 0 ? 'Achievable' : 'Already Achieved',
          description: requiredMonthlySIP > 0 ? 'With disciplined investing' : 'Current savings sufficient',
          color: '#8B5CF6',
        },
      ];
    },
  },
];

export default function FinancialCalculators() {
  const { theme } = useTheme();
  const [selectedCalculator, setSelectedCalculator] = useState<Calculator | null>(null);
  const [inputs, setInputs] = useState<{ [key: string]: string }>({});
  const [results, setResults] = useState<CalculatorResult[]>([]);

  const handleCalculatorSelect = (calculator: Calculator) => {
    setSelectedCalculator(calculator);
    setInputs({});
    setResults([]);
  };

  const handleInputChange = (key: string, value: string) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  const handleCalculate = () => {
    if (!selectedCalculator) return;
    
    const numericInputs: { [key: string]: number } = {};
    let hasError = false;
    
    for (const input of selectedCalculator.inputs) {
      const value = parseFloat(inputs[input.key] || '0');
      if (isNaN(value) || value < 0) {
        Alert.alert('Invalid Input', `Please enter a valid ${input.label.toLowerCase()}`);
        hasError = true;
        break;
      }
      numericInputs[input.key] = value;
    }
    
    if (!hasError) {
      try {
        const calculatedResults = selectedCalculator.calculate(numericInputs);
        setResults(calculatedResults);
      } catch (error) {
        Alert.alert('Calculation Error', 'Please check your inputs and try again.');
      }
    }
  };

  const handleReset = () => {
    setInputs({});
    setResults([]);
  };

  if (selectedCalculator) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <LinearGradient
          colors={selectedCalculator.gradient as unknown as readonly [string, string]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <TouchableOpacity
            onPress={() => setSelectedCalculator(null)}
            style={styles.backButton}
          >
            <ArrowRight size={24} color="#FFFFFF" style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <View style={styles.headerIcon}>
              {selectedCalculator.icon}
            </View>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>{selectedCalculator.title}</Text>
              <Text style={styles.headerDescription}>{selectedCalculator.description}</Text>
            </View>
          </View>
        </LinearGradient>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Input Section */}
          <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Input Parameters</Text>
            {selectedCalculator.inputs.map((input) => (
              <View key={input.key} style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>{input.label}</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={[styles.textInput, {
                      backgroundColor: theme.colors.background,
                      borderColor: theme.colors.border,
                      color: theme.colors.text,
                    }]}
                    value={inputs[input.key] || ''}
                    onChangeText={(value) => handleInputChange(input.key, value)}
                    placeholder={input.placeholder}
                    placeholderTextColor={theme.colors.secondary}
                    keyboardType="numeric"
                  />
                  {input.suffix && (
                    <Text style={[styles.inputSuffix, { color: theme.colors.secondary }]}>
                      {input.suffix}
                    </Text>
                  )}
                </View>
              </View>
            ))}
            
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.calculateButton, { backgroundColor: selectedCalculator.gradient[0] }]}
                onPress={handleCalculate}
              >
                <Calculator size={20} color="#FFFFFF" />
                <Text style={styles.calculateButtonText}>Calculate</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.resetButton, { borderColor: theme.colors.border }]}
                onPress={handleReset}
              >
                <Text style={[styles.resetButtonText, { color: theme.colors.text }]}>Reset</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Results Section */}
          {results.length > 0 && (
            <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Results</Text>
              {results.map((result, index) => (
                <View key={index} style={[styles.resultCard, { borderLeftColor: result.color }]}>
                  <View style={styles.resultHeader}>
                    <Text style={[styles.resultTitle, { color: theme.colors.text }]}>{result.title}</Text>
                    <Text style={[styles.resultValue, { color: result.color }]}>{result.value}</Text>
                  </View>
                  <Text style={[styles.resultDescription, { color: theme.colors.secondary }]}>
                    {result.description}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Info Section */}
          <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.infoHeader}>
              <Info size={20} color={theme.colors.primary} />
              <Text style={[styles.sectionTitle, { color: theme.colors.text, marginLeft: 8 }]}>Important Notes</Text>
            </View>
            <Text style={[styles.infoText, { color: theme.colors.secondary }]}>
              • These calculations are for illustrative purposes only{"\n"}
              • Actual returns may vary based on market conditions{"\n"}
              • Consider inflation and taxes in your planning{"\n"}
              • Consult a financial advisor for personalized advice
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.mainHeader, { backgroundColor: theme.colors.surface }]}>
        <Calculator size={28} color={theme.colors.primary} />
        <View style={styles.mainHeaderText}>
          <Text style={[styles.mainTitle, { color: theme.colors.text }]}>Financial Calculators</Text>
          <Text style={[styles.mainSubtitle, { color: theme.colors.secondary }]}>Plan your investments wisely</Text>
        </View>
      </View>

      <ScrollView style={styles.calculatorsList} showsVerticalScrollIndicator={false}>
        {calculators.map((calculator) => (
          <TouchableOpacity
            key={calculator.id}
            style={[styles.calculatorCard, { backgroundColor: theme.colors.surface }]}
            onPress={() => handleCalculatorSelect(calculator)}
          >
            <LinearGradient
              colors={calculator.gradient as unknown as readonly [string, string]}
              style={styles.calculatorIcon}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {calculator.icon}
            </LinearGradient>
            <View style={styles.calculatorInfo}>
              <Text style={[styles.calculatorTitle, { color: theme.colors.text }]}>{calculator.title}</Text>
              <Text style={[styles.calculatorDescription, { color: theme.colors.secondary }]}>
                {calculator.description}
              </Text>
            </View>
            <ArrowRight size={20} color={theme.colors.secondary} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  mainHeaderText: {
    marginLeft: 12,
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  mainSubtitle: {
    fontSize: 14,
  },
  calculatorsList: {
    flex: 1,
    padding: 16,
  },
  calculatorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  calculatorIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  calculatorInfo: {
    flex: 1,
  },
  calculatorTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  calculatorDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    marginRight: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    flex: 1,
  },
  section: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  inputSuffix: {
    marginLeft: 12,
    fontSize: 14,
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  calculateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  calculateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  resetButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  resultCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  resultValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultDescription: {
    fontSize: 14,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
});