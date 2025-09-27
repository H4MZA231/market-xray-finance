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
      import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Transaction {
  id: string;
  date: string;
  category: string;
  amount: number;
  notes: string;
}

export function SpreadsheetView() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [notes, setNotes] = useState("");

  // Fetch per-user transactions
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from<Transaction>("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (error) console.error("Error fetching transactions:", error);
      else setTransactions(data || []);
      setLoading(false);
    };

    fetchData();

    // Optional: subscribe to live changes
    const subscription = supabase
      .from(`transactions:user_id=eq.${user.id}`)
      .on("*", () => fetchData())
      .subscribe();

    return () => {
      supabase.removeSubscription(subscription);
    };
  }, [user]);

  // Add new transaction
  const handleAdd = async () => {
    if (!date || !category || amount === "") return;

    const { error } = await supabase.from("transactions").insert([
      {
        user_id: user.id,
        date,
        category,
        amount: Number(amount),
        notes,
      },
    ]);

    if (error) console.error("Error adding transaction:", error);
    else {
      setDate("");
      setCategory("");
      setAmount("");
      setNotes("");
    }
  };

  // Calculate totals
  const totalRevenue = transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + t.amount, 0);
  const profit = totalRevenue + totalExpenses;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Business Dashboard</h2>

      {/* Totals */}
      <div className="flex space-x-4 mb-6">
        <div>Revenue: <span className="text-green-600">{totalRevenue}</span></div>
        <div>Expenses: <span className="text-red-600">{totalExpenses}</span></div>
        <div>Profit: <span className={profit >= 0 ? "text-green-600" : "text-red-600"}>{profit}</span></div>
      </div>

      {/* Add Transaction Form */}
      <div className="mb-6 flex space-x-2">
        <Input type="date" value={date} onChange={e => setDate(e.target.value)} placeholder="Date" />
        <Input type="text" value={category} onChange={e => setCategory(e.target.value)} placeholder="Category" />
        <Input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} placeholder="Amount" />
        <Input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes" />
        <Button onClick={handleAdd}>Add</Button>
      </div>

      {/* Transactions Table */}
      {loading ? (
        <div>Loading...</div>
      ) : transactions.length === 0 ? (
        <div>No transactions yet.</div>
      ) : (
        <table className="w-full border-collapse border">
          <thead>
            <tr>
              <th className="border p-2">Date</th>
              <th className="border p-2">Category</th>
              <th className="border p-2">Amount</th>
              <th className="border p-2">Notes</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(t => (
              <tr key={t.id}>
                <td className="border p-2">{t.date}</td>
                <td className="border p-2">{t.category}</td>
                <td className={`border p-2 ${t.amount >= 0 ? "text-green-600" : "text-red-600"}`}>{t.amount}</td>
                <td className="border p-2">{t.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
    </div>
  );
};

export default Index;
