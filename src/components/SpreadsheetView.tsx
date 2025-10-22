import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  FileSpreadsheet,
  DollarSign,
  Settings,
  Receipt,
  CreditCard,
  TrendingUp,
  BarChart3,
  Target,
  Brain,
  Eye,
  EyeOff
} from "lucide-react";
import { RevenueSheet } from "./spreadsheet/RevenueSheet";
import { ExpensesSheet } from "./spreadsheet/ExpensesSheet";
import { DebtSheet } from "./spreadsheet/DebtSheet";
import { ProfitLossSheet } from "./spreadsheet/ProfitLossSheet";
import { CashFlowSheet } from "./spreadsheet/CashFlowSheet";
import { KPIsSheet } from "./spreadsheet/KPIsSheet";
import { NotesSheet } from "./spreadsheet/NotesSheet";
import { DashboardSheet } from "./spreadsheet/DashboardSheet";

export const SpreadsheetView = () => {
  const [activeSheet, setActiveSheet] = useState("dashboard");
  const { user } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handlePasswordChange = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    setIsChangingPassword(true);
    
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Password updated successfully",
      });
      setNewPassword("");
      setShowPassword(false);
    }

    setIsChangingPassword(false);
  };

  const sheets = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3, color: "text-accent" },
    { id: "revenue", label: "Revenue", icon: DollarSign, color: "text-success" },
    { id: "expenses", label: "Expenses", icon: Receipt, color: "text-destructive" },
    { id: "debts", label: "Debts/Loans", icon: CreditCard, color: "text-warning" },
    { id: "profitloss", label: "P&L", icon: TrendingUp, color: "text-success" },
    { id: "cashflow", label: "Cash Flow", icon: BarChart3, color: "text-accent" },
    { id: "kpis", label: "KPIs/Metrics", icon: Target, color: "text-accent" },
    { id: "notes", label: "Notes", icon: Brain, color: "text-accent" }
  ];

  return (
    <div className="min-h-screen bg-background p-2 sm:p-4 md:p-6">
      <div className="max-w-full xl:max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center justify-between gap-3 sm:gap-4 mb-3">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
              <div className="p-2 sm:p-2 bg-accent/10 rounded-xl flex-shrink-0">
                <FileSpreadsheet className="w-6 h-6 sm:w-6 sm:h-6 text-accent" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-foreground truncate">
                  Business Finance Spreadsheet
                </h1>
                <p className="text-sm sm:text-sm text-muted-foreground truncate mt-1">
                  Fully editable financial tracking and analysis
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden xs:block text-right">
                <p className="text-sm sm:text-base font-medium text-foreground">
                  Welcome, {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
                </p>
              </div>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="default" className="flex-shrink-0 h-10">
                    <Settings className="w-5 h-5" />
                    <span className="hidden sm:inline ml-2">Settings</span>
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Settings</SheetTitle>
                    <SheetDescription>
                      Manage your account settings and preferences.
                    </SheetDescription>
                  </SheetHeader>
                  
                  <div className="mt-6 space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Account & Password</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Email</label>
                          <div className="mt-1 p-3 bg-muted rounded-md">
                            <p className="text-sm">{user?.email}</p>
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Change Password</label>
                          <div className="mt-1 relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter new password (min 6 characters)"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="pr-10"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                          </div>
                          <Button 
                            onClick={handlePasswordChange}
                            disabled={isChangingPassword || !newPassword}
                            className="mt-2 w-full"
                          >
                            {isChangingPassword ? "Updating..." : "Update Password"}
                          </Button>
                        </div>
                        
                        <Separator />
                        
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                          <div className="mt-1 p-3 bg-muted rounded-md">
                            <p className="text-sm">{user?.user_metadata?.full_name || 'Not provided'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {/* Spreadsheet Tabs */}
        <Card className="card-elegant p-1 sm:p-2 overflow-hidden">
          <Tabs value={activeSheet} onValueChange={setActiveSheet} className="w-full">
            {/* Mobile: 2 columns, Tablet: 4 columns, Desktop: 8 columns */}
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-1 bg-secondary/50 p-1 h-auto overflow-x-auto">
              {sheets.map((sheet) => {
                const Icon = sheet.icon;
                return (
                  <TabsTrigger 
                    key={sheet.id} 
                    value={sheet.id}
                    className="flex flex-col items-center justify-center gap-2 px-3 py-3 text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm min-h-[70px] sm:min-h-[60px] xl:min-h-[50px] transition-all duration-200 rounded-lg"
                  >
                    <Icon className={`w-5 h-5 sm:w-4 sm:h-4 ${sheet.color} flex-shrink-0`} />
                    <span className="text-center text-xs sm:text-xs leading-tight whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
                      {sheet.label.split('/')[0]}
                    </span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <div className="mt-4 sm:mt-4">
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
              
              <TabsContent value="notes" className="mt-0">
                <NotesSheet />
              </TabsContent>
            </div>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};