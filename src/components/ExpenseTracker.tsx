import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingCart, 
  Home, 
  Car, 
  Users, 
  Wifi,
  MoreHorizontal,
  TrendingUp,
  DollarSign,
  Package,
  Wrench
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const categoryIcons: Record<string, any> = {
  "Office Supplies": Package,
  "Software Subscriptions": Wifi,
  "Marketing": TrendingUp,
  "Insurance": Home,
  "Rent": Home,
  "Utilities": Wifi,
  "Travel": Car,
  "Equipment": Wrench,
  "Professional Services": Users,
  "Training": Users,
  "Meals & Entertainment": ShoppingCart,
  "Other": MoreHorizontal
};

export const ExpenseTracker = () => {
  const { user } = useAuth();
  const [categoryData, setCategoryData] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!user) return;

    const fetchExpenses = async () => {
      const { data } = await supabase
        .from('expense_entries')
        .select('category, amount')
        .eq('user_id', user.id);

      if (data) {
        const grouped = data.reduce((acc, entry) => {
          const cat = entry.category || 'Other';
          acc[cat] = (acc[cat] || 0) + Number(entry.amount);
          return acc;
        }, {} as Record<string, number>);
        setCategoryData(grouped);
      }
    };

    fetchExpenses();

    // Real-time updates
    const channel = supabase
      .channel('expense-tracker-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expense_entries', filter: `user_id=eq.${user.id}` }, fetchExpenses)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const expenses = Object.entries(categoryData)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([category, amount]) => ({
      category,
      amount,
      icon: categoryIcons[category] || MoreHorizontal,
      color: "text-accent",
      bgColor: "bg-accent/10"
    }));

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <Card className="card-elegant p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold">Expense Breakdown by Category</h3>
          <p className="text-muted-foreground text-sm">Real-time expense tracking</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-financial text-destructive">
            ${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-sm text-muted-foreground">
            {expenses.length} {expenses.length === 1 ? 'category' : 'categories'}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {expenses.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No expense data yet. Add expenses in the Expenses tab.
          </div>
        ) : (
          expenses.map((expense, index) => {
            const Icon = expense.icon;
            const percentage = totalExpenses > 0 ? (expense.amount / totalExpenses) * 100 : 0;
            
            return (
              <div key={index} className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50">
                <div className={`p-2 rounded-lg ${expense.bgColor}`}>
                  <Icon className={`w-5 h-5 ${expense.color}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium">{expense.category}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-financial font-semibold">
                          ${expense.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className="text-muted-foreground text-sm">
                          ({percentage.toFixed(1)}% of total)
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <Progress 
                    value={percentage} 
                    className="h-2"
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      {expenses.length > 0 && (
        <div className="mt-6 pt-6 border-t border-border">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-sm text-muted-foreground">Total Expenses</div>
              <div className="text-lg font-bold text-financial text-destructive">
                ${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Categories</div>
              <div className="text-lg font-bold text-financial">
                {Object.keys(categoryData).length}
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};