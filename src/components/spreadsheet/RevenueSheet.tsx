import { useState } from "react";
import { EditableTable, TableColumn, TableRow } from "./EditableTable";

export const RevenueSheet = () => {
  const [revenueData, setRevenueData] = useState<TableRow[]>([
    {
      id: "rev_1",
      date: "2024-01-15",
      client: "TechCorp Solutions",
      category: "Consulting",
      amount: 15000,
      notes: "Q1 strategy consulting project"
    },
    {
      id: "rev_2", 
      date: "2024-01-20",
      client: "StartupXYZ",
      category: "Software Development",
      amount: 8500,
      notes: "Mobile app development phase 1"
    },
    {
      id: "rev_3",
      date: "2024-01-28",
      client: "Enterprise Inc",
      category: "Training",
      amount: 3200,
      notes: "Team training workshop"
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
      key: "client",
      label: "Client/Source", 
      type: "text",
      required: true
    },
    {
      key: "category",
      label: "Category",
      type: "select",
      options: [
        "Consulting",
        "Software Development", 
        "Training",
        "Maintenance",
        "Support",
        "Product Sales",
        "Licensing",
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

  const totalRevenue = revenueData.reduce((sum, row) => sum + Number(row.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Revenue Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-success/10 border border-success/20">
          <div className="text-sm text-success font-medium">Total Revenue</div>
          <div className="text-2xl font-bold text-financial text-success">
            ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
          <div className="text-sm text-accent font-medium">Number of Clients</div>
          <div className="text-2xl font-bold text-financial text-accent">
            {new Set(revenueData.map(row => row.client)).size}
          </div>
        </div>
        <div className="p-4 rounded-lg bg-secondary/50 border border-border">
          <div className="text-sm text-muted-foreground font-medium">Average Deal Size</div>
          <div className="text-2xl font-bold text-financial">
            ${revenueData.length > 0 ? (totalRevenue / revenueData.length).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
          </div>
        </div>
      </div>

      {/* Revenue Table */}
      <EditableTable
        title="Revenue Tracking"
        columns={columns}
        data={revenueData}
        onDataChange={setRevenueData}
        addButtonText="Add Revenue Entry"
      />

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 card-elegant">
          <h4 className="font-semibold mb-4">Revenue by Category</h4>
          <div className="space-y-3">
            {Object.entries(
              revenueData.reduce((acc, row) => {
                const category = row.category || 'Uncategorized';
                acc[category] = (acc[category] || 0) + Number(row.amount || 0);
                return acc;
              }, {} as Record<string, number>)
            ).map(([category, amount]) => (
              <div key={category} className="flex items-center justify-between">
                <span className="text-sm">{category}</span>
                <span className="text-financial font-semibold text-success">
                  ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 card-elegant">
          <h4 className="font-semibold mb-4">Top Clients</h4>
          <div className="space-y-3">
            {Object.entries(
              revenueData.reduce((acc, row) => {
                const client = row.client || 'Unknown';
                acc[client] = (acc[client] || 0) + Number(row.amount || 0);
                return acc;
              }, {} as Record<string, number>)
            )
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([client, amount]) => (
              <div key={client} className="flex items-center justify-between">
                <span className="text-sm truncate">{client}</span>
                <span className="text-financial font-semibold text-success">
                  ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};