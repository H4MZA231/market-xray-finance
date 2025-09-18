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
      value: `$${data.totalRevenue.toLocaleString()}`,
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      color: "text-success"
    },
    {
      title: "Total Expenses", 
      value: `$${data.totalExpenses.toLocaleString()}`,
      change: "+8.2%",
      trend: "up",
      icon: CreditCard,
      color: "text-destructive"
    },
    {
      title: "Net Profit",
      value: `$${data.netProfit.toLocaleString()}`,
      change: "+18.7%", 
      trend: "up",
      icon: TrendingUp,
      color: "text-success"
    },
    {
      title: "Outstanding Debt",
      value: `$${data.totalDebt.toLocaleString()}`,
      change: "-5.3%",
      trend: "down",
      icon: AlertCircle,
      color: data.totalDebt > data.netProfit * 2 ? "text-destructive" : "text-warning"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        const isPositive = metric.trend === "up" && !metric.title.includes("Expenses") && !metric.title.includes("Debt");
        
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
                <div className={`flex items-center gap-1 text-sm ${
                  isPositive ? 'text-success' : 'text-destructive'
                }`}>
                  {isPositive ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  {metric.change}
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
              {metric.title === "Net Profit" && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Margin</span>
                    <span className="text-financial">{data.profitMargin}%</span>
                  </div>
                  <Progress value={data.profitMargin} className="h-1" />
                </div>
              )}

              {/* Runway indicator for expenses */}
              {metric.title === "Total Expenses" && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Runway</span>
                    <span className={`text-financial ${
                      data.runway > 12 ? 'text-success' : 
                      data.runway > 6 ? 'text-warning' : 'text-destructive'
                    }`}>
                      {data.runway}mo
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