import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  Building, 
  DollarSign, 
  Calendar,
  AlertCircle,
  CheckCircle
} from "lucide-react";

export const DebtManagement = () => {
  const debts = [
    {
      type: "Business Loan",
      creditor: "First National Bank",
      totalAmount: 25000,
      remaining: 18750,
      monthlyPayment: 850,
      dueDate: "2024-10-15",
      interestRate: 6.5,
      icon: Building,
      priority: "high"
    },
    {
      type: "Equipment Financing", 
      creditor: "TechCorp Financial",
      totalAmount: 15000,
      remaining: 9200,
      monthlyPayment: 420,
      dueDate: "2024-10-22",
      interestRate: 4.2,
      icon: CreditCard,
      priority: "medium"
    },
    {
      type: "Line of Credit",
      creditor: "Business Credit Union",
      totalAmount: 10000,
      remaining: 6500,
      monthlyPayment: 280,
      dueDate: "2024-10-30",
      interestRate: 8.1,
      icon: DollarSign,
      priority: "low"
    }
  ];

  const totalDebt = debts.reduce((sum, debt) => sum + debt.remaining, 0);
  const totalMonthlyPayments = debts.reduce((sum, debt) => sum + debt.monthlyPayment, 0);

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
            ${totalDebt.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">
            ${totalMonthlyPayments.toLocaleString()}/month
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {debts.map((debt, index) => {
          const Icon = debt.icon;
          const percentPaid = ((debt.totalAmount - debt.remaining) / debt.totalAmount) * 100;
          const daysUntilDue = Math.ceil((new Date(debt.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          
          return (
            <div key={index} className="p-4 rounded-lg bg-secondary/50 border border-border/50">
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
                    ${debt.remaining.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Monthly Payment</div>
                  <div className="text-sm font-semibold text-financial">
                    ${debt.monthlyPayment.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Interest Rate</div>
                  <div className="text-sm font-semibold text-financial">
                    {debt.interestRate}%
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
                    Paid: ${(debt.totalAmount - debt.remaining).toLocaleString()}
                  </span>
                  <span className="text-financial font-medium">
                    {percentPaid.toFixed(1)}% complete
                  </span>
                </div>
                <Progress value={percentPaid} className="h-2" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Debt Summary */}
      <div className="mt-6 pt-6 border-t border-border">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-sm text-muted-foreground">Total Debt</div>
            <div className="text-lg font-bold text-financial text-destructive">
              ${totalDebt.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Monthly Obligations</div>
            <div className="text-lg font-bold text-financial">
              ${totalMonthlyPayments.toLocaleString()}
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
              {(debts.reduce((sum, debt) => sum + debt.interestRate, 0) / debts.length).toFixed(1)}%
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};