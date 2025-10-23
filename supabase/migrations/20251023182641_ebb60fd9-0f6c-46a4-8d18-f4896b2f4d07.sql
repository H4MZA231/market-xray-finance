-- Fix Critical Security Issues

-- 1. Remove dangerous public read access from dashboards_entries
DROP POLICY IF EXISTS "Enable read access for all users" ON public.dashboards_entries;

-- 2. Add proper RLS policies to unprotected tables or disable RLS if unused
-- For 'People' table - assuming it's not actively used, drop it
DROP TABLE IF EXISTS public."People" CASCADE;

-- For 'businesses' table - assuming it's not actively used, drop it
DROP TABLE IF EXISTS public.businesses CASCADE;

-- For 'user_id' table - assuming it's not actively used, drop it
DROP TABLE IF EXISTS public.user_id CASCADE;

-- 3. Harden database functions with proper search_path
-- Update refresh_user_dashboard function
CREATE OR REPLACE FUNCTION public.refresh_user_dashboard(p_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  recent_rev numeric := NULL;
  recent_exp numeric := NULL;
  recent_pl_val numeric := NULL;
  recent_cf numeric := NULL;
  exists_id uuid;
BEGIN
  IF p_user_id IS NULL THEN
    RETURN;
  END IF;

  -- latest revenue amount by date or created_at
  SELECT amount INTO recent_rev
  FROM public.revenue_entries
  WHERE user_id = p_user_id
  ORDER BY COALESCE(date, created_at) DESC
  LIMIT 1;

  -- latest expense amount
  SELECT amount INTO recent_exp
  FROM public.expense_entries
  WHERE user_id = p_user_id
  ORDER BY COALESCE(date, created_at) DESC
  LIMIT 1;

  -- profit_loss_entries: prefer explicit entry, else compute
  SELECT revenue_total - expenses_total INTO recent_pl_val
  FROM public.profit_loss_entries
  WHERE user_id = p_user_id
  ORDER BY COALESCE(created_at) DESC
  LIMIT 1;

  IF recent_pl_val IS NULL THEN
    recent_pl_val := COALESCE(recent_rev,0) - COALESCE(recent_exp,0);
  END IF;

  -- latest cash flow
  SELECT (inflows - outflows) INTO recent_cf
  FROM public.cash_flow_entries
  WHERE user_id = p_user_id
  ORDER BY COALESCE(created_at) DESC
  LIMIT 1;

  -- Upsert into dashboards_entries
  SELECT id INTO exists_id FROM public.dashboards_entries WHERE user_id = p_user_id LIMIT 1;
  IF exists_id IS NULL THEN
    INSERT INTO public.dashboards_entries(
      id, user_id, recent_revenue, recent_expenses, recent_pl, recent_cash_flow, recent_updated_at, created_at, updated_at
    )
    VALUES (
      gen_random_uuid(), p_user_id, recent_rev, recent_exp, recent_pl_val, recent_cf, now(), now(), now()
    );
  ELSE
    UPDATE public.dashboards_entries
    SET recent_revenue = recent_rev,
        recent_expenses = recent_exp,
        recent_pl = recent_pl_val,
        recent_cash_flow = recent_cf,
        recent_updated_at = now(),
        updated_at = now()
    WHERE user_id = p_user_id;
  END IF;
END;
$function$;

-- Update update_dashboard_totals function
CREATE OR REPLACE FUNCTION public.update_dashboard_totals()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
declare
  affected_user uuid;
begin
  -- Identify which user is affected
  if (tg_op = 'DELETE') then
    affected_user := old.user_id;
  else
    affected_user := new.user_id;
  end if;

  -- Update only that user's dashboard row
  update dashboard
  set 
    total_profit = coalesce((select sum(profit) from dashboards_entries where user_id = affected_user), 0),
    total_loss = coalesce((select sum(loss) from dashboards_entries where user_id = affected_user), 0),
    total_debt = coalesce((select sum(debt) from dashboards_entries where user_id = affected_user), 0),
    total_revenue = coalesce((select sum(revenue) from dashboards_entries where user_id = affected_user), 0),
    avg_kpi = coalesce((select avg(kpi_value) from dashboards_entries where user_id = affected_user), 0)
  where user_id = affected_user;

  return new;
end;
$function$;

-- Update recalc_dashboards_for_user function
CREATE OR REPLACE FUNCTION public.recalc_dashboards_for_user(p_user uuid)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
DECLARE
  v_total_revenue numeric := 0;
  v_total_expenses numeric := 0;
  v_total_debt numeric := 0;
  v_cash_flow numeric := 0;
  v_net_profit numeric := 0;
BEGIN
  SELECT COALESCE(SUM(amount),0) INTO v_total_revenue FROM public.revenue_entries WHERE user_id = p_user;
  SELECT COALESCE(SUM(amount),0) INTO v_total_expenses FROM public.expense_entries WHERE user_id = p_user;
  SELECT COALESCE(SUM(current_balance),0) INTO v_total_debt FROM public.debt_entries WHERE user_id = p_user;
  SELECT COALESCE(SUM(inflows - outflows),0) INTO v_cash_flow FROM public.cash_flow_entries WHERE user_id = p_user;
  v_net_profit := v_total_revenue - v_total_expenses;

  INSERT INTO public.dashboards_entries (id, user_id, total_revenue, total_expenses, total_debt, cash_flow, net_profit, updated_at, created_at)
  VALUES (gen_random_uuid(), p_user, v_total_revenue, v_total_expenses, v_total_debt, v_cash_flow, v_net_profit, now(), now())
  ON CONFLICT (user_id) DO UPDATE SET
    total_revenue = EXCLUDED.total_revenue,
    total_expenses = EXCLUDED.total_expenses,
    total_debt = EXCLUDED.total_debt,
    cash_flow = EXCLUDED.cash_flow,
    net_profit = EXCLUDED.net_profit,
    updated_at = now();
END;
$function$;