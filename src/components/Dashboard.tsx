import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard, 
  AlertTriangle,
  Target,
  BarChart3,
  PieChart
} from "lucide-react";
import { MetricsOverview } from "./MetricsOverview";
import { ExpenseTracker } from "./ExpenseTracker";
import { DebtManagement } from "./DebtManagement";
import { AIInsights } from "./AIInsights";
import { useDashboardData } from "@/hooks/useDashboardData";

const Dashboard = () => {
  const financialData = useDashboardData();

  const healthScore = Math.max(0, Math.min(100, 
    (financialData.netProfit / financialData.totalRevenue) * 100 + 
    (financialData.cashFlow > 0 ? 20 : -20) +
    (financialData.totalDebt < financialData.netProfit * 2 ? 10 : -30)
  ));

  const getHealthColor = (score: number) => {
    if (score >= 70) return "status-positive";
    if (score >= 40) return "status-warning"; 
    return "status-negative";
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Business Financial Tracker</h1>
          <p className="text-muted-foreground mt-2">Professional financial management for sustainable growth</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge className={`text-lg px-4 py-2 ${getHealthColor(healthScore)}`}>
            Health Score: {Math.round(healthScore)}%
          </Badge>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <MetricsOverview data={financialData} />

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Financial Overview Cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Revenue & Profit */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="card-elegant p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-success/10 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Total Revenue</h3>
                    <p className="text-muted-foreground text-sm">Current month</p>
                  </div>
                </div>
              </div>
              <div className="text-3xl font-bold text-financial text-success">
                ${financialData.totalRevenue.toLocaleString()}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <TrendingUp className="w-4 h-4 text-success" />
                <span className="text-sm text-success">+12.5% vs last month</span>
              </div>
            </Card>

            <Card className="card-elegant p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent/10 rounded-lg">
                    <DollarSign className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Net Profit</h3>
                    <p className="text-muted-foreground text-sm">After all expenses</p>
                  </div>
                </div>
              </div>
              <div className="text-3xl font-bold text-financial text-success">
                ${financialData.netProfit.toLocaleString()}
              </div>
              <div className="mt-2">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>Profit Margin</span>
                  <span className="text-financial">{financialData.profitMargin}%</span>
                </div>
                <Progress value={financialData.profitMargin} className="h-2" />
              </div>
            </Card>
          </div>

          {/* Expense Tracker */}
          <ExpenseTracker />

          {/* Debt Management */}
          <DebtManagement />
        </div>

        {/* Right Sidebar - AI Insights & Critical Metrics */}
        <div className="space-y-6">
          {/* Critical Metrics */}
          <Card className="card-elegant p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Critical Metrics
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Cash Runway</span>
                <span className={`text-financial font-semibold ${
                  financialData.runway > 12 ? 'text-success' : 
                  financialData.runway > 6 ? 'text-warning' : 'text-destructive'
                }`}>
                  {financialData.runway} months
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Monthly Burn Rate</span>
                <span className="text-financial font-semibold text-destructive">
                  -${financialData.burnRate.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Debt-to-Profit Ratio</span>
                <span className={`text-financial font-semibold ${
                  financialData.totalDebt / financialData.netProfit < 1.5 ? 'text-success' : 'text-warning'
                }`}>
                  {(financialData.totalDebt / financialData.netProfit).toFixed(1)}:1
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Cash Flow</span>
                <span className={`text-financial font-semibold ${
                  financialData.cashFlow > 0 ? 'text-success' : 'text-destructive'
                }`}>
                  ${financialData.cashFlow.toLocaleString()}
                </span>
              </div>
            </div>
          </Card>

          {/* AI Insights */}
          <AIInsights data={financialData} />

          {/* Quick Actions */}
          <Card className="card-elegant p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-accent" />
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button className="w-full text-left p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-4 h-4 text-accent" />
                  <span className="text-sm">Generate Financial Report</span>
                </div>
              </button>
              <button className="w-full text-left p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
                <div className="flex items-center gap-3">
                  <PieChart className="w-4 h-4 text-accent" />
                  <span className="text-sm">Budget vs Actual Analysis</span>
                </div>
              </button>
              <button className="w-full text-left p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-4 h-4 text-accent" />
                  <span className="text-sm">Update Debt Schedule</span>
                </div>
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;