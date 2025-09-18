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
  TrendingUp
} from "lucide-react";

export const ExpenseTracker = () => {
  const expenses = [
    {
      category: "Operations",
      amount: 35000,
      budget: 40000,
      icon: Home,
      color: "text-accent",
      bgColor: "bg-accent/10"
    },
    {
      category: "Marketing", 
      amount: 18500,
      budget: 20000,
      icon: TrendingUp,
      color: "text-success",
      bgColor: "bg-success/10"
    },
    {
      category: "Payroll",
      amount: 25000,
      budget: 24000,
      icon: Users,
      color: "text-warning",
      bgColor: "bg-warning/10"
    },
    {
      category: "Technology",
      amount: 5200,
      budget: 8000,
      icon: Wifi,
      color: "text-accent",
      bgColor: "bg-accent/10"
    },
    {
      category: "Travel",
      amount: 3800,
      budget: 5000,
      icon: Car,
      color: "text-success",
      bgColor: "bg-success/10"
    }
  ];

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalBudget = expenses.reduce((sum, exp) => sum + exp.budget, 0);

  return (
    <Card className="card-elegant p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold">Expense Breakdown</h3>
          <p className="text-muted-foreground text-sm">Current month vs budget</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-financial text-destructive">
            ${totalExpenses.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">
            of ${totalBudget.toLocaleString()} budgeted
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {expenses.map((expense, index) => {
          const Icon = expense.icon;
          const percentage = (expense.amount / expense.budget) * 100;
          const isOverBudget = percentage > 100;
          
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
                        ${expense.amount.toLocaleString()}
                      </span>
                      <span className="text-muted-foreground text-sm">
                        / ${expense.budget.toLocaleString()}
                      </span>
                      {isOverBudget && (
                        <Badge variant="destructive" className="text-xs">
                          Over Budget
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${
                      isOverBudget ? 'text-destructive' : 
                      percentage > 80 ? 'text-warning' : 'text-success'
                    }`}>
                      {percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
                
                <Progress 
                  value={Math.min(100, percentage)} 
                  className="h-2"
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-6 border-t border-border">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-sm text-muted-foreground">Budget Used</div>
            <div className="text-lg font-bold text-financial">
              {((totalExpenses / totalBudget) * 100).toFixed(1)}%
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Remaining</div>
            <div className="text-lg font-bold text-financial text-success">
              ${(totalBudget - totalExpenses).toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Categories</div>
            <div className="text-lg font-bold text-financial">
              {expenses.length}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};