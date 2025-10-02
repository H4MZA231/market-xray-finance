-- Create tables for financial data per user

-- Revenue entries table
CREATE TABLE public.revenue_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  client TEXT NOT NULL,
  category TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Expense entries table
CREATE TABLE public.expense_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  vendor TEXT NOT NULL,
  category TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Profit & Loss entries table
CREATE TABLE public.profit_loss_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  revenue_total DECIMAL(12, 2) NOT NULL DEFAULT 0,
  expenses_total DECIMAL(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- KPI entries table
CREATE TABLE public.kpi_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL,
  value DECIMAL(12, 2) NOT NULL,
  target DECIMAL(12, 2) NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Debt entries table
CREATE TABLE public.debt_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  creditor TEXT NOT NULL,
  type TEXT NOT NULL,
  original_amount DECIMAL(12, 2) NOT NULL,
  current_balance DECIMAL(12, 2) NOT NULL,
  interest_rate DECIMAL(5, 2) NOT NULL,
  monthly_payment DECIMAL(12, 2) NOT NULL,
  due_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Cash flow entries table
CREATE TABLE public.cash_flow_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  inflows DECIMAL(12, 2) NOT NULL DEFAULT 0,
  outflows DECIMAL(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.revenue_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profit_loss_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debt_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_flow_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for revenue_entries
CREATE POLICY "Users can view their own revenue entries"
  ON public.revenue_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own revenue entries"
  ON public.revenue_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own revenue entries"
  ON public.revenue_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own revenue entries"
  ON public.revenue_entries FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for expense_entries
CREATE POLICY "Users can view their own expense entries"
  ON public.expense_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own expense entries"
  ON public.expense_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own expense entries"
  ON public.expense_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own expense entries"
  ON public.expense_entries FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for profit_loss_entries
CREATE POLICY "Users can view their own P&L entries"
  ON public.profit_loss_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own P&L entries"
  ON public.profit_loss_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own P&L entries"
  ON public.profit_loss_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own P&L entries"
  ON public.profit_loss_entries FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for kpi_entries
CREATE POLICY "Users can view their own KPI entries"
  ON public.kpi_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own KPI entries"
  ON public.kpi_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own KPI entries"
  ON public.kpi_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own KPI entries"
  ON public.kpi_entries FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for debt_entries
CREATE POLICY "Users can view their own debt entries"
  ON public.debt_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own debt entries"
  ON public.debt_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own debt entries"
  ON public.debt_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own debt entries"
  ON public.debt_entries FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for cash_flow_entries
CREATE POLICY "Users can view their own cash flow entries"
  ON public.cash_flow_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cash flow entries"
  ON public.cash_flow_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cash flow entries"
  ON public.cash_flow_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cash flow entries"
  ON public.cash_flow_entries FOR DELETE
  USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_revenue_entries_updated_at
  BEFORE UPDATE ON public.revenue_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_expense_entries_updated_at
  BEFORE UPDATE ON public.expense_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profit_loss_entries_updated_at
  BEFORE UPDATE ON public.profit_loss_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_kpi_entries_updated_at
  BEFORE UPDATE ON public.kpi_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_debt_entries_updated_at
  BEFORE UPDATE ON public.debt_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cash_flow_entries_updated_at
  BEFORE UPDATE ON public.cash_flow_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();