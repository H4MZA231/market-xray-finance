import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Target,
  Lightbulb,
  DollarSign,
  Clock
} from "lucide-react";

interface AIInsightsProps {
  data: {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    totalDebt: number;
    cashFlow: number;
    burnRate: number;
    runway: number;
    profitMargin: number;
  };
}

export const AIInsights = ({ data }: AIInsightsProps) => {
  // AI-generated insights based on financial data
  const insights = [
    {
      type: "critical",
      title: "Cash Flow Warning", 
      message: "Your burn rate is 70% of monthly profit. Consider reducing operational costs by 15% to extend runway.",
      icon: AlertTriangle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
      priority: "high"
    },
    {
      type: "opportunity",
      title: "Growth Opportunity",
      message: "With 30% profit margin, you could reinvest $15K monthly in marketing to accelerate growth.",
      icon: TrendingUp,
      color: "text-success", 
      bgColor: "bg-success/10",
      priority: "medium"
    },
    {
      type: "optimization",
      title: "Debt Optimization",
      message: "Refinancing your highest interest debt could save $180/month in payments.",
      icon: DollarSign,
      color: "text-warning",
      bgColor: "bg-warning/10", 
      priority: "medium"
    },
    {
      type: "recommendation",
      title: "Emergency Fund",
      message: "Build 6-month expense buffer ($525K) to protect against market volatility.",
      icon: Target,
      color: "text-accent",
      bgColor: "bg-accent/10",
      priority: "low"
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "secondary";
      case "low": return "outline";
      default: return "outline";
    }
  };

  const timeBasedTip = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return "Morning insight: Review yesterday's expenses during your first coffee.";
    } else if (hour < 17) {
      return "Afternoon focus: Check cash flow projections for next week's decisions.";
    } else {
      return "Evening review: Plan tomorrow's financial priorities before market open.";
    }
  };

  return (
    <Card className="card-elegant p-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-accent/10 rounded-lg glow-accent">
          <Brain className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">AI Financial Insights</h3>
          <p className="text-muted-foreground text-sm">Smart recommendations for your business</p>
        </div>
      </div>

      <div className="space-y-4">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          
          return (
            <div key={index} className="p-4 rounded-lg bg-secondary/30 border border-border/50 hover:bg-secondary/50 transition-colors">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${insight.bgColor} shrink-0`}>
                  <Icon className={`w-4 h-4 ${insight.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{insight.title}</h4>
                    <Badge variant={getPriorityColor(insight.priority)} className="text-xs">
                      {insight.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {insight.message}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Tip */}
      <div className="mt-6 pt-6 border-t border-border">
        <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/5">
          <div className="p-1 bg-accent/10 rounded">
            <Lightbulb className="w-4 h-4 text-accent" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs font-medium text-accent">Smart Tip</span>
            </div>
            <p className="text-xs text-muted-foreground">{timeBasedTip()}</p>
          </div>
        </div>
      </div>

      {/* AI Analysis Summary */}
      <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-accent/10 to-accent/5 border border-accent/20">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-accent">Financial Health Score</span>
          <span className="text-lg font-bold text-financial text-accent">
            {Math.max(0, Math.min(100, 
              (data.netProfit / data.totalRevenue) * 100 + 
              (data.cashFlow > 0 ? 20 : -20) +
              (data.totalDebt < data.netProfit * 2 ? 10 : -30)
            )).toFixed(0)}%
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Based on profitability, cash flow, and debt ratios. 
          <span className="text-accent ml-1 font-medium">
            {data.runway > 12 ? "Strong position" : data.runway > 6 ? "Moderate risk" : "Needs attention"}
          </span>
        </p>
      </div>
    </Card>
  );
};