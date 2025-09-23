import { Navigate } from "react-router-dom";
import { SpreadsheetView } from "@/components/SpreadsheetView";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";

const Index = () => {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-6">
          <div className="flex items-center space-x-3">
            <User className="h-5 w-5 text-primary" />
            <span className="font-medium text-lg">{user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}</span>
          </div>
          <Button variant="outline" size="sm" onClick={signOut} className="ml-8">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>
      <SpreadsheetView />
    </div>
  );
};

export default Index;
