import { useState } from "react";
import { EditableTable, TableColumn, TableRow } from "./EditableTable";
import { Progress } from "@/components/ui/progress";

export const KPIsSheet = () => {
  const [kpiData, setKPIData] = useState<TableRow[]>([
    {
      id: "kpi_1",
      metricName: "Monthly Recurring Revenue (MRR)",
      value: 26700,
      target: 30000,
      status: "yellow"
    },
    {
      id: "kpi_2",
      metricName: "Customer Acquisition Cost (CAC)",
      value: 250,
      target: 200,
      status: "yellow"
    },
    {
      id: "kpi_3", 
      metricName: "Customer Lifetime Value (CLV)",
      value: 2400,
      target: 2000,
      status: "green"
    },
    {
      id: "kpi_4",
      metricName: "Gross Profit Margin %",
      value: 83.3,
      target: 80,
      status: "green"
    },
    {
      id: "kpi_5",
      metricName: "Cash Runway (months)",
      value: 14.3,
      target: 12,
      status: "green"
    },
    {
      id: "kpi_6",
      metricName: "Debt-to-Revenue Ratio",
      value: 2.3,
      target: 2.0,
      status: "yellow"
    },
    {
      id: "kpi_7",
      metricName: "Monthly Active Customers",
      value: 45,
      target: 50,
      status: "yellow"
    },
    {
      id: "kpi_8",
      metricName: "Employee Productivity Score",
      value: 87,
      target: 90,
      status: "yellow"
    }
  ]);

  const columns: TableColumn[] = [
    {
      key: "metricName",
      label: "Metric Name",
      type: "text",
      required: true
    },
    {
      key: "value",
      label: "Current Value",
      type: "number",
      required: true
    },
    {
      key: "target",
      label: "Target Value",
      type: "number",
      required: true
    },
    {
      key: "status",
      label: "Status",
      type: "select",
      options: ["green", "yellow", "red"]
    }
  ];

  // Calculate KPI performance
  const greenKPIs = kpiData.filter(kpi => {
    const value = Number(kpi.value || 0);
    const target = Number(kpi.target || 0);
    const percentage = target > 0 ? (value / target) * 100 : 0;
    
    if (kpi.metricName?.toLowerCase().includes('cost') || 
        kpi.metricName?.toLowerCase().includes('ratio')) {
      return percentage <= 100;
    }
    return percentage >= 100;
  }).length;

  const yellowKPIs = kpiData.filter(kpi => {
    const value = Number(kpi.value || 0);
    const target = Number(kpi.target || 0);
    const percentage = target > 0 ? (value / target) * 100 : 0;
    
    if (kpi.metricName?.toLowerCase().includes('cost') || 
        kpi.metricName?.toLowerCase().includes('ratio')) {
      return percentage > 100 && percentage <= 120;
    }
    return percentage >= 80 && percentage < 100;
  }).length;

  const redKPIs = kpiData.length - greenKPIs - yellowKPIs;
  const overallScore = ((greenKPIs * 100 + yellowKPIs * 60) / kpiData.length);

  return (
    <div className="space-y-6">
      {/* KPI Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-success/10 border border-success/20">
          <div className="text-sm text-success font-medium">On Target</div>
          <div className="text-2xl font-bold text-financial text-success">
            {greenKPIs}
          </div>
          <div className="text-xs text-muted-foreground">KPIs meeting goals</div>
        </div>
        <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
          <div className="text-sm text-warning font-medium">At Risk</div>
          <div className="text-2xl font-bold text-financial text-warning">
            {yellowKPIs}
          </div>
          <div className="text-xs text-muted-foreground">KPIs need attention</div>
        </div>
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
          <div className="text-sm text-destructive font-medium">Critical</div>
          <div className="text-2xl font-bold text-financial text-destructive">
            {redKPIs}
          </div>
          <div className="text-xs text-muted-foreground">KPIs below target</div>
        </div>
        <div className={`p-4 rounded-lg border ${
          overallScore >= 80 ? 'bg-success/10 border-success/20' :
          overallScore >= 60 ? 'bg-warning/10 border-warning/20' :
          'bg-destructive/10 border-destructive/20'
        }`}>
          <div className={`text-sm font-medium ${
            overallScore >= 80 ? 'text-success' :
            overallScore >= 60 ? 'text-warning' : 'text-destructive'
          }`}>Performance Score</div>
          <div className={`text-2xl font-bold text-financial ${
            overallScore >= 80 ? 'text-success' :
            overallScore >= 60 ? 'text-warning' : 'text-destructive'
          }`}>
            {overallScore.toFixed(0)}%
          </div>
          <div className="text-xs text-muted-foreground">Overall health</div>
        </div>
      </div>

      {/* Performance Progress */}
      <div className="p-6 card-elegant">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold">Overall KPI Performance</h4>
          <span className="text-sm text-muted-foreground">
            {greenKPIs}/{kpiData.length} targets achieved
          </span>
        </div>
        <Progress value={(greenKPIs / kpiData.length) * 100} className="h-3" />
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>Target Achievement Rate</span>
          <span>{((greenKPIs / kpiData.length) * 100).toFixed(1)}%</span>
        </div>
      </div>

      {/* KPIs Table */}
      <EditableTable
        title="Key Performance Indicators"
        columns={columns}
        data={kpiData}
        onDataChange={setKPIData}
        addButtonText="Add KPI Metric"
      />

      {/* KPI Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 card-elegant">
          <h4 className="font-semibold mb-4">Performance by Category</h4>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Financial Metrics</span>
                <span className="text-xs text-muted-foreground">4 metrics</span>
              </div>
              {kpiData
                .filter(kpi => 
                  kpi.metricName?.toLowerCase().includes('revenue') ||
                  kpi.metricName?.toLowerCase().includes('profit') ||
                  kpi.metricName?.toLowerCase().includes('runway') ||
                  kpi.metricName?.toLowerCase().includes('ratio')
                )
                .map(kpi => {
                  const value = Number(kpi.value || 0);
                  const target = Number(kpi.target || 0);
                  const percentage = target > 0 ? (value / target) * 100 : 0;
                  
                  return (
                    <div key={kpi.id} className="flex items-center justify-between text-sm">
                      <span className="truncate">{kpi.metricName}</span>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          percentage >= 100 ? 'bg-success' :
                          percentage >= 80 ? 'bg-warning' : 'bg-destructive'
                        }`} />
                        <span className="text-financial text-xs">
                          {percentage.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Customer Metrics</span>
                <span className="text-xs text-muted-foreground">3 metrics</span>
              </div>
              {kpiData
                .filter(kpi => 
                  kpi.metricName?.toLowerCase().includes('customer') ||
                  kpi.metricName?.toLowerCase().includes('cost') ||
                  kpi.metricName?.toLowerCase().includes('value')
                )
                .map(kpi => {
                  const value = Number(kpi.value || 0);
                  const target = Number(kpi.target || 0);
                  const percentage = target > 0 ? (value / target) * 100 : 0;
                  
                  return (
                    <div key={kpi.id} className="flex items-center justify-between text-sm">
                      <span className="truncate">{kpi.metricName}</span>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          percentage >= 100 ? 'bg-success' :
                          percentage >= 80 ? 'bg-warning' : 'bg-destructive'
                        }`} />
                        <span className="text-financial text-xs">
                          {percentage.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        <div className="p-6 card-elegant">
          <h4 className="font-semibold mb-4">Priority Actions</h4>
          <div className="space-y-3">
            {/* Critical KPIs that need immediate attention */}
            {kpiData
              .filter(kpi => {
                const value = Number(kpi.value || 0);
                const target = Number(kpi.target || 0);
                const percentage = target > 0 ? (value / target) * 100 : 0;
                
                if (kpi.metricName?.toLowerCase().includes('cost') || 
                    kpi.metricName?.toLowerCase().includes('ratio')) {
                  return percentage > 120;
                }
                return percentage < 80;
              })
              .slice(0, 3)
              .map(kpi => (
                <div key={kpi.id} className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <div className="font-medium text-destructive text-sm mb-1">
                    🚨 {kpi.metricName}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Current: {kpi.value} | Target: {kpi.target}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Requires immediate attention to reach target.
                  </div>
                </div>
              ))}
            
            {/* Warning KPIs */}
            {kpiData
              .filter(kpi => {
                const value = Number(kpi.value || 0);
                const target = Number(kpi.target || 0);
                const percentage = target > 0 ? (value / target) * 100 : 0;
                
                if (kpi.metricName?.toLowerCase().includes('cost') || 
                    kpi.metricName?.toLowerCase().includes('ratio')) {
                  return percentage > 100 && percentage <= 120;
                }
                return percentage >= 80 && percentage < 100;
              })
              .slice(0, 2)
              .map(kpi => (
                <div key={kpi.id} className="p-3 rounded-lg bg-warning/10 border border-warning/20">
                  <div className="font-medium text-warning text-sm mb-1">
                    ⚠️ {kpi.metricName}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Current: {kpi.value} | Target: {kpi.target}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Monitor closely to prevent decline.
                  </div>
                </div>
              ))}
              
            {/* If no critical issues, show positive message */}
            {kpiData.filter(kpi => {
              const value = Number(kpi.value || 0);
              const target = Number(kpi.target || 0);
              const percentage = target > 0 ? (value / target) * 100 : 0;
              return percentage < 80;
            }).length === 0 && (
              <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                <div className="font-medium text-success text-sm mb-1">
                  ✅ Strong Performance
                </div>
                <div className="text-xs text-muted-foreground">
                  All KPIs are meeting or approaching targets. Continue monitoring and optimizing.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};