import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { 
  FileSpreadsheet,
  DollarSign,
  Receipt,
  CreditCard,
  TrendingUp,
  BarChart3,
  Target,
  Brain
} from "lucide-react";
import { RevenueSheet } from "./spreadsheet/RevenueSheet";
import { ExpensesSheet } from "./spreadsheet/ExpensesSheet";
import { DebtSheet } from "./spreadsheet/DebtSheet";
import { ProfitLossSheet } from "./spreadsheet/ProfitLossSheet";
import { CashFlowSheet } from "./spreadsheet/CashFlowSheet";
import { KPIsSheet } from "./spreadsheet/KPIsSheet";
import { AISuggestionsSheet } from "./spreadsheet/AISuggestionsSheet";
import { DashboardSheet } from "./spreadsheet/DashboardSheet";

export const SpreadsheetView = () => {
  const [activeSheet, setActiveSheet] = useState("dashboard");

  const sheets = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3, color: "text-accent" },
    { id: "revenue", label: "Revenue", icon: DollarSign, color: "text-success" },
    { id: "expenses", label: "Expenses", icon: Receipt, color: "text-destructive" },
    { id: "debts", label: "Debts/Loans", icon: CreditCard, color: "text-warning" },
    { id: "profitloss", label: "P&L", icon: TrendingUp, color: "text-success" },
    { id: "cashflow", label: "Cash Flow", icon: BarChart3, color: "text-accent" },
    { id: "kpis", label: "KPIs/Metrics", icon: Target, color: "text-accent" },
    { id: "aisuggestions", label: "AI Suggestions", icon: Brain, color: "text-accent" }
  ];

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-accent/10 rounded-lg">
              <FileSpreadsheet className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Business Finance Spreadsheet</h1>
              <p className="text-muted-foreground">Fully editable financial tracking and analysis</p>
            </div>
          </div>
        </div>

        {/* Spreadsheet Tabs */}
        <Card className="card-elegant p-1">
          <Tabs value={activeSheet} onValueChange={setActiveSheet} className="w-full">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 gap-1 bg-secondary/50 p-1">
              {sheets.map((sheet) => {
                const Icon = sheet.icon;
                return (
                  <TabsTrigger 
                    key={sheet.id} 
                    value={sheet.id}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    <Icon className={`w-4 h-4 ${sheet.color}`} />
                    <span className="hidden sm:inline">{sheet.label}</span>
                    <span className="sm:hidden">{sheet.label.split('/')[0]}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <div className="mt-4">
              <TabsContent value="dashboard" className="mt-0">
                <DashboardSheet />
              </TabsContent>
              
              <TabsContent value="revenue" className="mt-0">
                <RevenueSheet />
              </TabsContent>
              
              <TabsContent value="expenses" className="mt-0">
                <ExpensesSheet />
              </TabsContent>
              
              <TabsContent value="debts" className="mt-0">
                <DebtSheet />
              </TabsContent>
              
              <TabsContent value="profitloss" className="mt-0">
                <ProfitLossSheet />
              </TabsContent>
              
              <TabsContent value="cashflow" className="mt-0">
                <CashFlowSheet />
              </TabsContent>
              
              <TabsContent value="kpis" className="mt-0">
                <KPIsSheet />
              </TabsContent>
              
              <TabsContent value="aisuggestions" className="mt-0">
                <AISuggestionsSheet />
              </TabsContent>
            </div>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};