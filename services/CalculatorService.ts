// TODO: Install @react-native-async-storage/async-storage package
// Run: npm install @react-native-async-storage/async-storage
// TODO: First install @react-native-async-storage/async-storage:
// npm install @react-native-async-storage/async-storage
// Then uncomment this import:
// import AsyncStorage from '@react-native-async-storage/async-storage';

// For now using localStorage as fallback
const AsyncStorage = {
  getItem: (key: string) => localStorage.getItem(key),
  setItem: (key: string, value: string) => localStorage.setItem(key, value),
  removeItem: (key: string) => localStorage.removeItem(key)
};

interface CalculationResult {
  id: string;
  type: CalculatorType;
  inputs: { [key: string]: any };
  outputs: { [key: string]: any };
  timestamp: Date;
  saved: boolean;
  name?: string;
  notes?: string;
}

interface SIPCalculatorInputs {
  monthlyInvestment: number;
  expectedReturn: number; // annual percentage
  timePeriod: number; // in years
  inflationRate?: number;
  stepUpPercentage?: number; // annual increase in SIP amount
}

interface SIPCalculatorOutputs {
  totalInvestment: number;
  totalReturns: number;
  maturityAmount: number;
  realValue?: number; // inflation adjusted
  yearlyBreakdown: {
    year: number;
    investment: number;
    returns: number;
    totalValue: number;
  }[];
}

interface LumpsumCalculatorInputs {
  initialInvestment: number;
  expectedReturn: number;
  timePeriod: number;
  inflationRate?: number;
  additionalInvestments?: {
    amount: number;
    frequency: 'monthly' | 'quarterly' | 'yearly';
  };
}

interface LumpsumCalculatorOutputs {
  finalAmount: number;
  totalReturns: number;
  realValue?: number;
  yearlyBreakdown: {
    year: number;
    value: number;
    returns: number;
  }[];
}

interface EMICalculatorInputs {
  loanAmount: number;
  interestRate: number; // annual percentage
  loanTenure: number; // in years
  processingFee?: number;
  insurance?: number;
}

interface EMICalculatorOutputs {
  monthlyEMI: number;
  totalInterest: number;
  totalAmount: number;
  processingFeeAmount?: number;
  insuranceAmount?: number;
  amortizationSchedule: {
    month: number;
    emi: number;
    principal: number;
    interest: number;
    balance: number;
  }[];
}

interface RetirementCalculatorInputs {
  currentAge: number;
  retirementAge: number;
  currentSavings: number;
  monthlyExpenses: number;
  expectedInflation: number;
  expectedReturn: number;
  monthlySavings: number;
  postRetirementReturn: number;
  lifeExpectancy: number;
}

interface RetirementCalculatorOutputs {
  requiredCorpus: number;
  projectedCorpus: number;
  shortfall: number;
  additionalMonthlySavingsRequired: number;
  yearlyProjection: {
    age: number;
    savings: number;
    expenses: number;
    surplus: number;
  }[];
}

interface TaxCalculatorInputs {
  annualIncome: number;
  investmentIn80C: number; // Section 80C investments
  investmentIn80D: number; // Health insurance
  homeLoanInterest: number;
  otherDeductions: number;
  regime: 'old' | 'new';
}

interface TaxCalculatorOutputs {
  grossIncome: number;
  totalDeductions: number;
  taxableIncome: number;
  incomeTax: number;
  cess: number;
  totalTax: number;
  netIncome: number;
  effectiveTaxRate: number;
  marginalTaxRate: number;
  taxBreakdown: {
    slab: string;
    rate: number;
    amount: number;
  }[];
}

interface GoalPlanningInputs {
  goalName: string;
  targetAmount: number;
  timeToGoal: number; // in years
  currentSavings: number;
  expectedReturn: number;
  inflationRate: number;
}

interface GoalPlanningOutputs {
  inflationAdjustedGoal: number;
  monthlyInvestmentRequired: number;
  lumpsumRequired: number;
  projectedValue: number;
  shortfall: number;
  yearlyProjection: {
    year: number;
    investment: number;
    value: number;
    goalProgress: number;
  }[];
}

interface CompoundInterestInputs {
  principal: number;
  rate: number;
  time: number;
  compoundingFrequency: 'daily' | 'monthly' | 'quarterly' | 'yearly';
  additionalContributions?: {
    amount: number;
    frequency: 'monthly' | 'quarterly' | 'yearly';
  };
}

interface CompoundInterestOutputs {
  finalAmount: number;
  totalInterest: number;
  effectiveRate: number;
  yearlyBreakdown: {
    year: number;
    principal: number;
    interest: number;
    total: number;
  }[];
}

interface RiskCalculatorInputs {
  portfolio: {
    symbol: string;
    allocation: number; // percentage
    expectedReturn: number;
    volatility: number;
    beta?: number;
  }[];
  riskFreeRate: number;
  marketReturn: number;
}

interface RiskCalculatorOutputs {
  portfolioReturn: number;
  portfolioVolatility: number;
  portfolioBeta: number;
  sharpeRatio: number;
  treynorRatio: number;
  var95: number; // Value at Risk 95%
  var99: number; // Value at Risk 99%
  maxDrawdown: number;
  diversificationRatio: number;
  riskContribution: {
    symbol: string;
    contribution: number;
  }[];
}

interface ValuationInputs {
  currentPrice: number;
  eps: number; // Earnings per share
  bookValue: number;
  dividendYield: number;
  roe: number; // Return on equity
  growthRate: number;
  discountRate: number;
  peRatio?: number;
  pbRatio?: number;
}

interface ValuationOutputs {
  intrinsicValue: number;
  priceToEarnings: number;
  priceToBook: number;
  dividendDiscountValue: number;
  roePremium: number;
  fairValue: number;
  upside: number; // percentage
  recommendation: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
  valuation: 'undervalued' | 'fairly_valued' | 'overvalued';
}

type CalculatorType = 
  | 'sip'
  | 'lumpsum'
  | 'emi'
  | 'retirement'
  | 'tax'
  | 'goal_planning'
  | 'compound_interest'
  | 'risk_analysis'
  | 'valuation'
  | 'portfolio_rebalancing'
  | 'asset_allocation'
  | 'dividend_yield'
  | 'break_even'
  | 'margin_calculator';

interface SavedCalculation {
  id: string;
  name: string;
  type: CalculatorType;
  result: CalculationResult;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  isFavorite: boolean;
}

class CalculatorService {
  private static instance: CalculatorService;
  private savedCalculations: Map<string, SavedCalculation> = new Map();
  private calculationHistory: CalculationResult[] = [];
  private subscribers: Map<string, (data: any) => void> = new Map();

  private constructor() {
    this.loadStoredData();
  }

  public static getInstance(): CalculatorService {
    if (!CalculatorService.instance) {
      CalculatorService.instance = new CalculatorService();
    }
    return CalculatorService.instance;
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

  // SIP Calculator
  public calculateSIP(inputs: SIPCalculatorInputs): SIPCalculatorOutputs {
    const { monthlyInvestment, expectedReturn, timePeriod, inflationRate = 0, stepUpPercentage = 0 } = inputs;
    
    const monthlyRate = expectedReturn / 100 / 12;
    const totalMonths = timePeriod * 12;
    let totalInvestment = 0;
    let maturityAmount = 0;
    const yearlyBreakdown: SIPCalculatorOutputs['yearlyBreakdown'] = [];
    
    let currentMonthlyInvestment = monthlyInvestment;
    let cumulativeInvestment = 0;
    let cumulativeValue = 0;
    
    for (let month = 1; month <= totalMonths; month++) {
      // Apply step-up annually
      if (month > 1 && (month - 1) % 12 === 0 && stepUpPercentage > 0) {
        currentMonthlyInvestment *= (1 + stepUpPercentage / 100);
      }
      
      cumulativeInvestment += currentMonthlyInvestment;
      cumulativeValue = (cumulativeValue + currentMonthlyInvestment) * (1 + monthlyRate);
      
      // Store yearly breakdown
      if (month % 12 === 0) {
        const year = month / 12;
        yearlyBreakdown.push({
          year,
          investment: cumulativeInvestment,
          returns: cumulativeValue - cumulativeInvestment,
          totalValue: cumulativeValue
        });
      }
    }
    
    totalInvestment = cumulativeInvestment;
    maturityAmount = cumulativeValue;
    const totalReturns = maturityAmount - totalInvestment;
    
    // Calculate inflation-adjusted value
    const realValue = inflationRate > 0 
      ? maturityAmount / Math.pow(1 + inflationRate / 100, timePeriod)
      : undefined;
    
    const result: SIPCalculatorOutputs = {
      totalInvestment,
      totalReturns,
      maturityAmount,
      realValue,
      yearlyBreakdown
    };
    
    this.saveCalculationToHistory('sip', inputs, result);
    return result;
  }

  // Lumpsum Calculator
  public calculateLumpsum(inputs: LumpsumCalculatorInputs): LumpsumCalculatorOutputs {
    const { initialInvestment, expectedReturn, timePeriod, inflationRate = 0, additionalInvestments } = inputs;
    
    const annualRate = expectedReturn / 100;
    let currentValue = initialInvestment;
    const yearlyBreakdown: LumpsumCalculatorOutputs['yearlyBreakdown'] = [];
    
    for (let year = 1; year <= timePeriod; year++) {
      const yearStartValue = currentValue;
      
      // Add additional investments if specified
      if (additionalInvestments) {
        const { amount, frequency } = additionalInvestments;
        let additionalAmount = 0;
        
        switch (frequency) {
          case 'yearly':
            additionalAmount = amount;
            break;
          case 'quarterly':
            additionalAmount = amount * 4;
            break;
          case 'monthly':
            additionalAmount = amount * 12;
            break;
        }
        
        currentValue += additionalAmount;
      }
      
      // Apply annual return
      currentValue *= (1 + annualRate);
      
      yearlyBreakdown.push({
        year,
        value: currentValue,
        returns: currentValue - yearStartValue
      });
    }
    
    const finalAmount = currentValue;
    const totalReturns = finalAmount - initialInvestment;
    
    // Calculate inflation-adjusted value
    const realValue = inflationRate > 0 
      ? finalAmount / Math.pow(1 + inflationRate / 100, timePeriod)
      : undefined;
    
    const result: LumpsumCalculatorOutputs = {
      finalAmount,
      totalReturns,
      realValue,
      yearlyBreakdown
    };
    
    this.saveCalculationToHistory('lumpsum', inputs, result);
    return result;
  }

  // EMI Calculator
  public calculateEMI(inputs: EMICalculatorInputs): EMICalculatorOutputs {
    const { loanAmount, interestRate, loanTenure, processingFee = 0, insurance = 0 } = inputs;
    
    const monthlyRate = interestRate / 100 / 12;
    const totalMonths = loanTenure * 12;
    
    // Calculate EMI using formula: P * r * (1+r)^n / ((1+r)^n - 1)
    const emi = loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths) / 
                (Math.pow(1 + monthlyRate, totalMonths) - 1);
    
    const totalAmount = emi * totalMonths;
    const totalInterest = totalAmount - loanAmount;
    
    // Calculate processing fee and insurance
    const processingFeeAmount = (processingFee / 100) * loanAmount;
    const insuranceAmount = (insurance / 100) * loanAmount;
    
    // Generate amortization schedule
    const amortizationSchedule: EMICalculatorOutputs['amortizationSchedule'] = [];
    let remainingBalance = loanAmount;
    
    for (let month = 1; month <= totalMonths; month++) {
      const interestComponent = remainingBalance * monthlyRate;
      const principalComponent = emi - interestComponent;
      remainingBalance -= principalComponent;
      
      amortizationSchedule.push({
        month,
        emi: Math.round(emi),
        principal: Math.round(principalComponent),
        interest: Math.round(interestComponent),
        balance: Math.round(Math.max(0, remainingBalance))
      });
    }
    
    const result: EMICalculatorOutputs = {
      monthlyEMI: Math.round(emi),
      totalInterest: Math.round(totalInterest),
      totalAmount: Math.round(totalAmount),
      processingFeeAmount: processingFeeAmount > 0 ? Math.round(processingFeeAmount) : undefined,
      insuranceAmount: insuranceAmount > 0 ? Math.round(insuranceAmount) : undefined,
      amortizationSchedule
    };
    
    this.saveCalculationToHistory('emi', inputs, result);
    return result;
  }

  // Retirement Calculator
  public calculateRetirement(inputs: RetirementCalculatorInputs): RetirementCalculatorOutputs {
    const {
      currentAge,
      retirementAge,
      currentSavings,
      monthlyExpenses,
      expectedInflation,
      expectedReturn,
      monthlySavings,
      postRetirementReturn,
      lifeExpectancy
    } = inputs;
    
    const yearsToRetirement = retirementAge - currentAge;
    const yearsInRetirement = lifeExpectancy - retirementAge;
    
    // Calculate future monthly expenses at retirement (inflation adjusted)
    const futureMonthlyExpenses = monthlyExpenses * Math.pow(1 + expectedInflation / 100, yearsToRetirement);
    
    // Calculate required corpus for retirement
    const monthlyPostRetirementRate = postRetirementReturn / 100 / 12;
    const totalRetirementMonths = yearsInRetirement * 12;
    
    // Using present value of annuity formula
    const requiredCorpus = futureMonthlyExpenses * 
      ((1 - Math.pow(1 + monthlyPostRetirementRate, -totalRetirementMonths)) / monthlyPostRetirementRate);
    
    // Calculate projected corpus from current savings and monthly investments
    const monthlyReturnRate = expectedReturn / 100 / 12;
    const totalSavingMonths = yearsToRetirement * 12;
    
    // Future value of current savings
    const futureValueCurrentSavings = currentSavings * Math.pow(1 + expectedReturn / 100, yearsToRetirement);
    
    // Future value of monthly SIP
    const futureValueMonthlySavings = monthlySavings * 
      ((Math.pow(1 + monthlyReturnRate, totalSavingMonths) - 1) / monthlyReturnRate);
    
    const projectedCorpus = futureValueCurrentSavings + futureValueMonthlySavings;
    const shortfall = Math.max(0, requiredCorpus - projectedCorpus);
    
    // Calculate additional monthly savings required
    const additionalMonthlySavingsRequired = shortfall > 0 
      ? shortfall / ((Math.pow(1 + monthlyReturnRate, totalSavingMonths) - 1) / monthlyReturnRate)
      : 0;
    
    // Generate yearly projection
    const yearlyProjection: RetirementCalculatorOutputs['yearlyProjection'] = [];
    let cumulativeSavings = currentSavings;
    let annualExpenses = monthlyExpenses * 12;
    
    for (let year = 1; year <= yearsToRetirement; year++) {
      cumulativeSavings = cumulativeSavings * (1 + expectedReturn / 100) + (monthlySavings * 12);
      annualExpenses *= (1 + expectedInflation / 100);
      
      yearlyProjection.push({
        age: currentAge + year,
        savings: Math.round(cumulativeSavings),
        expenses: Math.round(annualExpenses),
        surplus: Math.round(cumulativeSavings - (annualExpenses * (yearsInRetirement - year + 1)))
      });
    }
    
    const result: RetirementCalculatorOutputs = {
      requiredCorpus: Math.round(requiredCorpus),
      projectedCorpus: Math.round(projectedCorpus),
      shortfall: Math.round(shortfall),
      additionalMonthlySavingsRequired: Math.round(additionalMonthlySavingsRequired),
      yearlyProjection
    };
    
    this.saveCalculationToHistory('retirement', inputs, result);
    return result;
  }

  // Tax Calculator (Nepal Tax Slabs)
  public calculateTax(inputs: TaxCalculatorInputs): TaxCalculatorOutputs {
    const {
      annualIncome,
      investmentIn80C,
      investmentIn80D,
      homeLoanInterest,
      otherDeductions,
      regime
    } = inputs;
    
    // Nepal Tax Slabs for FY 2023-24 (Individual)
    const taxSlabs = [
      { min: 0, max: 500000, rate: 1 }, // 1% on first 5 lakh
      { min: 500000, max: 700000, rate: 10 }, // 10% on next 2 lakh
      { min: 700000, max: 1000000, rate: 20 }, // 20% on next 3 lakh
      { min: 1000000, max: 2000000, rate: 30 }, // 30% on next 10 lakh
      { min: 2000000, max: Infinity, rate: 36 } // 36% on above 20 lakh
    ];
    
    const grossIncome = annualIncome;
    
    // Calculate total deductions
    const totalDeductions = Math.min(
      investmentIn80C + investmentIn80D + homeLoanInterest + otherDeductions,
      500000 // Maximum deduction limit
    );
    
    const taxableIncome = Math.max(0, grossIncome - totalDeductions);
    
    // Calculate tax based on slabs
    let incomeTax = 0;
    const taxBreakdown: TaxCalculatorOutputs['taxBreakdown'] = [];
    
    for (const slab of taxSlabs) {
      if (taxableIncome > slab.min) {
        const taxableInThisSlab = Math.min(taxableIncome - slab.min, slab.max - slab.min);
        const taxInThisSlab = (taxableInThisSlab * slab.rate) / 100;
        
        if (taxInThisSlab > 0) {
          incomeTax += taxInThisSlab;
          taxBreakdown.push({
            slab: slab.max === Infinity 
              ? `Above Rs. ${slab.min.toLocaleString()}` 
              : `Rs. ${slab.min.toLocaleString()} - Rs. ${slab.max.toLocaleString()}`,
            rate: slab.rate,
            amount: Math.round(taxInThisSlab)
          });
        }
      }
    }
    
    // Calculate cess (13% of income tax)
    const cess = incomeTax * 0.13;
    const totalTax = incomeTax + cess;
    const netIncome = grossIncome - totalTax;
    
    const effectiveTaxRate = grossIncome > 0 ? (totalTax / grossIncome) * 100 : 0;
    const marginalTaxRate = this.getMarginalTaxRate(taxableIncome, taxSlabs);
    
    const result: TaxCalculatorOutputs = {
      grossIncome: Math.round(grossIncome),
      totalDeductions: Math.round(totalDeductions),
      taxableIncome: Math.round(taxableIncome),
      incomeTax: Math.round(incomeTax),
      cess: Math.round(cess),
      totalTax: Math.round(totalTax),
      netIncome: Math.round(netIncome),
      effectiveTaxRate: Math.round(effectiveTaxRate * 100) / 100,
      marginalTaxRate,
      taxBreakdown
    };
    
    this.saveCalculationToHistory('tax', inputs, result);
    return result;
  }

  private getMarginalTaxRate(taxableIncome: number, taxSlabs: any[]): number {
    for (const slab of taxSlabs) {
      if (taxableIncome >= slab.min && taxableIncome < slab.max) {
        return slab.rate;
      }
    }
    return taxSlabs[taxSlabs.length - 1].rate;
  }

  // Goal Planning Calculator
  public calculateGoalPlanning(inputs: GoalPlanningInputs): GoalPlanningOutputs {
    const {
      goalName,
      targetAmount,
      timeToGoal,
      currentSavings,
      expectedReturn,
      inflationRate
    } = inputs;
    
    // Calculate inflation-adjusted goal amount
    const inflationAdjustedGoal = targetAmount * Math.pow(1 + inflationRate / 100, timeToGoal);
    
    // Future value of current savings
    const futureValueCurrentSavings = currentSavings * Math.pow(1 + expectedReturn / 100, timeToGoal);
    
    // Amount needed from monthly investments
    const amountNeededFromSIP = Math.max(0, inflationAdjustedGoal - futureValueCurrentSavings);
    
    // Calculate monthly investment required
    const monthlyRate = expectedReturn / 100 / 12;
    const totalMonths = timeToGoal * 12;
    
    const monthlyInvestmentRequired = amountNeededFromSIP > 0 
      ? amountNeededFromSIP / ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate)
      : 0;
    
    // Calculate lumpsum required if investing today
    const lumpsumRequired = inflationAdjustedGoal / Math.pow(1 + expectedReturn / 100, timeToGoal);
    
    // Calculate projected value with current plan
    const projectedValue = futureValueCurrentSavings;
    const shortfall = Math.max(0, inflationAdjustedGoal - projectedValue);
    
    // Generate yearly projection
    const yearlyProjection: GoalPlanningOutputs['yearlyProjection'] = [];
    let cumulativeInvestment = currentSavings;
    let cumulativeValue = currentSavings;
    
    for (let year = 1; year <= timeToGoal; year++) {
      const annualInvestment = monthlyInvestmentRequired * 12;
      cumulativeInvestment += annualInvestment;
      cumulativeValue = cumulativeValue * (1 + expectedReturn / 100) + annualInvestment;
      
      const goalProgress = (cumulativeValue / inflationAdjustedGoal) * 100;
      
      yearlyProjection.push({
        year,
        investment: Math.round(cumulativeInvestment),
        value: Math.round(cumulativeValue),
        goalProgress: Math.round(goalProgress * 100) / 100
      });
    }
    
    const result: GoalPlanningOutputs = {
      inflationAdjustedGoal: Math.round(inflationAdjustedGoal),
      monthlyInvestmentRequired: Math.round(monthlyInvestmentRequired),
      lumpsumRequired: Math.round(lumpsumRequired),
      projectedValue: Math.round(projectedValue),
      shortfall: Math.round(shortfall),
      yearlyProjection
    };
    
    this.saveCalculationToHistory('goal_planning', inputs, result);
    return result;
  }

  // Compound Interest Calculator
  public calculateCompoundInterest(inputs: CompoundInterestInputs): CompoundInterestOutputs {
    const { principal, rate, time, compoundingFrequency, additionalContributions } = inputs;
    
    // Get compounding frequency multiplier
    const frequencyMap = {
      daily: 365,
      monthly: 12,
      quarterly: 4,
      yearly: 1
    };
    
    const n = frequencyMap[compoundingFrequency];
    const r = rate / 100;
    
    // Calculate compound interest: A = P(1 + r/n)^(nt)
    let finalAmount = principal * Math.pow(1 + r / n, n * time);
    
    // Add additional contributions if specified
    if (additionalContributions) {
      const { amount, frequency } = additionalContributions;
      const contributionFrequencyMap = {
        monthly: 12,
        quarterly: 4,
        yearly: 1
      };
      
      const contributionsPerYear = contributionFrequencyMap[frequency];
      const totalContributions = amount * contributionsPerYear * time;
      
      // Future value of annuity for additional contributions
      const monthlyRate = r / 12;
      const totalMonths = time * 12;
      const monthlyContribution = amount * (contributionsPerYear / 12);
      
      const futureValueContributions = monthlyContribution * 
        ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate);
      
      finalAmount += futureValueContributions;
    }
    
    const totalInterest = finalAmount - principal;
    const effectiveRate = Math.pow(finalAmount / principal, 1 / time) - 1;
    
    // Generate yearly breakdown
    const yearlyBreakdown: CompoundInterestOutputs['yearlyBreakdown'] = [];
    let currentPrincipal = principal;
    
    for (let year = 1; year <= time; year++) {
      const yearStartPrincipal = currentPrincipal;
      
      // Add annual contributions if applicable
      if (additionalContributions && additionalContributions.frequency === 'yearly') {
        currentPrincipal += additionalContributions.amount;
      }
      
      // Apply compound interest
      currentPrincipal *= Math.pow(1 + r / n, n);
      
      const yearInterest = currentPrincipal - yearStartPrincipal;
      
      yearlyBreakdown.push({
        year,
        principal: Math.round(yearStartPrincipal),
        interest: Math.round(yearInterest),
        total: Math.round(currentPrincipal)
      });
    }
    
    const result: CompoundInterestOutputs = {
      finalAmount: Math.round(finalAmount),
      totalInterest: Math.round(totalInterest),
      effectiveRate: Math.round(effectiveRate * 10000) / 100, // Convert to percentage with 2 decimals
      yearlyBreakdown
    };
    
    this.saveCalculationToHistory('compound_interest', inputs, result);
    return result;
  }

  // Risk Analysis Calculator
  public calculateRiskAnalysis(inputs: RiskCalculatorInputs): RiskCalculatorOutputs {
    const { portfolio, riskFreeRate, marketReturn } = inputs;
    
    // Validate portfolio allocations sum to 100%
    const totalAllocation = portfolio.reduce((sum, asset) => sum + asset.allocation, 0);
    if (Math.abs(totalAllocation - 100) > 0.01) {
      throw new Error('Portfolio allocations must sum to 100%');
    }
    
    // Calculate portfolio return (weighted average)
    const portfolioReturn = portfolio.reduce((sum, asset) => 
      sum + (asset.allocation / 100) * asset.expectedReturn, 0
    );
    
    // Calculate portfolio volatility (simplified - assumes no correlation)
    const portfolioVariance = portfolio.reduce((sum, asset) => 
      sum + Math.pow(asset.allocation / 100, 2) * Math.pow(asset.volatility, 2), 0
    );
    const portfolioVolatility = Math.sqrt(portfolioVariance);
    
    // Calculate portfolio beta (weighted average)
    const portfolioBeta = portfolio.reduce((sum, asset) => 
      sum + (asset.allocation / 100) * (asset.beta || 1), 0
    );
    
    // Calculate Sharpe Ratio
    const excessReturn = portfolioReturn - riskFreeRate;
    const sharpeRatio = portfolioVolatility > 0 ? excessReturn / portfolioVolatility : 0;
    
    // Calculate Treynor Ratio
    const treynorRatio = portfolioBeta > 0 ? excessReturn / portfolioBeta : 0;
    
    // Calculate Value at Risk (simplified normal distribution assumption)
    const var95 = portfolioReturn - (1.645 * portfolioVolatility); // 95% confidence
    const var99 = portfolioReturn - (2.326 * portfolioVolatility); // 99% confidence
    
    // Calculate maximum drawdown (simplified)
    const maxDrawdown = portfolioVolatility * 2; // Simplified estimate
    
    // Calculate diversification ratio
    const weightedAverageVolatility = portfolio.reduce((sum, asset) => 
      sum + (asset.allocation / 100) * asset.volatility, 0
    );
    const diversificationRatio = weightedAverageVolatility / portfolioVolatility;
    
    // Calculate risk contribution
    const riskContribution = portfolio.map(asset => ({
      symbol: asset.symbol,
      contribution: (asset.allocation / 100) * asset.volatility / portfolioVolatility * 100
    }));
    
    const result: RiskCalculatorOutputs = {
      portfolioReturn: Math.round(portfolioReturn * 100) / 100,
      portfolioVolatility: Math.round(portfolioVolatility * 100) / 100,
      portfolioBeta: Math.round(portfolioBeta * 100) / 100,
      sharpeRatio: Math.round(sharpeRatio * 100) / 100,
      treynorRatio: Math.round(treynorRatio * 100) / 100,
      var95: Math.round(var95 * 100) / 100,
      var99: Math.round(var99 * 100) / 100,
      maxDrawdown: Math.round(maxDrawdown * 100) / 100,
      diversificationRatio: Math.round(diversificationRatio * 100) / 100,
      riskContribution: riskContribution.map(rc => ({
        symbol: rc.symbol,
        contribution: Math.round(rc.contribution * 100) / 100
      }))
    };
    
    this.saveCalculationToHistory('risk_analysis', inputs, result);
    return result;
  }

  // Stock Valuation Calculator
  public calculateValuation(inputs: ValuationInputs): ValuationOutputs {
    const {
      currentPrice,
      eps,
      bookValue,
      dividendYield,
      roe,
      growthRate,
      discountRate,
      peRatio,
      pbRatio
    } = inputs;
    
    // Calculate P/E and P/B ratios
    const priceToEarnings = peRatio || (eps > 0 ? currentPrice / eps : 0);
    const priceToBook = pbRatio || (bookValue > 0 ? currentPrice / bookValue : 0);
    
    // Dividend Discount Model (Gordon Growth Model)
    const dividendPerShare = (dividendYield / 100) * currentPrice;
    const dividendDiscountValue = dividendPerShare > 0 && discountRate > growthRate 
      ? (dividendPerShare * (1 + growthRate / 100)) / ((discountRate - growthRate) / 100)
      : 0;
    
    // ROE-based valuation
    const roePremium = roe > discountRate ? (roe - discountRate) / discountRate : 0;
    
    // Calculate intrinsic value (simplified DCF)
    const futureEPS = eps * Math.pow(1 + growthRate / 100, 5); // 5-year projection
    const terminalValue = futureEPS * 15; // Assuming 15x terminal P/E
    const intrinsicValue = terminalValue / Math.pow(1 + discountRate / 100, 5);
    
    // Fair value (average of different methods)
    const valuationMethods = [intrinsicValue, dividendDiscountValue].filter(v => v > 0);
    const fairValue = valuationMethods.length > 0 
      ? valuationMethods.reduce((sum, v) => sum + v, 0) / valuationMethods.length
      : intrinsicValue;
    
    // Calculate upside/downside
    const upside = fairValue > 0 ? ((fairValue - currentPrice) / currentPrice) * 100 : 0;
    
    // Determine recommendation
    let recommendation: ValuationOutputs['recommendation'];
    if (upside > 20) recommendation = 'strong_buy';
    else if (upside > 10) recommendation = 'buy';
    else if (upside > -10) recommendation = 'hold';
    else if (upside > -20) recommendation = 'sell';
    else recommendation = 'strong_sell';
    
    // Determine valuation
    let valuation: ValuationOutputs['valuation'];
    if (upside > 15) valuation = 'undervalued';
    else if (upside < -15) valuation = 'overvalued';
    else valuation = 'fairly_valued';
    
    const result: ValuationOutputs = {
      intrinsicValue: Math.round(intrinsicValue),
      priceToEarnings: Math.round(priceToEarnings * 100) / 100,
      priceToBook: Math.round(priceToBook * 100) / 100,
      dividendDiscountValue: Math.round(dividendDiscountValue),
      roePremium: Math.round(roePremium * 10000) / 100,
      fairValue: Math.round(fairValue),
      upside: Math.round(upside * 100) / 100,
      recommendation,
      valuation
    };
    
    this.saveCalculationToHistory('valuation', inputs, result);
    return result;
  }

  // Calculation History Management
  private saveCalculationToHistory(type: CalculatorType, inputs: any, outputs: any): void {
    const calculation: CalculationResult = {
      id: `calc_${Date.now()}_${Math.random()}`,
      type,
      inputs,
      outputs,
      timestamp: new Date(),
      saved: false
    };
    
    this.calculationHistory.unshift(calculation);
    
    // Keep only last 100 calculations
    if (this.calculationHistory.length > 100) {
      this.calculationHistory = this.calculationHistory.slice(0, 100);
    }
    
    this.saveHistoryToStorage();
    this.notifySubscribers('calculation_completed', calculation);
  }

  public getCalculationHistory(type?: CalculatorType): CalculationResult[] {
    if (type) {
      return this.calculationHistory.filter(calc => calc.type === type);
    }
    return this.calculationHistory;
  }

  public async saveCalculation(calculationId: string, name: string, tags: string[] = []): Promise<string> {
    const calculation = this.calculationHistory.find(calc => calc.id === calculationId);
    if (!calculation) throw new Error('Calculation not found');
    
    const savedId = `saved_${Date.now()}_${Math.random()}`;
    const savedCalculation: SavedCalculation = {
      id: savedId,
      name,
      type: calculation.type,
      result: { ...calculation, saved: true, name },
      createdAt: new Date(),
      updatedAt: new Date(),
      tags,
      isFavorite: false
    };
    
    this.savedCalculations.set(savedId, savedCalculation);
    calculation.saved = true;
    calculation.name = name;
    
    await this.saveSavedCalculationsToStorage();
    this.notifySubscribers('calculation_saved', savedCalculation);
    
    return savedId;
  }

  public getSavedCalculations(type?: CalculatorType): SavedCalculation[] {
    let saved = Array.from(this.savedCalculations.values());
    
    if (type) {
      saved = saved.filter(calc => calc.type === type);
    }
    
    return saved.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  public async deleteSavedCalculation(id: string): Promise<void> {
    this.savedCalculations.delete(id);
    await this.saveSavedCalculationsToStorage();
    this.notifySubscribers('calculation_deleted', { id });
  }

  public async toggleFavorite(id: string): Promise<boolean> {
    const calculation = this.savedCalculations.get(id);
    if (!calculation) return false;
    
    calculation.isFavorite = !calculation.isFavorite;
    calculation.updatedAt = new Date();
    
    await this.saveSavedCalculationsToStorage();
    this.notifySubscribers('favorite_toggled', { id, isFavorite: calculation.isFavorite });
    
    return calculation.isFavorite;
  }

  public getFavoriteCalculations(): SavedCalculation[] {
    return Array.from(this.savedCalculations.values())
      .filter(calc => calc.isFavorite)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  // Utility Methods
  public getCalculatorTypes(): { type: CalculatorType; name: string; description: string }[] {
    return [
      {
        type: 'sip',
        name: 'SIP Calculator',
        description: 'Calculate returns from Systematic Investment Plan'
      },
      {
        type: 'lumpsum',
        name: 'Lumpsum Calculator',
        description: 'Calculate returns from one-time investment'
      },
      {
        type: 'emi',
        name: 'EMI Calculator',
        description: 'Calculate loan EMI and amortization schedule'
      },
      {
        type: 'retirement',
        name: 'Retirement Planner',
        description: 'Plan for your retirement corpus'
      },
      {
        type: 'tax',
        name: 'Tax Calculator',
        description: 'Calculate income tax liability'
      },
      {
        type: 'goal_planning',
        name: 'Goal Planning',
        description: 'Plan investments for financial goals'
      },
      {
        type: 'compound_interest',
        name: 'Compound Interest',
        description: 'Calculate compound interest returns'
      },
      {
        type: 'risk_analysis',
        name: 'Risk Analysis',
        description: 'Analyze portfolio risk metrics'
      },
      {
        type: 'valuation',
        name: 'Stock Valuation',
        description: 'Calculate intrinsic value of stocks'
      }
    ];
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
      const [historyData, savedData] = await Promise.all([
        AsyncStorage.getItem('calculator_history'),
        AsyncStorage.getItem('calculator_saved')
      ]);

      if (historyData) {
        const history = JSON.parse(historyData);
        this.calculationHistory = history.map((calc: any) => ({
          ...calc,
          timestamp: new Date(calc.timestamp)
        }));
      }

      if (savedData) {
        const saved = JSON.parse(savedData);
        saved.forEach((calc: any) => {
          calc.createdAt = new Date(calc.createdAt);
          calc.updatedAt = new Date(calc.updatedAt);
          calc.result.timestamp = new Date(calc.result.timestamp);
          this.savedCalculations.set(calc.id, calc);
        });
      }
    } catch (error) {
      console.error('Failed to load calculator data:', error);
    }
  }

  private async saveHistoryToStorage(): Promise<void> {
    try {
      await AsyncStorage.setItem('calculator_history', JSON.stringify(this.calculationHistory));
    } catch (error) {
      console.error('Failed to save calculation history:', error);
    }
  }

  private async saveSavedCalculationsToStorage(): Promise<void> {
    try {
      const saved = Array.from(this.savedCalculations.values());
      await AsyncStorage.setItem('calculator_saved', JSON.stringify(saved));
    } catch (error) {
      console.error('Failed to save calculations:', error);
    }
  }

  // Cleanup
  public cleanup(): void {
    this.subscribers.clear();
  }
}

export default CalculatorService;
export type {
  CalculatorType,
  CalculationResult,
  SavedCalculation,
  SIPCalculatorInputs,
  SIPCalculatorOutputs,
  LumpsumCalculatorInputs,
  LumpsumCalculatorOutputs,
  EMICalculatorInputs,
  EMICalculatorOutputs,
  RetirementCalculatorInputs,
  RetirementCalculatorOutputs,
  TaxCalculatorInputs,
  TaxCalculatorOutputs,
  GoalPlanningInputs,
  GoalPlanningOutputs,
  CompoundInterestInputs,
  CompoundInterestOutputs,
  RiskCalculatorInputs,
  RiskCalculatorOutputs,
  ValuationInputs,
  ValuationOutputs
};