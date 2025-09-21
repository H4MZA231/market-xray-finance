import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
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
  const { user } = useAuth();

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
    <div className="min-h-screen bg-background p-1 xs:p-2 sm:p-4 md:p-6">
      <div className="max-w-full xl:max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-3 xs:mb-4 sm:mb-6">
          <div className="flex items-center justify-between gap-2 xs:gap-3 sm:gap-4 mb-2">
            <div className="flex items-center gap-2 xs:gap-3 sm:gap-4 min-w-0 flex-1">
              <div className="p-1 xs:p-1.5 sm:p-2 bg-accent/10 rounded-lg flex-shrink-0">
                <FileSpreadsheet className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-accent" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-sm xs:text-lg sm:text-2xl lg:text-3xl font-bold text-foreground truncate">
                  Business Finance Spreadsheet
                </h1>
                <p className="text-[10px] xs:text-xs sm:text-sm text-muted-foreground truncate">
                  Fully editable financial tracking and analysis
                </p>
              </div>
            </div>
            <div className="hidden xs:block text-right">
              <p className="text-xs xs:text-sm sm:text-base font-medium text-foreground">
                Welcome, {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
              </p>
            </div>
          </div>
        </div>

        {/* Spreadsheet Tabs */}
        <Card className="card-elegant p-0.5 xs:p-1 sm:p-2 overflow-hidden">
          <Tabs value={activeSheet} onValueChange={setActiveSheet} className="w-full">
            {/* Mobile/iPhone: 2 columns, iPad: 4 columns, Desktop: 8 columns */}
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-0.5 xs:gap-1 bg-secondary/50 p-0.5 xs:p-1 h-auto overflow-x-auto">
              {sheets.map((sheet) => {
                const Icon = sheet.icon;
                return (
                  <TabsTrigger 
                    key={sheet.id} 
                    value={sheet.id}
                    className="flex flex-col xs:flex-row md:flex-col xl:flex-row items-center justify-center gap-1 xs:gap-2 px-1 xs:px-2 sm:px-3 py-1.5 xs:py-2 text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm min-h-[50px] xs:min-h-[60px] sm:min-h-[50px] xl:min-h-[40px] transition-all duration-200"
                  >
                    <Icon className={`w-3 h-3 xs:w-4 xs:h-4 ${sheet.color} flex-shrink-0`} />
                    <span className="text-center text-[9px] xs:text-[10px] sm:text-xs leading-tight whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
                      {sheet.label.split('/')[0]}
                    </span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <div className="mt-2 sm:mt-4">
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