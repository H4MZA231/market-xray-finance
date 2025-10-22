import { useEffect, useState } from "react";
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
  BarChart3,
  Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export const DashboardSheet = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    revenue: {
      total: 0,
      growth: 0,
      target: 100000
    },
    expenses: {
      total: 0,
      growth: 0,
      budget: 80000
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
  });

  const fetchDashboardData = async () => {
    try {
      if (!user) return;

      // Fetch all financial data in parallel
      const [revenueRes, expensesRes, debtRes, cashFlowRes, kpiRes] = await Promise.all([
        supabase.from('revenue_entries').select('amount').eq('user_id', user.id),
        supabase.from('expense_entries').select('amount').eq('user_id', user.id),
        supabase.from('debt_entries').select('current_balance, monthly_payment, interest_rate').eq('user_id', user.id),
        supabase.from('cash_flow_entries').select('inflows, outflows').eq('user_id', user.id),
        supabase.from('kpi_entries').select('value, target').eq('user_id', user.id)
      ]);

      // Calculate totals
      const totalRevenue = (revenueRes.data || []).reduce((sum, item) => sum + Number(item.amount), 0);
      const totalExpenses = (expensesRes.data || []).reduce((sum, item) => sum + Number(item.amount), 0);
      const totalDebt = (debtRes.data || []).reduce((sum, item) => sum + Number(item.current_balance), 0);
      const monthlyPayments = (debtRes.data || []).reduce((sum, item) => sum + Number(item.monthly_payment), 0);
      
      const avgInterestRate = debtRes.data && debtRes.data.length > 0
        ? (debtRes.data.reduce((sum, item) => sum + Number(item.interest_rate), 0) / debtRes.data.length)
        : 0;

      const totalInflows = (cashFlowRes.data || []).reduce((sum, item) => sum + Number(item.inflows), 0);
      const totalOutflows = (cashFlowRes.data || []).reduce((sum, item) => sum + Number(item.outflows), 0);
      const currentCashFlow = totalInflows - totalOutflows;

      const netProfit = totalRevenue - totalExpenses;
      const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
      
      const monthlyBurnRate = totalExpenses + monthlyPayments;
      const runway = monthlyBurnRate > 0 ? Math.max(0, currentCashFlow / monthlyBurnRate) : 0;

      // Calculate KPI stats
      const kpis = kpiRes.data || [];
      const onTarget = kpis.filter(k => Number(k.value) >= Number(k.target)).length;
      const atRisk = kpis.filter(k => {
        const progress = (Number(k.value) / Number(k.target)) * 100;
        return progress >= 50 && progress < 100;
      }).length;
      const critical = kpis.filter(k => (Number(k.value) / Number(k.target)) * 100 < 50).length;
      const kpiScore = kpis.length > 0 
        ? (kpis.reduce((sum, k) => sum + (Number(k.value) / Number(k.target)) * 100, 0) / kpis.length)
        : 0;

      setDashboardData({
        revenue: {
          total: totalRevenue,
          growth: 15, // Placeholder - would need historical data
          target: 100000
        },
        expenses: {
          total: totalExpenses,
          growth: 8, // Placeholder - would need historical data
          budget: 80000
        },
        netProfit: {
          amount: netProfit,
          margin: profitMargin,
          growth: 12 // Placeholder - would need historical data
        },
        debt: {
          total: totalDebt,
          monthlyPayments: monthlyPayments,
          avgInterestRate: avgInterestRate
        },
        cashFlow: {
          current: currentCashFlow,
          projected: currentCashFlow * 1.1, // Simple projection
          runway: runway
        },
        kpis: {
          onTarget: onTarget,
          atRisk: atRisk,
          critical: critical,
          score: kpiScore
        }
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Set up real-time subscriptions
    const channel = supabase
      .channel('dashboard-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'revenue_entries' }, fetchDashboardData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expense_entries' }, fetchDashboardData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'debt_entries' }, fetchDashboardData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cash_flow_entries' }, fetchDashboardData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'kpi_entries' }, fetchDashboardData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profit_loss_entries' }, fetchDashboardData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Calculate financial health score - reset to 0 if no data
  const hasData = dashboardData.revenue.total > 0 || dashboardData.expenses.total > 0;
  const healthScore = hasData ? Math.min(100, Math.max(0,
    (dashboardData.netProfit.margin * 0.3) +
    (dashboardData.revenue.growth * 2) +
    (dashboardData.cashFlow.runway > 12 ? 20 : dashboardData.cashFlow.runway * 1.5) +
    (dashboardData.kpis.score * 0.2)
  )) : 0;

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
                Profit Margin: <span className="text-financial font-semibold">{Math.round(dashboardData.netProfit.margin)}%</span>
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
                ${Math.round(dashboardData.cashFlow.current).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Projected (Next Month)</span>
              <span className="text-financial font-semibold text-success">
                ${Math.round(dashboardData.cashFlow.projected).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Cash Runway</span>
              <span className={`text-financial font-semibold ${
                dashboardData.cashFlow.runway > 12 ? 'text-success' : 
                dashboardData.cashFlow.runway > 6 ? 'text-warning' : 'text-destructive'
              }`}>
                {Math.round(dashboardData.cashFlow.runway)} months
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
                ${Math.round(dashboardData.debt.total).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Monthly Payments</span>
              <span className="text-financial font-semibold">
                ${Math.round(dashboardData.debt.monthlyPayments).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Avg Interest Rate</span>
              <span className="text-financial font-semibold">
                {Math.round(dashboardData.debt.avgInterestRate)}%
              </span>
            </div>
            <div className="pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Debt-to-Revenue</span>
                <span className={`text-financial font-semibold ${
                  (dashboardData.debt.total / dashboardData.revenue.total) < 2 ? 'text-success' : 'text-warning'
                }`}>
                  {Math.round(dashboardData.debt.total / dashboardData.revenue.total)}:1
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
                  {Math.round(dashboardData.kpis.score)}%
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
          {!hasData ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">
                Add revenue and expense data to see your financial ratios.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                <span className="text-sm">Revenue Growth Rate</span>
                <span className={`text-financial font-semibold ${
                  dashboardData.revenue.growth >= 10 ? 'text-success' :
                  dashboardData.revenue.growth >= 5 ? 'text-warning' : 'text-destructive'
                }`}>
                  {dashboardData.revenue.growth > 0 ? '+' : ''}{dashboardData.revenue.growth}%
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                <span className="text-sm">Profit Margin</span>
                <span className={`text-financial font-semibold ${
                  dashboardData.netProfit.margin >= 15 ? 'text-success' :
                  dashboardData.netProfit.margin >= 5 ? 'text-warning' : 'text-destructive'
                }`}>
                  {Math.round(dashboardData.netProfit.margin)}%
                </span>
              </div>
              {dashboardData.revenue.total > 0 && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                  <span className="text-sm">Expense Ratio</span>
                  <span className={`text-financial font-semibold ${
                    ((dashboardData.expenses.total / dashboardData.revenue.total) * 100) < 70 ? 'text-success' :
                    ((dashboardData.expenses.total / dashboardData.revenue.total) * 100) < 85 ? 'text-warning' : 'text-destructive'
                  }`}>
                    {Math.round((dashboardData.expenses.total / dashboardData.revenue.total) * 100)}%
                  </span>
                </div>
              )}
              {dashboardData.debt.monthlyPayments > 0 && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                  <span className="text-sm">Debt Service Coverage</span>
                  <span className={`text-financial font-semibold ${
                    (dashboardData.netProfit.amount / (dashboardData.debt.monthlyPayments * 12)) > 1.5 ? 'text-success' : 'text-warning'
                  }`}>
                    {Math.round(dashboardData.netProfit.amount / (dashboardData.debt.monthlyPayments * 12))}x
                  </span>
                </div>
              )}
            </div>
          )}
        </Card>

        <Card className="card-elegant p-6">
          <h3 className="font-semibold mb-4">Business Health Indicators</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Revenue Growth</span>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  !hasData ? 'bg-muted-foreground' :
                  dashboardData.revenue.growth >= 10 ? 'bg-success' :
                  dashboardData.revenue.growth >= 5 ? 'bg-warning' : 'bg-destructive'
                }`} />
                <span className={`text-xs ${
                  !hasData ? 'text-muted-foreground' :
                  dashboardData.revenue.growth >= 10 ? 'text-success' :
                  dashboardData.revenue.growth >= 5 ? 'text-warning' : 'text-destructive'
                }`}>
                  {!hasData ? 'No Data' :
                   dashboardData.revenue.growth >= 10 ? 'Strong' :
                   dashboardData.revenue.growth >= 5 ? 'Moderate' : 'Weak'}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Profitability</span>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  !hasData ? 'bg-muted-foreground' :
                  dashboardData.netProfit.margin >= 20 ? 'bg-success' :
                  dashboardData.netProfit.margin >= 10 ? 'bg-warning' : 'bg-destructive'
                }`} />
                <span className={`text-xs ${
                  !hasData ? 'text-muted-foreground' :
                  dashboardData.netProfit.margin >= 20 ? 'text-success' :
                  dashboardData.netProfit.margin >= 10 ? 'text-warning' : 'text-destructive'
                }`}>
                  {!hasData ? 'No Data' :
                   dashboardData.netProfit.margin >= 20 ? 'Excellent' :
                   dashboardData.netProfit.margin >= 10 ? 'Good' : 'Poor'}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Cash Position</span>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  !hasData ? 'bg-muted-foreground' :
                  dashboardData.cashFlow.runway > 12 ? 'bg-success' :
                  dashboardData.cashFlow.runway > 6 ? 'bg-warning' : 'bg-destructive'
                }`} />
                <span className={`text-xs ${
                  !hasData ? 'text-muted-foreground' :
                  dashboardData.cashFlow.runway > 12 ? 'text-success' :
                  dashboardData.cashFlow.runway > 6 ? 'text-warning' : 'text-destructive'
                }`}>
                  {!hasData ? 'No Data' :
                   dashboardData.cashFlow.runway > 12 ? 'Healthy' :
                   dashboardData.cashFlow.runway > 6 ? 'Adequate' : 'Critical'}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Debt Management</span>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  !hasData || dashboardData.debt.total === 0 ? 'bg-muted-foreground' :
                  (dashboardData.debt.total / dashboardData.revenue.total) < 1 ? 'bg-success' :
                  (dashboardData.debt.total / dashboardData.revenue.total) < 2 ? 'bg-warning' : 'bg-destructive'
                }`} />
                <span className={`text-xs ${
                  !hasData || dashboardData.debt.total === 0 ? 'text-muted-foreground' :
                  (dashboardData.debt.total / dashboardData.revenue.total) < 1 ? 'text-success' :
                  (dashboardData.debt.total / dashboardData.revenue.total) < 2 ? 'text-warning' : 'text-destructive'
                }`}>
                  {!hasData || dashboardData.debt.total === 0 ? 'No Data' :
                   (dashboardData.debt.total / dashboardData.revenue.total) < 1 ? 'Excellent' :
                   (dashboardData.debt.total / dashboardData.revenue.total) < 2 ? 'Moderate' : 'High Risk'}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Operational Efficiency</span>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  !hasData ? 'bg-muted-foreground' :
                  dashboardData.kpis.score >= 80 ? 'bg-success' :
                  dashboardData.kpis.score >= 60 ? 'bg-warning' : 'bg-destructive'
                }`} />
                <span className={`text-xs ${
                  !hasData ? 'text-muted-foreground' :
                  dashboardData.kpis.score >= 80 ? 'text-success' :
                  dashboardData.kpis.score >= 60 ? 'text-warning' : 'text-destructive'
                }`}>
                  {!hasData ? 'No Data' :
                   dashboardData.kpis.score >= 80 ? 'Good' :
                   dashboardData.kpis.score >= 60 ? 'Fair' : 'Needs Work'}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="card-elegant p-6">
        <h3 className="font-semibold mb-4">Recommended Actions</h3>
        {!hasData ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">
              Add financial data to receive personalized recommendations for your business.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {dashboardData.netProfit.margin >= 15 && (
              <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span className="font-medium text-success">Revenue Optimization</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Strong profit margins allow for strategic reinvestment in growth initiatives.
                </p>
              </div>
            )}
            
            {dashboardData.netProfit.margin < 10 && dashboardData.revenue.total > 0 && (
              <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                <div className="flex items-center gap-3 mb-2">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                  <span className="font-medium text-warning">Improve Profitability</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Consider reducing expenses or increasing prices to improve profit margins.
                </p>
              </div>
            )}
            
            {dashboardData.debt.avgInterestRate > 7 && dashboardData.debt.total > 0 && (
              <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                <div className="flex items-center gap-3 mb-2">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                  <span className="font-medium text-warning">Debt Refinancing</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  High interest rates detected. Consider refinancing to reduce monthly obligations.
                </p>
              </div>
            )}
            
            {dashboardData.cashFlow.runway < 6 && dashboardData.cashFlow.runway > 0 && (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <div className="flex items-center gap-3 mb-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  <span className="font-medium text-destructive">Cash Flow Alert</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Limited runway detected. Focus on increasing revenue and managing expenses.
                </p>
              </div>
            )}
            
            {dashboardData.kpis.critical > 0 && (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <div className="flex items-center gap-3 mb-2">
                  <Target className="w-5 h-5 text-destructive" />
                  <span className="font-medium text-destructive">KPI Attention Needed</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {dashboardData.kpis.critical} critical KPI{dashboardData.kpis.critical > 1 ? 's' : ''} need immediate attention.
                </p>
              </div>
            )}
            
            {dashboardData.kpis.score >= 80 && (
              <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span className="font-medium text-success">Excellent KPI Performance</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Most KPIs are on target. Continue monitoring and maintaining performance.
                </p>
              </div>
            )}
            
            {dashboardData.revenue.growth < 5 && dashboardData.revenue.total > 0 && (
              <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-5 h-5 text-warning" />
                  <span className="font-medium text-warning">Growth Strategy</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Revenue growth is below target. Consider new marketing or sales strategies.
                </p>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};