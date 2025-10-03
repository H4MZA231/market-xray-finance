-- Create dashboards table to store aggregated financial data
CREATE TABLE public.dashboards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  total_revenue NUMERIC NOT NULL DEFAULT 0,
  total_expenses NUMERIC NOT NULL DEFAULT 0,
  total_debt NUMERIC NOT NULL DEFAULT 0,
  monthly_debt_payments NUMERIC NOT NULL DEFAULT 0,
  cash_flow NUMERIC NOT NULL DEFAULT 0,
  net_profit NUMERIC NOT NULL DEFAULT 0,
  profit_margin NUMERIC NOT NULL DEFAULT 0,
  burn_rate NUMERIC NOT NULL DEFAULT 0,
  runway NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.dashboards ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user access
CREATE POLICY "Users can view their own dashboard entries"
ON public.dashboards
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own dashboard entries"
ON public.dashboards
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dashboard entries"
ON public.dashboards
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dashboard entries"
ON public.dashboards
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_dashboards_updated_at
BEFORE UPDATE ON public.dashboards
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster user queries
CREATE INDEX idx_dashboards_user_id ON public.dashboards(user_id);
CREATE INDEX idx_dashboards_created_at ON public.dashboards(user_id, created_at DESC);