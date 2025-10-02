import { useState, useEffect } from "react";
import { EditableTable, TableColumn, TableRow } from "./EditableTable";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export const ProfitLossSheet = () => {
  const [plData, setPLData] = useState<TableRow[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    fetchPLData();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('pl-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profit_loss_entries', filter: `user_id=eq.${user.id}` }, fetchPLData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchPLData = async () => {
    const { data, error } = await supabase
      .from('profit_loss_entries')
      .select('*')
      .eq('user_id', user?.id)
      .order('month', { ascending: false });

    if (error) {
      toast({
        title: "Error loading P&L data",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setPLData(data.map(entry => ({
        id: entry.id,
        month: entry.month,
        revenueTotal: entry.revenue_total,
        expensesTotal: entry.expenses_total,
        netProfit: 0,
        profitMargin: 0
      })));
    }
  };

  const handleDataChange = async (newData: TableRow[]) => {
    const prevData = plData;
    setPLData(newData);

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to save data",
        variant: "destructive",
      });
      return;
    }

    const addedRows = newData.filter(r => !prevData.some(p => p.id === r.id));
    const removedRows = prevData.filter(p => !newData.some(r => r.id === p.id));
    const updatedRows = newData.filter(r => {
      const prev = prevData.find(p => p.id === r.id);
      return prev && JSON.stringify(prev) !== JSON.stringify(r);
    });

    let mutated = false;

    for (const row of updatedRows) {
      const isTemp = typeof row.id === 'string' && row.id.startsWith('temp_');
      if (isTemp) {
        if (!row.month || row.revenueTotal === undefined || row.expensesTotal === undefined) { continue; }
        const { error } = await supabase
          .from('profit_loss_entries')
          .insert({
            user_id: user.id,
            month: row.month,
            revenue_total: Number(row.revenueTotal),
            expenses_total: Number(row.expensesTotal),
          });
        if (error) {
          console.error('Insert error:', error);
          toast({ title: "Error saving P&L entry", description: error.message, variant: "destructive" });
        } else {
          mutated = true;
        }
      } else {
        const { error } = await supabase
          .from('profit_loss_entries')
          .update({
            month: row.month,
            revenue_total: Number(row.revenueTotal),
            expenses_total: Number(row.expensesTotal),
          })
          .eq('id', row.id)
          .eq('user_id', user.id);
        if (error) {
          console.error('Update error:', error);
          toast({ title: "Error updating P&L entry", description: error.message, variant: "destructive" });
        } else {
          mutated = true;
        }
      }
    }

    for (const row of removedRows) {
      if (typeof row.id === 'string' && row.id.startsWith('temp_')) continue;
      const { error } = await supabase.from('profit_loss_entries').delete().eq('id', row.id).eq('user_id', user.id);
      if (error) {
        console.error('Delete error:', error);
        toast({ title: "Error deleting P&L entry", description: error.message, variant: "destructive" });
      } else {
        mutated = true;
      }
    }

    if (mutated) {
      await fetchPLData();
    }
  };

  const columns: TableColumn[] = [
    {
      key: "month",
      label: "Month",
      type: "text",
      required: true
    },
    {
      key: "revenueTotal",
      label: "Revenue Total",
      type: "currency",
      required: true
    },
    {
      key: "expensesTotal",
      label: "Expenses Total", 
      type: "currency",
      required: true
    },
    {
      key: "netProfit",
      label: "Net Profit",
      type: "currency",
      formula: (row) => Number(row.revenueTotal || 0) - Number(row.expensesTotal || 0)
    },
    {
      key: "profitMargin",
      label: "Profit Margin %",
      type: "percentage",
      formula: (row) => {
        const revenue = Number(row.revenueTotal || 0);
        const expenses = Number(row.expensesTotal || 0);
        const netProfit = revenue - expenses;
        return revenue > 0 ? (netProfit / revenue) * 100 : 0;
      }
    }
  ];

  // Calculate totals and averages
  const totalRevenue = plData.reduce((sum, row) => sum + Number(row.revenueTotal || 0), 0);
  const totalExpenses = plData.reduce((sum, row) => sum + Number(row.expensesTotal || 0), 0);
  const totalNetProfit = totalRevenue - totalExpenses;
  const avgProfitMargin = totalRevenue > 0 ? (totalNetProfit / totalRevenue) * 100 : 0;

  // Calculate month-over-month growth
  const getGrowthRate = () => {
    if (plData.length < 2) return 0;
    const sortedData = [...plData].sort((a, b) => a.month.localeCompare(b.month));
    const latest = sortedData[sortedData.length - 1];
    const previous = sortedData[sortedData.length - 2];
    const latestProfit = Number(latest.revenueTotal || 0) - Number(latest.expensesTotal || 0);
    const previousProfit = Number(previous.revenueTotal || 0) - Number(previous.expensesTotal || 0);
    
    if (previousProfit === 0) return latestProfit > 0 ? 100 : 0;
    return ((latestProfit - previousProfit) / Math.abs(previousProfit)) * 100;
  };

  const growthRate = getGrowthRate();

  return (
    <div className="space-y-6">
      {/* P&L Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-success/10 border border-success/20">
          <div className="text-sm text-success font-medium">Total Revenue</div>
          <div className="text-2xl font-bold text-financial text-success">
            ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
          <div className="text-sm text-destructive font-medium">Total Expenses</div>
          <div className="text-2xl font-bold text-financial text-destructive">
            ${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className={`p-4 rounded-lg border ${
          totalNetProfit >= 0 
            ? 'bg-success/10 border-success/20' 
            : 'bg-destructive/10 border-destructive/20'
        }`}>
          <div className={`text-sm font-medium ${
            totalNetProfit >= 0 ? 'text-success' : 'text-destructive'
          }`}>Total Net Profit</div>
          <div className={`text-2xl font-bold text-financial ${
            totalNetProfit >= 0 ? 'text-success' : 'text-destructive'
          }`}>
            ${totalNetProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className={`p-4 rounded-lg border ${
          avgProfitMargin >= 0 
            ? 'bg-accent/10 border-accent/20' 
            : 'bg-warning/10 border-warning/20'
        }`}>
          <div className={`text-sm font-medium ${
            avgProfitMargin >= 0 ? 'text-accent' : 'text-warning'
          }`}>Avg Profit Margin</div>
          <div className={`text-2xl font-bold text-financial ${
            avgProfitMargin >= 0 ? 'text-accent' : 'text-warning'
          }`}>
            {avgProfitMargin.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Growth Indicator */}
      <div className="p-4 rounded-lg bg-secondary/50 border border-border">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground">Month-over-Month Growth</div>
            <div className={`text-lg font-bold text-financial ${
              growthRate > 0 ? 'text-success' : growthRate < 0 ? 'text-destructive' : 'text-muted-foreground'
            }`}>
              {growthRate > 0 ? '+' : ''}{growthRate.toFixed(1)}%
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Performance Status</div>
            <div className={`text-sm font-medium ${
              avgProfitMargin >= 20 ? 'text-success' :
              avgProfitMargin >= 10 ? 'text-warning' : 'text-destructive'
            }`}>
              {avgProfitMargin >= 20 ? 'Excellent' :
               avgProfitMargin >= 10 ? 'Good' :
               avgProfitMargin >= 0 ? 'Fair' : 'Poor'}
            </div>
          </div>
        </div>
      </div>

      {/* P&L Table */}
      <EditableTable
        title="Profit & Loss Statement"
        columns={columns}
        data={plData}
        onDataChange={handleDataChange}
        addButtonText="Add Monthly P&L"
      />

      {/* Financial Ratios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 card-elegant">
          <h4 className="font-semibold mb-4">Key Financial Ratios</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Revenue Growth Rate</span>
              <span className={`text-financial font-semibold ${
                growthRate > 0 ? 'text-success' : growthRate < 0 ? 'text-destructive' : 'text-muted-foreground'
              }`}>
                {growthRate.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Expense Ratio</span>
              <span className="text-financial font-semibold">
                {totalRevenue > 0 ? ((totalExpenses / totalRevenue) * 100).toFixed(1) : '0.0'}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Operating Margin</span>
              <span className={`text-financial font-semibold ${
                avgProfitMargin >= 15 ? 'text-success' :
                avgProfitMargin >= 5 ? 'text-warning' : 'text-destructive'
              }`}>
                {avgProfitMargin.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Break-even Point</span>
              <span className="text-financial font-semibold">
                ${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 card-elegant">
          <h4 className="font-semibold mb-4">Monthly Performance Trend</h4>
          <div className="space-y-3">
            {plData
              .sort((a, b) => b.month.localeCompare(a.month))
              .slice(0, 6)
              .map((month) => {
                const netProfit = Number(month.revenueTotal || 0) - Number(month.expensesTotal || 0);
                const profitMargin = Number(month.revenueTotal || 0) > 0 ? 
                  (netProfit / Number(month.revenueTotal || 0)) * 100 : 0;
                
                return (
                  <div key={month.id} className="flex items-center justify-between">
                    <span className="text-sm">{month.month}</span>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-1 rounded ${
                        profitMargin >= 15 ? 'bg-success/20 text-success' :
                        profitMargin >= 5 ? 'bg-warning/20 text-warning' : 
                        'bg-destructive/20 text-destructive'
                      }`}>
                        {profitMargin.toFixed(1)}%
                      </span>
                      <span className={`text-financial font-semibold ${
                        netProfit >= 0 ? 'text-success' : 'text-destructive'
                      }`}>
                        ${netProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};