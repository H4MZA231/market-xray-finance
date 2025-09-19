import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { AuthForm } from "@/components/auth/AuthForm";
import { useAuth } from "@/hooks/useAuth";

const Auth = () => {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const { user, loading } = useAuth();

  // Redirect authenticated users to main page
  if (!loading && user) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <AuthForm 
        mode={mode} 
        onToggleMode={() => setMode(mode === "signin" ? "signup" : "signin")} 
      />
    </div>
  );
};

export default Auth;