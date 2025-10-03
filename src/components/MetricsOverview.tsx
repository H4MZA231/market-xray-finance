import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CreditCard,
  AlertCircle,
  CheckCircle
} from "lucide-react";

interface MetricsData {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  totalDebt: number;
  cashFlow: number;
  burnRate: number;
  runway: number;
  profitMargin: number;
}

interface MetricsOverviewProps {
  data: MetricsData;
}

export const MetricsOverview = ({ data }: MetricsOverviewProps) => {
  const metrics = [
    {
      title: "Total Revenue",
      value: `$${data.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: "text-success",
      showTrend: data.totalRevenue > 0
    },
    {
      title: "Total Expenses", 
      value: `$${data.totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: CreditCard,
      color: "text-destructive",
      showTrend: data.totalExpenses > 0
    },
    {
      title: "Net Profit",
      value: `$${data.netProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: data.netProfit >= 0 ? TrendingUp : TrendingDown,
      color: data.netProfit >= 0 ? "text-success" : "text-destructive",
      showTrend: data.netProfit !== 0
    },
    {
      title: "Outstanding Debt",
      value: `$${data.totalDebt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: data.totalDebt === 0 ? CheckCircle : AlertCircle,
      color: data.totalDebt > data.netProfit * 2 ? "text-destructive" : data.totalDebt > 0 ? "text-warning" : "text-success",
      showTrend: data.totalDebt > 0
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        
        return (
          <Card key={index} className="card-elegant p-6 relative overflow-hidden">
            {/* Background accent */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-accent/10 to-transparent rounded-bl-full" />
            
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${
                  metric.color.includes('success') ? 'bg-success/10' :
                  metric.color.includes('destructive') ? 'bg-destructive/10' :
                  metric.color.includes('warning') ? 'bg-warning/10' : 'bg-accent/10'
                }`}>
                  <Icon className={`w-5 h-5 ${metric.color}`} />
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  {metric.title}
                </h3>
                <div className={`text-2xl font-bold text-financial ${metric.color}`}>
                  {metric.value}
                </div>
              </div>

              {/* Mini trend indicator for profit margin */}
              {metric.title === "Net Profit" && data.totalRevenue > 0 && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Margin</span>
                    <span className="text-financial">{data.profitMargin.toFixed(1)}%</span>
                  </div>
                  <Progress value={Math.max(0, Math.min(100, data.profitMargin))} className="h-1" />
                </div>
              )}

              {/* Runway indicator for expenses */}
              {metric.title === "Total Expenses" && data.totalExpenses > 0 && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Runway</span>
                    <span className={`text-financial ${
                      data.runway > 12 ? 'text-success' : 
                      data.runway > 6 ? 'text-warning' : 'text-destructive'
                    }`}>
                      {Math.round(data.runway)}mo
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(100, (data.runway / 24) * 100)} 
                    className="h-1" 
                  />
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
};