import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  Building, 
  DollarSign, 
  Calendar,
  AlertCircle,
  CheckCircle,
  Package
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const typeIcons: Record<string, any> = {
  "Business Loan": Building,
  "Equipment Financing": Package,
  "Line of Credit": DollarSign,
  "Credit Card": CreditCard,
  "Other": CreditCard
};

export const DebtManagement = () => {
  const { user } = useAuth();
  const [debts, setDebts] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchDebts = async () => {
      const { data } = await supabase
        .from('debt_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('due_date', { ascending: true });

      if (data) {
        setDebts(data.map(debt => ({
          ...debt,
          icon: typeIcons[debt.type] || CreditCard,
          priority: getDuePriority(debt.due_date)
        })));
      }
    };

    fetchDebts();

    // Real-time updates
    const channel = supabase
      .channel('debt-management-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'debt_entries', filter: `user_id=eq.${user.id}` }, fetchDebts)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const getDuePriority = (dueDate: string) => {
    const daysUntilDue = Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilDue <= 7) return "high";
    if (daysUntilDue <= 30) return "medium";
    return "low";
  };

  const totalDebt = debts.reduce((sum, debt) => sum + Number(debt.current_balance || 0), 0);
  const totalMonthlyPayments = debts.reduce((sum, debt) => sum + Number(debt.monthly_payment || 0), 0);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-destructive";
      case "medium": return "text-warning"; 
      case "low": return "text-success";
      default: return "text-muted-foreground";
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "secondary";
      case "low": return "outline";
      default: return "outline";
    }
  };

  return (
    <Card className="card-elegant p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Debt Management
          </h3>
          <p className="text-muted-foreground text-sm">Outstanding obligations and payment schedule</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-financial text-destructive">
            ${totalDebt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-sm text-muted-foreground">
            ${totalMonthlyPayments.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/month
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {debts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No debt entries yet. Add debt in the Debt tab.
          </div>
        ) : (
          debts.map((debt, index) => {
            const Icon = debt.icon;
            const percentPaid = debt.original_amount > 0 
              ? ((Number(debt.original_amount) - Number(debt.current_balance)) / Number(debt.original_amount)) * 100 
              : 0;
            const daysUntilDue = Math.ceil((new Date(debt.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            
            return (
              <div key={debt.id} className="p-4 rounded-lg bg-secondary/50 border border-border/50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      debt.priority === 'high' ? 'bg-destructive/10' :
                      debt.priority === 'medium' ? 'bg-warning/10' : 'bg-success/10'
                    }`}>
                      <Icon className={`w-4 h-4 ${getPriorityColor(debt.priority)}`} />
                    </div>
                    <div>
                      <h4 className="font-medium">{debt.type}</h4>
                      <p className="text-sm text-muted-foreground">{debt.creditor}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getPriorityBadge(debt.priority)} className="text-xs">
                      {debt.priority.toUpperCase()}
                    </Badge>
                    {daysUntilDue <= 7 && (
                      <AlertCircle className="w-4 h-4 text-destructive" />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                  <div>
                    <div className="text-xs text-muted-foreground">Remaining</div>
                    <div className="text-sm font-semibold text-financial text-destructive">
                      ${Number(debt.current_balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Monthly Payment</div>
                    <div className="text-sm font-semibold text-financial">
                      ${Number(debt.monthly_payment).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Interest Rate</div>
                    <div className="text-sm font-semibold text-financial">
                      {Number(debt.interest_rate).toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Next Due</div>
                    <div className={`text-sm font-semibold text-financial ${
                      daysUntilDue <= 7 ? 'text-destructive' : 'text-foreground'
                    }`}>
                      {daysUntilDue} days
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      Paid: ${(Number(debt.original_amount) - Number(debt.current_balance)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-financial font-medium">
                      {percentPaid.toFixed(1)}% complete
                    </span>
                  </div>
                  <Progress value={percentPaid} className="h-2" />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Debt Summary */}
      {debts.length > 0 && (
        <div className="mt-6 pt-6 border-t border-border">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-sm text-muted-foreground">Total Debt</div>
              <div className="text-lg font-bold text-financial text-destructive">
                ${totalDebt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Monthly Obligations</div>
              <div className="text-lg font-bold text-financial">
                ${totalMonthlyPayments.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Active Accounts</div>
              <div className="text-lg font-bold text-financial">
                {debts.length}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Avg Interest</div>
              <div className="text-lg font-bold text-financial">
                {debts.length > 0 
                  ? (debts.reduce((sum, debt) => sum + Number(debt.interest_rate), 0) / debts.length).toFixed(1)
                  : '0.0'}%
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};