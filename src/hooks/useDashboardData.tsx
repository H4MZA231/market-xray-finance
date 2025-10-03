import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface DashboardData {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  totalDebt: number;
  cashFlow: number;
  burnRate: number;
  runway: number;
  profitMargin: number;
}

export const useDashboardData = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData>({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    totalDebt: 0,
    cashFlow: 0,
    burnRate: 0,
    runway: 0,
    profitMargin: 0
  });

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      // Fetch all financial data in parallel from live tables
      const [revenueRes, expensesRes, debtRes, cashFlowRes, profitLossRes] = await Promise.all([
        supabase.from('revenue_entries').select('amount').eq('user_id', user.id),
        supabase.from('expense_entries').select('amount').eq('user_id', user.id),
        supabase.from('debt_entries').select('current_balance, monthly_payment').eq('user_id', user.id),
        supabase.from('cash_flow_entries').select('inflows, outflows').eq('user_id', user.id),
        supabase.from('profit_loss_entries').select('revenue_total, expenses_total').eq('user_id', user.id)
      ]);

      // Aggregate Total Revenue from revenue_entries
      const totalRevenue = revenueRes.data?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
      
      // Aggregate Total Expenses from expense_entries
      const totalExpenses = expensesRes.data?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
      
      // Aggregate Total Debt from debt_entries (current_balance)
      const totalDebt = debtRes.data?.reduce((sum, item) => sum + Number(item.current_balance), 0) || 0;
      
      // Aggregate monthly debt payments
      const monthlyDebtPayments = debtRes.data?.reduce((sum, item) => sum + Number(item.monthly_payment), 0) || 0;
      
      // Aggregate Cash Flow from cash_flow_entries
      const totalInflows = cashFlowRes.data?.reduce((sum, item) => sum + Number(item.inflows), 0) || 0;
      const totalOutflows = cashFlowRes.data?.reduce((sum, item) => sum + Number(item.outflows), 0) || 0;
      const cashFlow = totalInflows - totalOutflows;

      // Calculate Net Profit from profit_loss_entries if available, otherwise from direct calculation
      let netProfit: number;
      if (profitLossRes.data && profitLossRes.data.length > 0) {
        const plRevenue = profitLossRes.data.reduce((sum, item) => sum + Number(item.revenue_total), 0);
        const plExpenses = profitLossRes.data.reduce((sum, item) => sum + Number(item.expenses_total), 0);
        netProfit = plRevenue - plExpenses;
      } else {
        // Fallback to direct calculation
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
      
      // Runway calculation: how many months can operate with current cash flow
      const runway = monthlyBurnRate > 0 ? Math.max(0, cashFlow / monthlyBurnRate) : 0;

      setData({
        totalRevenue,
        totalExpenses,
        netProfit,
        totalDebt,
        cashFlow,
        burnRate: monthlyBurnRate,
        runway,
        profitMargin
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  useEffect(() => {
    if (!user) return;

    // Initial fetch
    fetchDashboardData();

    // Subscribe to all relevant tables for real-time updates
    const channel = supabase
      .channel('dashboard-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'revenue_entries', filter: `user_id=eq.${user.id}` }, fetchDashboardData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expense_entries', filter: `user_id=eq.${user.id}` }, fetchDashboardData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'debt_entries', filter: `user_id=eq.${user.id}` }, fetchDashboardData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cash_flow_entries', filter: `user_id=eq.${user.id}` }, fetchDashboardData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profit_loss_entries', filter: `user_id=eq.${user.id}` }, fetchDashboardData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'kpi_entries', filter: `user_id=eq.${user.id}` }, fetchDashboardData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return data;
};
