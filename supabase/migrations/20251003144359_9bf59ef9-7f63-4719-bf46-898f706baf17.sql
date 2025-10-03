-- Enable real-time for all financial tables

-- Set replica identity to FULL for all tables
ALTER TABLE public.revenue_entries REPLICA IDENTITY FULL;
ALTER TABLE public.expense_entries REPLICA IDENTITY FULL;
ALTER TABLE public.debt_entries REPLICA IDENTITY FULL;
ALTER TABLE public.cash_flow_entries REPLICA IDENTITY FULL;
ALTER TABLE public.profit_loss_entries REPLICA IDENTITY FULL;
ALTER TABLE public.kpi_entries REPLICA IDENTITY FULL;

-- Add all tables to the supabase_realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.revenue_entries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.expense_entries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.debt_entries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cash_flow_entries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profit_loss_entries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.kpi_entries;