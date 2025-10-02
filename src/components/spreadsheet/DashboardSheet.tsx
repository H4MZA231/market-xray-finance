import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard, 
  AlertTriangle,
  CheckCircle,
  Target,
  BarChart3
} from "lucide-react";

export const DashboardSheet = () => {
  // Empty data - will be calculated from other sheets in real implementation
  const dashboardData = {
    revenue: {
      total: 0,
      growth: 0,
      target: 0
    },
    expenses: {
      total: 0,
      growth: 0,
      budget: 0
    },
    netProfit: {
      amount: 0,
      margin: 0,
      growth: 0
    },
    debt: {
      total: 0,
      monthlyPayments: 0,
      avgInterestRate: 0
    },
    cashFlow: {
      current: 0,
      projected: 0,
      runway: 0
    },
    kpis: {
      onTarget: 0,
      atRisk: 0,
      critical: 0,
      score: 0
    }
  };

  // Calculate financial health score
  const healthScore = Math.min(100, Math.max(0,
    (dashboardData.netProfit.margin * 0.3) +
    (dashboardData.revenue.growth * 2) +
    (dashboardData.cashFlow.runway > 12 ? 20 : dashboardData.cashFlow.runway * 1.5) +
    (dashboardData.kpis.score * 0.2)
  ));

  const getHealthColor = (score: number) => {
    if (score >= 80) return { bg: "bg-success/10", border: "border-success/20", text: "text-success", label: "Excellent" };
    if (score >= 60) return { bg: "bg-warning/10", border: "border-warning/20", text: "text-warning", label: "Good" };
    if (score >= 40) return { bg: "bg-destructive/10", border: "border-destructive/20", text: "text-destructive", label: "Needs Attention" };
    return { bg: "bg-destructive/20", border: "border-destructive", text: "text-destructive", label: "Critical" };
  };

  const healthStyle = getHealthColor(healthScore);

  return (
    <div className="space-y-6">
      {/* Executive Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Revenue Card */}
        <Card className="card-elegant p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-success/10 rounded-lg">
              <DollarSign className="w-5 h-5 text-success" />
            </div>
            <div className="flex items-center gap-1 text-sm text-success">
              <TrendingUp className="w-4 h-4" />
              +{dashboardData.revenue.growth}%
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Revenue</h3>
            <div className="text-2xl font-bold text-financial text-success">
              ${dashboardData.revenue.total.toLocaleString()}
            </div>
            <div className="mt-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Target Progress</span>
                <span className="text-financial">
                  {((dashboardData.revenue.total / dashboardData.revenue.target) * 100).toFixed(0)}%
                </span>
              </div>
              <Progress value={(dashboardData.revenue.total / dashboardData.revenue.target) * 100} className="h-2" />
            </div>
          </div>
        </Card>

        {/* Net Profit Card */}
        <Card className="card-elegant p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-success/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <div className="flex items-center gap-1 text-sm text-success">
              <TrendingUp className="w-4 h-4" />
              +{dashboardData.netProfit.growth}%
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Net Profit</h3>
            <div className="text-2xl font-bold text-financial text-success">
              ${dashboardData.netProfit.amount.toLocaleString()}
            </div>
            <div className="mt-2">
              <div className="text-xs text-muted-foreground">
                Profit Margin: <span className="text-financial font-semibold">{dashboardData.netProfit.margin}%</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Expenses Card */}
        <Card className="card-elegant p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-destructive/10 rounded-lg">
              <CreditCard className="w-5 h-5 text-destructive" />
            </div>
            <div className="flex items-center gap-1 text-sm text-destructive">
              <TrendingUp className="w-4 h-4" />
              +{dashboardData.expenses.growth}%
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Expenses</h3>
            <div className="text-2xl font-bold text-financial text-destructive">
              ${dashboardData.expenses.total.toLocaleString()}
            </div>
            <div className="mt-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Budget Used</span>
                <span className="text-financial">
                  {((dashboardData.expenses.total / dashboardData.expenses.budget) * 100).toFixed(0)}%
                </span>
              </div>
              <Progress value={(dashboardData.expenses.total / dashboardData.expenses.budget) * 100} className="h-2" />
            </div>
          </div>
        </Card>

        {/* Financial Health Card */}
        <Card className={`card-elegant p-6 ${healthStyle.bg} ${healthStyle.border} border`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-2 ${healthStyle.bg} rounded-lg`}>
              <BarChart3 className={`w-5 h-5 ${healthStyle.text}`} />
            </div>
            <Badge variant="outline" className={healthStyle.text}>
              {healthStyle.label}
            </Badge>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Health Score</h3>
            <div className={`text-2xl font-bold text-financial ${healthStyle.text}`}>
              {Math.round(healthScore)}%
            </div>
            <div className="mt-2">
              <Progress value={healthScore} className="h-2" />
            </div>
          </div>
        </Card>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cash Flow Status */}
        <Card className="card-elegant p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-accent" />
            Cash Flow & Runway
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Current Cash</span>
              <span className="text-financial font-semibold text-accent">
                ${dashboardData.cashFlow.current.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Projected (Next Month)</span>
              <span className="text-financial font-semibold text-success">
                ${dashboardData.cashFlow.projected.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Cash Runway</span>
              <span className={`text-financial font-semibold ${
                dashboardData.cashFlow.runway > 12 ? 'text-success' : 
                dashboardData.cashFlow.runway > 6 ? 'text-warning' : 'text-destructive'
              }`}>
                {dashboardData.cashFlow.runway} months
              </span>
            </div>
            <div className="pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Runway Status</span>
                <div className="flex items-center gap-1">
                  {dashboardData.cashFlow.runway > 12 ? 
                    <CheckCircle className="w-4 h-4 text-success" /> :
                    <AlertTriangle className="w-4 h-4 text-warning" />
                  }
                  <span className={`text-xs ${
                    dashboardData.cashFlow.runway > 12 ? 'text-success' : 'text-warning'
                  }`}>
                    {dashboardData.cashFlow.runway > 12 ? 'Healthy' : 'Monitor'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Debt Overview */}
        <Card className="card-elegant p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-destructive" />
            Debt Summary
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Outstanding</span>
              <span className="text-financial font-semibold text-destructive">
                ${dashboardData.debt.total.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Monthly Payments</span>
              <span className="text-financial font-semibold">
                ${dashboardData.debt.monthlyPayments.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Avg Interest Rate</span>
              <span className="text-financial font-semibold">
                {dashboardData.debt.avgInterestRate}%
              </span>
            </div>
            <div className="pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Debt-to-Revenue</span>
                <span className={`text-financial font-semibold ${
                  (dashboardData.debt.total / dashboardData.revenue.total) < 2 ? 'text-success' : 'text-warning'
                }`}>
                  {(dashboardData.debt.total / dashboardData.revenue.total).toFixed(1)}:1
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* KPIs Overview */}
        <Card className="card-elegant p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-accent" />
            KPI Performance
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">On Target</span>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                <span className="text-financial font-semibold text-success">
                  {dashboardData.kpis.onTarget}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">At Risk</span>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-warning" />
                <span className="text-financial font-semibold text-warning">
                  {dashboardData.kpis.atRisk}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Critical</span>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                <span className="text-financial font-semibold text-destructive">
                  {dashboardData.kpis.critical}
                </span>
              </div>
            </div>
            <div className="pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Overall Score</span>
                <span className={`text-financial font-semibold ${
                  dashboardData.kpis.score >= 80 ? 'text-success' :
                  dashboardData.kpis.score >= 60 ? 'text-warning' : 'text-destructive'
                }`}>
                  {dashboardData.kpis.score}%
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Financial Ratios & Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="card-elegant p-6">
          <h3 className="font-semibold mb-4">Key Financial Ratios</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
              <span className="text-sm">Revenue Growth Rate</span>
              <span className="text-financial font-semibold text-success">
                +{dashboardData.revenue.growth}%
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
              <span className="text-sm">Profit Margin</span>
              <span className="text-financial font-semibold text-success">
                {dashboardData.netProfit.margin}%
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
              <span className="text-sm">Expense Ratio</span>
              <span className="text-financial font-semibold">
                {((dashboardData.expenses.total / dashboardData.revenue.total) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
              <span className="text-sm">Debt Service Coverage</span>
              <span className={`text-financial font-semibold ${
                (dashboardData.netProfit.amount / (dashboardData.debt.monthlyPayments * 12)) > 1.5 ? 'text-success' : 'text-warning'
              }`}>
                {(dashboardData.netProfit.amount / (dashboardData.debt.monthlyPayments * 12)).toFixed(1)}x
              </span>
            </div>
          </div>
        </Card>

        <Card className="card-elegant p-6">
          <h3 className="font-semibold mb-4">Business Health Indicators</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Revenue Growth</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success" />
                <span className="text-xs text-success">Strong</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Profitability</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success" />
                <span className="text-xs text-success">Excellent</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Cash Position</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success" />
                <span className="text-xs text-success">Healthy</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Debt Management</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-warning" />
                <span className="text-xs text-warning">Moderate</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Operational Efficiency</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success" />
                <span className="text-xs text-success">Good</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="card-elegant p-6">
        <h3 className="font-semibold mb-4">Recommended Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-success/10 border border-success/20">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-5 h-5 text-success" />
              <span className="font-medium text-success">Revenue Optimization</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Strong profit margins allow for strategic reinvestment in growth initiatives.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              <span className="font-medium text-warning">Debt Refinancing</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Consider refinancing high-interest debt to reduce monthly obligations.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-5 h-5 text-accent" />
              <span className="font-medium text-accent">KPI Monitoring</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Focus on improving Customer Acquisition Cost and operational KPIs.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};