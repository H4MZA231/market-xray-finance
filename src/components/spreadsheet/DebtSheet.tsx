import { useState, useEffect } from "react";
import { EditableTable, TableColumn, TableRow } from "./EditableTable";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export const DebtSheet = () => {
  const [debtData, setDebtData] = useState<TableRow[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchDebtData();
    }
  }, [user]);

  const fetchDebtData = async () => {
    const { data, error } = await supabase
      .from('debt_entries')
      .select('*')
      .eq('user_id', user?.id)
      .order('due_date', { ascending: true });

    if (error) {
      toast({
        title: "Error loading debt data",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setDebtData(data.map(entry => ({
        id: entry.id,
        lender: entry.creditor,
        amountBorrowed: entry.original_amount,
        interestRate: entry.interest_rate,
        monthlyPayment: entry.monthly_payment,
        remainingBalance: entry.current_balance,
        dueDate: entry.due_date,
        notes: entry.notes || ''
      })));
    }
  };

  const handleDataChange = async (newData: TableRow[]) => {
    setDebtData(newData);
    
    for (const row of newData) {
      if (row.id && row.id.toString().startsWith('debt_') && row.id.toString().includes('new')) {
        const { error } = await supabase
          .from('debt_entries')
          .insert({
            user_id: user?.id,
            creditor: row.lender,
            type: 'Loan',
            original_amount: row.amountBorrowed,
            current_balance: row.remainingBalance,
            interest_rate: row.interestRate,
            monthly_payment: row.monthlyPayment,
            due_date: row.dueDate,
            notes: row.notes || null
          });

        if (error) {
          toast({
            title: "Error saving debt entry",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        const { error } = await supabase
          .from('debt_entries')
          .update({
            creditor: row.lender,
            original_amount: row.amountBorrowed,
            current_balance: row.remainingBalance,
            interest_rate: row.interestRate,
            monthly_payment: row.monthlyPayment,
            due_date: row.dueDate,
            notes: row.notes || null
          })
          .eq('id', row.id);

        if (error) {
          toast({
            title: "Error updating debt entry",
            description: error.message,
            variant: "destructive",
          });
        }
      }
    }
    
    fetchDebtData();
  };

  const columns: TableColumn[] = [
    {
      key: "lender",
      label: "Lender",
      type: "text",
      required: true
    },
    {
      key: "amountBorrowed",
      label: "Amount Borrowed",
      type: "currency",
      required: true
    },
    {
      key: "interestRate",
      label: "Interest Rate (%)",
      type: "percentage",
      required: true
    },
    {
      key: "monthlyPayment",
      label: "Monthly Payment",
      type: "currency",
      required: true
    },
    {
      key: "remainingBalance",
      label: "Remaining Balance",
      type: "currency",
      required: true
    },
    {
      key: "dueDate",
      label: "Due Date",
      type: "date",
      required: true
    }
  ];

  const totalDebt = debtData.reduce((sum, row) => sum + Number(row.remainingBalance || 0), 0);
  const totalMonthlyPayments = debtData.reduce((sum, row) => sum + Number(row.monthlyPayment || 0), 0);
  const totalBorrowed = debtData.reduce((sum, row) => sum + Number(row.amountBorrowed || 0), 0);
  const totalPaid = totalBorrowed - totalDebt;
  const avgInterestRate = debtData.length > 0 ? 
    debtData.reduce((sum, row) => sum + Number(row.interestRate || 0), 0) / debtData.length : 0;

  return (
    <div className="space-y-6">
      {/* Debt Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
          <div className="text-sm text-destructive font-medium">Total Remaining Debt</div>
          <div className="text-2xl font-bold text-financial text-destructive">
            ${totalDebt.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
          <div className="text-sm text-warning font-medium">Monthly Payments</div>
          <div className="text-2xl font-bold text-financial text-warning">
            ${totalMonthlyPayments.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="p-4 rounded-lg bg-success/10 border border-success/20">
          <div className="text-sm text-success font-medium">Total Paid</div>
          <div className="text-2xl font-bold text-financial text-success">
            ${totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
          <div className="text-sm text-accent font-medium">Avg Interest Rate</div>
          <div className="text-2xl font-bold text-financial text-accent">
            {avgInterestRate.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Debt Progress */}
      {totalBorrowed > 0 && (
        <div className="p-6 card-elegant">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold">Overall Debt Progress</h4>
            <span className="text-sm text-muted-foreground">
              {((totalPaid / totalBorrowed) * 100).toFixed(1)}% paid off
            </span>
          </div>
          <Progress value={(totalPaid / totalBorrowed) * 100} className="h-3" />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>Paid: ${totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            <span>Remaining: ${totalDebt.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      )}

      {/* Debt Table */}
      <EditableTable
        title="Debts & Loans"
        columns={columns}
        data={debtData}
        onDataChange={handleDataChange}
        addButtonText="Add Debt/Loan"
      />

      {/* Individual Debt Progress */}
      <div className="p-6 card-elegant">
        <h4 className="font-semibold mb-4">Individual Loan Progress</h4>
        <div className="space-y-4">
          {debtData.map((debt) => {
            const amountBorrowed = Number(debt.amountBorrowed || 0);
            const remainingBalance = Number(debt.remainingBalance || 0);
            const paidAmount = amountBorrowed - remainingBalance;
            const progressPercentage = amountBorrowed > 0 ? (paidAmount / amountBorrowed) * 100 : 0;
            const daysUntilDue = Math.ceil((new Date(debt.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            
            return (
              <div key={debt.id} className="p-4 rounded-lg bg-secondary/30 border border-border/50">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h5 className="font-medium">{debt.lender}</h5>
                    <div className="text-sm text-muted-foreground">
                      {debt.interestRate}% APR • ${debt.monthlyPayment}/month
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-financial text-destructive">
                      ${remainingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {daysUntilDue > 0 ? `${daysUntilDue} days left` : 'Overdue'}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Paid: ${paidAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    <span>{progressPercentage.toFixed(1)}% complete</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};