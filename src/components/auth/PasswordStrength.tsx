import { useMemo } from "react";
import { Progress } from "@/components/ui/progress";

interface PasswordStrengthProps {
  password: string;
}

export const PasswordStrength = ({ password }: PasswordStrengthProps) => {
  const strength = useMemo(() => {
    if (!password) return { score: 0, text: "", color: "" };
    
    let score = 0;
    let feedback = [];
    
    // Length check
    if (password.length >= 8) score += 1;
    else feedback.push("8+ characters");
    
    // Uppercase check
    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push("uppercase letter");
    
    // Lowercase check
    if (/[a-z]/.test(password)) score += 1;
    else feedback.push("lowercase letter");
    
    // Number check
    if (/\d/.test(password)) score += 1;
    else feedback.push("number");
    
    // Special character check
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
    else feedback.push("special character");
    
    const strengthLevels = [
      { text: "Very Weak", color: "bg-destructive" },
      { text: "Weak", color: "bg-warning" },
      { text: "Fair", color: "bg-warning" },
      { text: "Good", color: "bg-primary" },
      { text: "Strong", color: "bg-success" }
    ];
    
    return {
      score: (score / 5) * 100,
      text: strengthLevels[score] ? strengthLevels[score].text : "Very Weak",
      color: strengthLevels[score] ? strengthLevels[score].color : "bg-destructive",
      feedback: feedback.length > 0 ? `Missing: ${feedback.join(", ")}` : "Password meets all requirements"
    };
  }, [password]);

  if (!password) return null;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">Password Strength</span>
        <span className={`text-sm font-medium ${
          strength.score >= 80 ? "text-success" : 
          strength.score >= 60 ? "text-primary" : 
          strength.score >= 40 ? "text-warning" : "text-destructive"
        }`}>
          {strength.text}
        </span>
      </div>
      <Progress value={strength.score} className="h-2" />
      <p className="text-xs text-muted-foreground">{strength.feedback}</p>
    </div>
  );
};