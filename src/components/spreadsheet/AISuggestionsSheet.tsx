import { useState } from "react";
import { EditableTable, TableColumn, TableRow } from "./EditableTable";
import { Badge } from "@/components/ui/badge";
import { Brain, Lightbulb, TrendingUp, AlertTriangle, Target } from "lucide-react";

export const AISuggestionsSheet = () => {
  const [suggestionsData, setSuggestionsData] = useState<TableRow[]>([
    {
      id: "ai_1",
      date: "2024-01-28",
      category: "Cash Flow",
      suggestion: "Your cash runway is strong at 14.3 months, but consider investing surplus cash in growth opportunities or higher-yield accounts to maximize returns.",
      status: "pending",
      priority: "medium"
    },
    {
      id: "ai_2",
      date: "2024-01-27",
      category: "Debt Management", 
      suggestion: "Refinance your highest interest debt (8.1% Business Credit Union loan) to save approximately $180/month in interest payments.",
      status: "pending",
      priority: "high"
    },
    {
      id: "ai_3",
      date: "2024-01-26",
      category: "Revenue Optimization",
      suggestion: "Your consulting category shows the highest profit margins. Consider expanding this service line or raising rates by 10-15%.",
      status: "in-progress",
      priority: "high"
    },
    {
      id: "ai_4",
      date: "2024-01-25", 
      category: "Expense Control",
      suggestion: "Marketing expenses are approaching budget limits. Analyze ROI on current campaigns and reallocate spend to highest-performing channels.",
      status: "completed",
      priority: "medium"
    },
    {
      id: "ai_5",
      date: "2024-01-24",
      category: "KPI Improvement",
      suggestion: "Customer Acquisition Cost is 25% above target. Implement referral program or improve conversion rates to reduce CAC to under $200.",
      status: "pending", 
      priority: "high"
    },
    {
      id: "ai_6",
      date: "2024-01-23",
      category: "Risk Management",
      suggestion: "Diversify client base - TechCorp Solutions represents 56% of revenue. Acquire 2-3 additional clients to reduce dependency risk.",
      status: "in-progress",
      priority: "high"
    },
    {
      id: "ai_7",
      date: "2024-01-22",
      category: "Tax Planning",
      suggestion: "Q1 profit projections indicate potential tax optimization opportunities. Consider equipment purchases or retirement contributions.",
      status: "pending",
      priority: "low"
    },
    {
      id: "ai_8",
      date: "2024-01-20",
      category: "Profitability",
      suggestion: "Gross profit margin of 83.3% exceeds target. You have room to invest in growth while maintaining healthy margins.",
      status: "pending",
      priority: "medium"
    }
  ]);

  const columns: TableColumn[] = [
    {
      key: "date",
      label: "Date",
      type: "date",
      required: true
    },
    {
      key: "category",
      label: "Category",
      type: "select",
      options: [
        "Cash Flow",
        "Debt Management",
        "Revenue Optimization", 
        "Expense Control",
        "KPI Improvement",
        "Risk Management",
        "Tax Planning",
        "Profitability",
        "Growth Strategy",
        "Operational Efficiency"
      ],
      required: true
    },
    {
      key: "suggestion",
      label: "AI Suggestion",
      type: "text",
      required: true
    },
    {
      key: "status",
      label: "Status", 
      type: "select",
      options: ["pending", "in-progress", "completed", "dismissed"],
      required: true
    },
    {
      key: "priority",
      label: "Priority",
      type: "select",
      options: ["low", "medium", "high", "critical"]
    }
  ];

  // Calculate suggestion statistics
  const totalSuggestions = suggestionsData.length;
  const pendingSuggestions = suggestionsData.filter(s => s.status === 'pending').length;
  const inProgressSuggestions = suggestionsData.filter(s => s.status === 'in-progress').length;
  const completedSuggestions = suggestionsData.filter(s => s.status === 'completed').length;
  const highPrioritySuggestions = suggestionsData.filter(s => s.priority === 'high').length;

  const completionRate = totalSuggestions > 0 ? (completedSuggestions / totalSuggestions) * 100 : 0;

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case 'high': return <TrendingUp className="w-4 h-4 text-warning" />;
      case 'medium': return <Target className="w-4 h-4 text-accent" />;
      case 'low': return <Lightbulb className="w-4 h-4 text-success" />;
      default: return <Lightbulb className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Cash Flow': 'text-accent',
      'Debt Management': 'text-destructive', 
      'Revenue Optimization': 'text-success',
      'Expense Control': 'text-warning',
      'KPI Improvement': 'text-accent',
      'Risk Management': 'text-destructive',
      'Tax Planning': 'text-muted-foreground',
      'Profitability': 'text-success',
      'Growth Strategy': 'text-success',
      'Operational Efficiency': 'text-accent'
    };
    return colors[category as keyof typeof colors] || 'text-muted-foreground';
  };

  return (
    <div className="space-y-6">
      {/* AI Suggestions Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
          <div className="text-sm text-accent font-medium">Total Suggestions</div>
          <div className="text-2xl font-bold text-financial text-accent">
            {totalSuggestions}
          </div>
          <div className="text-xs text-muted-foreground">AI recommendations</div>
        </div>
        <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
          <div className="text-sm text-warning font-medium">High Priority</div>
          <div className="text-2xl font-bold text-financial text-warning">
            {highPrioritySuggestions}
          </div>
          <div className="text-xs text-muted-foreground">Need attention</div>
        </div>
        <div className="p-4 rounded-lg bg-secondary/50 border border-border">
          <div className="text-sm text-muted-foreground font-medium">In Progress</div>
          <div className="text-2xl font-bold text-financial">
            {inProgressSuggestions}
          </div>
          <div className="text-xs text-muted-foreground">Being implemented</div>
        </div>
        <div className="p-4 rounded-lg bg-success/10 border border-success/20">
          <div className="text-sm text-success font-medium">Completion Rate</div>
          <div className="text-2xl font-bold text-financial text-success">
            {completionRate.toFixed(0)}%
          </div>
          <div className="text-xs text-muted-foreground">Suggestions completed</div>
        </div>
      </div>

      {/* Latest AI Insights */}
      <div className="p-6 card-elegant">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-accent/10 rounded-lg">
            <Brain className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h4 className="font-semibold">Latest AI Insights</h4>
            <p className="text-sm text-muted-foreground">Generated based on your current financial data</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {suggestionsData
            .filter(s => s.status === 'pending' && s.priority === 'high')
            .slice(0, 4)
            .map(suggestion => (
              <div key={suggestion.id} className="p-4 rounded-lg bg-secondary/30 border border-border/50">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getPriorityIcon(suggestion.priority)}
                    <Badge variant="outline" className={`text-xs ${getCategoryColor(suggestion.category)}`}>
                      {suggestion.category}
                    </Badge>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {suggestion.status}
                  </Badge>
                </div>
                <p className="text-sm text-foreground leading-relaxed">
                  {suggestion.suggestion}
                </p>
                <div className="text-xs text-muted-foreground mt-2">
                  Generated on {new Date(suggestion.date).toLocaleDateString()}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* AI Suggestions Table */}
      <EditableTable
        title="AI Financial Suggestions"
        columns={columns}
        data={suggestionsData}
        onDataChange={setSuggestionsData}
        addButtonText="Add Manual Suggestion"
      />

      {/* Suggestions Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 card-elegant">
          <h4 className="font-semibold mb-4">Suggestions by Category</h4>
          <div className="space-y-3">
            {Object.entries(
              suggestionsData.reduce((acc, suggestion) => {
                const category = suggestion.category || 'Other';
                acc[category] = (acc[category] || 0) + 1;
                return acc;
              }, {} as Record<string, number>)
            )
            .sort(([,a], [,b]) => b - a)
            .map(([category, count]) => (
              <div key={category} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getCategoryColor(category).replace('text-', 'bg-')}`} />
                  <span className="text-sm">{category}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-20 bg-secondary rounded-full h-2">
                    <div 
                      className="h-2 bg-accent rounded-full"
                      style={{ width: `${(count / totalSuggestions) * 100}%` }}
                    />
                  </div>
                  <span className="text-financial font-semibold text-sm w-6">
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 card-elegant">
          <h4 className="font-semibold mb-4">Action Required</h4>
          <div className="space-y-3">
            {/* Critical and High Priority Pending Items */}
            {suggestionsData
              .filter(s => s.status === 'pending' && (s.priority === 'critical' || s.priority === 'high'))
              .slice(0, 3)
              .map(suggestion => (
                <div key={suggestion.id} className="p-3 rounded-lg bg-warning/10 border border-warning/20">
                  <div className="flex items-center gap-2 mb-1">
                    {getPriorityIcon(suggestion.priority)}
                    <span className="font-medium text-sm">{suggestion.category}</span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {suggestion.suggestion}
                  </p>
                  <div className="text-xs text-warning font-medium mt-1">
                    Pending since {new Date(suggestion.date).toLocaleDateString()}
                  </div>
                </div>
              ))}
              
            {/* If no pending high priority items */}
            {suggestionsData.filter(s => s.status === 'pending' && (s.priority === 'critical' || s.priority === 'high')).length === 0 && (
              <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                <div className="flex items-center gap-2 mb-1">
                  <Lightbulb className="w-4 h-4 text-success" />
                  <span className="font-medium text-sm text-success">All caught up!</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  No high-priority suggestions pending. Keep monitoring your KPIs for new opportunities.
                </p>
              </div>
            )}

            {/* Recent Completions */}
            {suggestionsData
              .filter(s => s.status === 'completed')
              .slice(0, 2)
              .map(suggestion => (
                <div key={suggestion.id} className="p-3 rounded-lg bg-success/10 border border-success/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="w-4 h-4 text-success" />
                    <span className="font-medium text-sm text-success">{suggestion.category}</span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {suggestion.suggestion}
                  </p>
                  <div className="text-xs text-success font-medium mt-1">
                    ✓ Completed
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};