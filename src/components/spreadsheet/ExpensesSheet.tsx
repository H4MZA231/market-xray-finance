import { useState, useEffect } from "react";
import { EditableTable, TableColumn, TableRow } from "./EditableTable";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export const ExpensesSheet = () => {
  const [expensesData, setExpensesData] = useState<TableRow[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchExpensesData();
    }
  }, [user]);

  const fetchExpensesData = async () => {
    const { data, error } = await supabase
      .from('expense_entries')
      .select('*')
      .eq('user_id', user?.id)
      .order('date', { ascending: false });

    if (error) {
      toast({
        title: "Error loading expense data",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setExpensesData(data.map(entry => ({
        id: entry.id,
        date: entry.date,
        vendor: entry.vendor,
        category: entry.category,
        amount: entry.amount,
        notes: entry.notes || ''
      })));
    }
  };

  const handleDataChange = async (newData: TableRow[]) => {
    setExpensesData(newData);
    
    for (const row of newData) {
      if (row.id && row.id.toString().startsWith('exp_') && row.id.toString().includes('new')) {
        const { error } = await supabase
          .from('expense_entries')
          .insert({
            user_id: user?.id,
            date: row.date,
            vendor: row.vendor,
            category: row.category,
            amount: row.amount,
            notes: row.notes || null
          });

        if (error) {
          toast({
            title: "Error saving expense entry",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        const { error } = await supabase
          .from('expense_entries')
          .update({
            date: row.date,
            vendor: row.vendor,
            category: row.category,
            amount: row.amount,
            notes: row.notes || null
          })
          .eq('id', row.id);

        if (error) {
          toast({
            title: "Error updating expense entry",
            description: error.message,
            variant: "destructive",
          });
        }
      }
    }
    
    fetchExpensesData();
  };

  const columns: TableColumn[] = [
    {
      key: "date",
      label: "Date",
      type: "date",
      required: true
    },
    {
      key: "vendor",
      label: "Vendor",
      type: "text",
      required: true
    },
    {
      key: "category", 
      label: "Category",
      type: "select",
      options: [
        "Office Supplies",
        "Software Subscriptions",
        "Marketing",
        "Insurance",
        "Rent",
        "Utilities",
        "Travel",
        "Equipment",
        "Professional Services",
        "Training",
        "Meals & Entertainment",
        "Other"
      ],
      required: true
    },
    {
      key: "amount",
      label: "Amount",
      type: "currency",
      required: true
    },
    {
      key: "notes",
      label: "Notes",
      type: "text"
    }
  ];

  const totalExpenses = expensesData.reduce((sum, row) => sum + Number(row.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Expenses Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
          <div className="text-sm text-destructive font-medium">Total Expenses</div>
          <div className="text-2xl font-bold text-financial text-destructive">
            ${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
          <div className="text-sm text-warning font-medium">Number of Vendors</div>
          <div className="text-2xl font-bold text-financial text-warning">
            {new Set(expensesData.map(row => row.vendor)).size}
          </div>
        </div>
        <div className="p-4 rounded-lg bg-secondary/50 border border-border">
          <div className="text-sm text-muted-foreground font-medium">Average Expense</div>
          <div className="text-2xl font-bold text-financial">
            ${expensesData.length > 0 ? (totalExpenses / expensesData.length).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <EditableTable
        title="Expense Tracking"
        columns={columns}
        data={expensesData}
        onDataChange={handleDataChange}
        addButtonText="Add Expense Entry"
      />

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 card-elegant">
          <h4 className="font-semibold mb-4">Expenses by Category</h4>
          <div className="space-y-3">
            {Object.entries(
              expensesData.reduce((acc, row) => {
                const category = row.category || 'Uncategorized';
                acc[category] = (acc[category] || 0) + Number(row.amount || 0);
                return acc;
              }, {} as Record<string, number>)
            )
            .sort(([,a], [,b]) => b - a)
            .map(([category, amount]) => (
              <div key={category} className="flex items-center justify-between">
                <span className="text-sm">{category}</span>
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-secondary rounded-full h-2">
                    <div 
                      className="h-2 bg-destructive rounded-full"
                      style={{ width: `${(amount / totalExpenses) * 100}%` }}
                    />
                  </div>
                  <span className="text-financial font-semibold text-destructive">
                    ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 card-elegant">
          <h4 className="font-semibold mb-4">Largest Expenses</h4>
          <div className="space-y-3">
            {expensesData
            .sort((a, b) => Number(b.amount || 0) - Number(a.amount || 0))
            .slice(0, 5)
            .map((expense) => (
              <div key={expense.id} className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">{expense.vendor}</div>
                  <div className="text-xs text-muted-foreground">{expense.category}</div>
                </div>
                <span className="text-financial font-semibold text-destructive">
                  ${Number(expense.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};