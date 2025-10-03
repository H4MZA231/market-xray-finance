import { useEffect, useState } from "react";
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
  Activity,
  PieChart
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface KPIEntry {
  id: string;
  metric_name: string;
  category: string;
  value: number;
  target: number;
}

interface DashboardData {
  totalRevenue: number;
  totalExpenses: number;
  totalDebt: number;
  monthlyDebtPayments: number;
  cashFlow: number;
  netProfit: number;
  profitMargin: number;
  burnRate: number;
  runway: number;
  kpis: KPIEntry[];
}

const Dashboard = () => {
  const { toast } = useToast();
  const [data, setData] = useState<DashboardData>({
    totalRevenue: 0,
    totalExpenses: 0,
    totalDebt: 0,
    monthlyDebtPayments: 0,
    cashFlow: 0,
    netProfit: 0,
    profitMargin: 0,
    burnRate: 0,
    runway: 0,
    kpis: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch all financial data in parallel
      const [revenueRes, expensesRes, debtRes, cashFlowRes, profitLossRes, kpiRes] = await Promise.all([
        supabase.from('revenue_entries').select('amount').eq('user_id', user.id),
        supabase.from('expense_entries').select('amount').eq('user_id', user.id),
        supabase.from('debt_entries').select('current_balance, monthly_payment').eq('user_id', user.id),
        supabase.from('cash_flow_entries').select('inflows, outflows').eq('user_id', user.id),
        supabase.from('profit_loss_entries').select('revenue_total, expenses_total').eq('user_id', user.id),
        supabase.from('kpi_entries').select('*').eq('user_id', user.id)
      ]);

      // Aggregate Total Revenue
      const totalRevenue = revenueRes.data?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
      
      // Aggregate Total Expenses
      const totalExpenses = expensesRes.data?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
      
      // Aggregate Total Debt
      const totalDebt = debtRes.data?.reduce((sum, item) => sum + Number(item.current_balance), 0) || 0;
      
      // Aggregate monthly debt payments
      const monthlyDebtPayments = debtRes.data?.reduce((sum, item) => sum + Number(item.monthly_payment), 0) || 0;
      
      // Aggregate Cash Flow
      const totalInflows = cashFlowRes.data?.reduce((sum, item) => sum + Number(item.inflows), 0) || 0;
      const totalOutflows = cashFlowRes.data?.reduce((sum, item) => sum + Number(item.outflows), 0) || 0;
      const cashFlow = totalInflows - totalOutflows;

      // Calculate Net Profit
      let netProfit: number;
      if (profitLossRes.data && profitLossRes.data.length > 0) {
        const plRevenue = profitLossRes.data.reduce((sum, item) => sum + Number(item.revenue_total), 0);
        const plExpenses = profitLossRes.data.reduce((sum, item) => sum + Number(item.expenses_total), 0);
        netProfit = plRevenue - plExpenses;
      } else {
        netProfit = totalRevenue - totalExpenses;
      }

      // Calculate metrics
      const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
      
      // Burn rate includes expenses and debt payments
      const monthlyBurnRate = (totalExpenses + monthlyDebtPayments) / Math.max(1, 
        Math.max(
          revenueRes.data?.length || 1,
          expensesRes.data?.length || 1
        )
      );
      
      // Runway calculation
      const runway = monthlyBurnRate > 0 ? Math.max(0, cashFlow / monthlyBurnRate) : 0;

      setData({
        totalRevenue,
        totalExpenses,
        totalDebt,
        monthlyDebtPayments,
        cashFlow,
        netProfit,
        profitMargin,
        burnRate: monthlyBurnRate,
        runway,
        kpis: kpiRes.data || [],
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

    // Set up real-time subscriptions for all tables
    const revenueChannel = supabase
      .channel('revenue-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'revenue_entries' }, fetchDashboardData)
      .subscribe();

    const expensesChannel = supabase
      .channel('expenses-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expense_entries' }, fetchDashboardData)
      .subscribe();

    const debtChannel = supabase
      .channel('debt-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'debt_entries' }, fetchDashboardData)
      .subscribe();

    const cashFlowChannel = supabase
      .channel('cashflow-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cash_flow_entries' }, fetchDashboardData)
      .subscribe();

    const profitLossChannel = supabase
      .channel('profitloss-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profit_loss_entries' }, fetchDashboardData)
      .subscribe();

    const kpiChannel = supabase
      .channel('kpi-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'kpi_entries' }, fetchDashboardData)
      .subscribe();

    return () => {
      supabase.removeChannel(revenueChannel);
      supabase.removeChannel(expensesChannel);
      supabase.removeChannel(debtChannel);
      supabase.removeChannel(cashFlowChannel);
      supabase.removeChannel(profitLossChannel);
      supabase.removeChannel(kpiChannel);
    };
  }, []);

  const healthScore = data.totalRevenue > 0 
    ? Math.max(0, Math.min(100, 
        (data.netProfit / data.totalRevenue) * 100 + 
        (data.cashFlow > 0 ? 20 : -20) +
        (data.totalDebt < data.netProfit * 2 ? 10 : -30)
      ))
    : 50;

  const getHealthColor = (score: number) => {
    if (score >= 70) return "status-positive";
    if (score >= 40) return "status-warning"; 
    return "status-negative";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Financial Dashboard</h1>
          <p className="text-muted-foreground mt-2">Real-time financial overview and metrics</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge className={`text-lg px-4 py-2 ${getHealthColor(healthScore)}`}>
            Health Score: {Math.round(healthScore)}%
          </Badge>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-elegant p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-success/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-success" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground">Total Revenue</h3>
            </div>
          </div>
          <div className="text-3xl font-bold text-financial text-success">
            ${data.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </Card>

        <Card className="card-elegant p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-destructive/10 rounded-lg">
              <TrendingDown className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground">Total Expenses</h3>
            </div>
          </div>
          <div className="text-3xl font-bold text-financial text-destructive">
            ${data.totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </Card>

        <Card className="card-elegant p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-accent/10 rounded-lg">
              <DollarSign className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground">Net Profit</h3>
            </div>
          </div>
          <div className={`text-3xl font-bold text-financial ${data.netProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
            ${data.netProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">Profit Margin</span>
              <span className="text-financial">{data.profitMargin.toFixed(1)}%</span>
            </div>
            <Progress value={Math.max(0, Math.min(100, data.profitMargin))} className="h-2" />
          </div>
        </Card>

        <Card className="card-elegant p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-warning/10 rounded-lg">
              <CreditCard className="w-6 h-6 text-warning" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground">Total Debt</h3>
            </div>
          </div>
          <div className={`text-3xl font-bold text-financial ${data.totalDebt === 0 ? 'text-success' : 'text-warning'}`}>
            ${data.totalDebt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Cash Flow & Critical Metrics */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cash Flow Card */}
          <Card className="card-elegant p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-accent" />
              Cash Flow Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Current Cash Flow</p>
                <div className={`text-2xl font-bold text-financial ${data.cashFlow >= 0 ? 'text-success' : 'text-destructive'}`}>
                  ${data.cashFlow.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Monthly Burn Rate</p>
                <div className="text-2xl font-bold text-financial text-destructive">
                  ${data.burnRate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </Card>

          {/* Critical Metrics */}
          <Card className="card-elegant p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Critical Business Metrics
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                <span className="text-sm text-muted-foreground">Cash Runway</span>
                <span className={`text-financial font-semibold ${
                  data.runway > 12 ? 'text-success' : 
                  data.runway > 6 ? 'text-warning' : 'text-destructive'
                }`}>
                  {Math.round(data.runway)} months
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                <span className="text-sm text-muted-foreground">Monthly Debt Payments</span>
                <span className="text-financial font-semibold text-warning">
                  ${data.monthlyDebtPayments.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                <span className="text-sm text-muted-foreground">Profit Margin</span>
                <span className={`text-financial font-semibold ${
                  data.profitMargin > 20 ? 'text-success' : 
                  data.profitMargin > 10 ? 'text-warning' : 'text-destructive'
                }`}>
                  {data.profitMargin.toFixed(1)}%
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - KPIs */}
        <div className="space-y-6">
          <Card className="card-elegant p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-accent" />
              Key Performance Indicators
            </h3>
            {data.kpis.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No KPIs configured yet. Add KPIs to track your business metrics.
              </p>
            ) : (
              <div className="space-y-4">
                {data.kpis.map((kpi) => {
                  const progress = kpi.target > 0 ? (kpi.value / kpi.target) * 100 : 0;
                  const isOnTrack = progress >= 80;
                  return (
                    <div key={kpi.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold">{kpi.metric_name}</p>
                          <p className="text-xs text-muted-foreground">{kpi.category}</p>
                        </div>
                        <Badge className={isOnTrack ? 'status-positive' : 'status-warning'}>
                          {progress.toFixed(0)}%
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Current: {kpi.value.toLocaleString()}</span>
                          <span>Target: {kpi.target.toLocaleString()}</span>
                        </div>
                        <Progress value={Math.min(100, progress)} className="h-2" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Quick Stats */}
          <Card className="card-elegant p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-accent" />
              Quick Stats
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Revenue to Expense Ratio</span>
                <span className="text-financial font-semibold">
                  {data.totalExpenses > 0 ? (data.totalRevenue / data.totalExpenses).toFixed(2) : '0.00'}x
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Debt to Profit Ratio</span>
                <span className="text-financial font-semibold">
                  {data.netProfit > 0 ? (data.totalDebt / data.netProfit).toFixed(2) : 'N/A'}x
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Active KPIs</span>
                <span className="text-financial font-semibold">{data.kpis.length}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
