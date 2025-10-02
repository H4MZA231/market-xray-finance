import { useState, useEffect } from "react";
import { EditableTable, TableColumn, TableRow } from "./EditableTable";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export const CashFlowSheet = () => {
  const [cashFlowData, setCashFlowData] = useState<TableRow[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchCashFlowData();
    }
  }, [user]);

  const fetchCashFlowData = async () => {
    const { data, error } = await supabase
      .from('cash_flow_entries')
      .select('*')
      .eq('user_id', user?.id)
      .order('month', { ascending: true });

    if (error) {
      toast({
        title: "Error loading cash flow data",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setCashFlowData(data.map(entry => ({
        id: entry.id,
        month: entry.month,
        projectedRevenue: entry.inflows,
        projectedExpenses: entry.outflows,
        cashBalance: 0
      })));
    }
  };

  const handleDataChange = async (newData: TableRow[]) => {
    setCashFlowData(newData);
    
    for (const row of newData) {
      if (row.id && row.id.toString().startsWith('cf_') && row.id.toString().includes('new')) {
        const { error } = await supabase
          .from('cash_flow_entries')
          .insert({
            user_id: user?.id,
            month: row.month,
            inflows: row.projectedRevenue,
            outflows: row.projectedExpenses
          });

        if (error) {
          toast({
            title: "Error saving cash flow entry",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        const { error } = await supabase
          .from('cash_flow_entries')
          .update({
            month: row.month,
            inflows: row.projectedRevenue,
            outflows: row.projectedExpenses
          })
          .eq('id', row.id);

        if (error) {
          toast({
            title: "Error updating cash flow entry",
            description: error.message,
            variant: "destructive",
          });
        }
      }
    }
    
    fetchCashFlowData();
  };

  const startingCashBalance = 0;

  const columns: TableColumn[] = [
    {
      key: "month",
      label: "Month",
      type: "text", 
      required: true
    },
    {
      key: "projectedRevenue",
      label: "Projected Revenue",
      type: "currency",
      required: true
    },
    {
      key: "projectedExpenses",
      label: "Projected Expenses",
      type: "currency",
      required: true
    },
    {
      key: "cashBalance",
      label: "Cash Balance",
      type: "currency",
      formula: (row, allRows) => {
        const sortedRows = [...allRows].sort((a, b) => a.month.localeCompare(b.month));
        const currentIndex = sortedRows.findIndex(r => r.id === row.id);
        
        if (currentIndex === 0) {
          // First month: starting balance + net cash flow
          return startingCashBalance + 
                 Number(row.projectedRevenue || 0) - 
                 Number(row.projectedExpenses || 0);
        } else {
          // Subsequent months: previous balance + net cash flow
          const previousRow = sortedRows[currentIndex - 1];
          const previousBalance = previousRow.cashBalance || 
            (startingCashBalance + 
             Number(previousRow.projectedRevenue || 0) - 
             Number(previousRow.projectedExpenses || 0));
          
          return previousBalance + 
                 Number(row.projectedRevenue || 0) - 
                 Number(row.projectedExpenses || 0);
        }
      }
    }
  ];

  const totalProjectedRevenue = cashFlowData.reduce((sum, row) => sum + Number(row.projectedRevenue || 0), 0);
  const totalProjectedExpenses = cashFlowData.reduce((sum, row) => sum + Number(row.projectedExpenses || 0), 0);
  const netCashFlow = totalProjectedRevenue - totalProjectedExpenses;
  
  // Calculate final cash balance
  const sortedData = [...cashFlowData].sort((a, b) => a.month.localeCompare(b.month));
  const finalCashBalance = sortedData.length > 0 ? 
    startingCashBalance + sortedData.reduce((acc, row) => 
      acc + Number(row.projectedRevenue || 0) - Number(row.projectedExpenses || 0), 0
    ) : startingCashBalance;

  // Calculate runway (months until cash runs out)
  const avgMonthlyBurn = totalProjectedExpenses / (cashFlowData.length || 1);
  const avgMonthlyRevenue = totalProjectedRevenue / (cashFlowData.length || 1);
  const avgNetCashFlow = avgMonthlyRevenue - avgMonthlyBurn;
  const runway = avgNetCashFlow > 0 ? Infinity : Math.abs(finalCashBalance / avgNetCashFlow);

  return (
    <div className="space-y-6">
      {/* Cash Flow Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
          <div className="text-sm text-accent font-medium">Current Cash</div>
          <div className="text-2xl font-bold text-financial text-accent">
            ${startingCashBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="p-4 rounded-lg bg-success/10 border border-success/20">
          <div className="text-sm text-success font-medium">Projected Revenue</div>
          <div className="text-2xl font-bold text-financial text-success">
            ${totalProjectedRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
          <div className="text-sm text-destructive font-medium">Projected Expenses</div>
          <div className="text-2xl font-bold text-financial text-destructive">
            ${totalProjectedExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className={`p-4 rounded-lg border ${
          netCashFlow >= 0 
            ? 'bg-success/10 border-success/20' 
            : 'bg-warning/10 border-warning/20'
        }`}>
          <div className={`text-sm font-medium ${
            netCashFlow >= 0 ? 'text-success' : 'text-warning'
          }`}>Net Cash Flow</div>
          <div className={`text-2xl font-bold text-financial ${
            netCashFlow >= 0 ? 'text-success' : 'text-warning'
          }`}>
            ${netCashFlow.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Cash Flow Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-secondary/50 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Projected Final Balance</div>
              <div className={`text-xl font-bold text-financial ${
                finalCashBalance > startingCashBalance ? 'text-success' : 
                finalCashBalance > 0 ? 'text-warning' : 'text-destructive'
              }`}>
                ${finalCashBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Change</div>
              <div className={`text-sm font-medium ${
                finalCashBalance > startingCashBalance ? 'text-success' : 'text-destructive'
              }`}>
                {finalCashBalance > startingCashBalance ? '+' : ''}
                ${(finalCashBalance - startingCashBalance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-lg bg-secondary/50 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Cash Runway</div>
              <div className={`text-xl font-bold text-financial ${
                runway === Infinity || runway > 24 ? 'text-success' :
                runway > 12 ? 'text-warning' : 'text-destructive'
              }`}>
                {runway === Infinity ? '∞' : `${Math.floor(runway)} mo`}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Status</div>
              <div className={`text-sm font-medium ${
                runway === Infinity || runway > 24 ? 'text-success' :
                runway > 12 ? 'text-warning' : 'text-destructive'
              }`}>
                {runway === Infinity || runway > 24 ? 'Healthy' :
                 runway > 12 ? 'Moderate' : 'Critical'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cash Flow Table */}
      <EditableTable
        title="Cash Flow Forecast"
        columns={columns}
        data={cashFlowData}
        onDataChange={handleDataChange}
        addButtonText="Add Monthly Forecast"
      />

      {/* Cash Flow Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 card-elegant">
          <h4 className="font-semibold mb-4">Monthly Cash Flow Trend</h4>
          <div className="space-y-3">
            {cashFlowData
              .sort((a, b) => a.month.localeCompare(b.month))
              .map((month) => {
                const netFlow = Number(month.projectedRevenue || 0) - Number(month.projectedExpenses || 0);
                
                return (
                  <div key={month.id} className="flex items-center justify-between">
                    <span className="text-sm">{month.month}</span>
                    <div className="flex items-center gap-3">
                      <div className={`text-xs px-2 py-1 rounded ${
                        netFlow > 0 ? 'bg-success/20 text-success' : 
                        netFlow === 0 ? 'bg-warning/20 text-warning' :
                        'bg-destructive/20 text-destructive'
                      }`}>
                        {netFlow > 0 ? 'Positive' : netFlow === 0 ? 'Break-even' : 'Negative'}
                      </div>
                      <span className={`text-financial font-semibold ${
                        netFlow > 0 ? 'text-success' : 
                        netFlow === 0 ? 'text-warning' : 'text-destructive'
                      }`}>
                        ${netFlow.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        <div className="p-6 card-elegant">
          <h4 className="font-semibold mb-4">Cash Management Tips</h4>
          <div className="space-y-3 text-sm">
            {netCashFlow < 0 && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <div className="font-medium text-destructive mb-1">⚠️ Negative Cash Flow</div>
                <div className="text-muted-foreground">Consider reducing expenses or increasing revenue to improve cash position.</div>
              </div>
            )}
            {runway < 12 && runway !== Infinity && (
              <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
                <div className="font-medium text-warning mb-1">🚨 Short Runway</div>
                <div className="text-muted-foreground">Less than 12 months of cash remaining. Plan for funding or cost reduction.</div>
              </div>
            )}
            {finalCashBalance > startingCashBalance * 1.5 && (
              <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                <div className="font-medium text-success mb-1">💰 Cash Growth</div>
                <div className="text-muted-foreground">Strong cash accumulation. Consider strategic investments or expansion.</div>
              </div>
            )}
            <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
              <div className="font-medium text-accent mb-1">📊 Recommendation</div>
              <div className="text-muted-foreground">
                Maintain 3-6 months of expenses in cash reserves for business stability.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};