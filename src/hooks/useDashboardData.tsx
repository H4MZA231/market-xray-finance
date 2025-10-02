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
      // Fetch all financial data in parallel
      const [revenueRes, expensesRes, debtRes, cashFlowRes] = await Promise.all([
        supabase.from('revenue_entries').select('amount').eq('user_id', user.id),
        supabase.from('expense_entries').select('amount').eq('user_id', user.id),
        supabase.from('debt_entries').select('current_balance').eq('user_id', user.id),
        supabase.from('cash_flow_entries').select('inflows, outflows').eq('user_id', user.id)
      ]);

      const totalRevenue = revenueRes.data?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
      const totalExpenses = expensesRes.data?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
      const totalDebt = debtRes.data?.reduce((sum, item) => sum + Number(item.current_balance), 0) || 0;
      
      const totalInflows = cashFlowRes.data?.reduce((sum, item) => sum + Number(item.inflows), 0) || 0;
      const totalOutflows = cashFlowRes.data?.reduce((sum, item) => sum + Number(item.outflows), 0) || 0;
      const cashFlow = totalInflows - totalOutflows;

      const netProfit = totalRevenue - totalExpenses;
      const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
      const burnRate = totalExpenses / 12; // Monthly average
      const runway = burnRate > 0 ? cashFlow / burnRate : 0;

      setData({
        totalRevenue,
        totalExpenses,
        netProfit,
        totalDebt,
        cashFlow,
        burnRate,
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
