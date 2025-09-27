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

export function SpreadsheetView() {
  const { user } = useAuth();
  const [records, setRecords] = useState<any[]>([]);
  const [form, setForm] = useState({ date: "", category: "", amount: "", notes: "" });

  // ✅ Fetch only the logged-in user's data
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id) // ✅ filter by user_id
        .order("date", { ascending: false });

      if (error) {
        console.error("Error fetching data:", error);
      } else {
        setRecords(data || []); // ✅ empty if no data yet
      }
    };

    fetchData();
  }, [user]);

  // ✅ Add a new record
  const addRecord = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("transactions")
      .insert([
        {
          user_id: user.id,
          date: form.date,
          category: form.category,
          amount: parseFloat(form.amount),
          notes: form.notes,
        },
      ])
      .select();

    if (error) {
      console.error("Error adding record:", error);
    } else {
      setRecords((prev) => [...data, ...prev]);
      setForm({ date: "", category: "", amount: "", notes: "" }); // reset form
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Business Dashboard</h2>

      {/* ✅ Add Record Form */}
      <div className="grid grid-cols-5 gap-2 mb-6">
        <Input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
        />
        <Input
          placeholder="Category"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        />
        <Input
          type="number"
          placeholder="Amount"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
        />
        <Input
          placeholder="Notes"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
        <Button onClick={addRecord}>Add</Button>
      </div>

      {/* ✅ Records Table */}
      {records.length === 0 ? (
        <p>No records yet. Start adding your business data!</p>
      ) : (
        <table className="w-full border">
          <thead>
            <tr>
              <th className="border px-4 py-2">Date</th>
              <th className="border px-4 py-2">Category</th>
              <th className="border px-4 py-2">Amount</th>
              <th className="border px-4 py-2">Notes</th>
            </tr>
          </thead>
          <tbody>
            {records.map((row) => (
              <tr key={row.id}>
                <td className="border px-4 py-2">{row.date}</td>
                <td className="border px-4 py-2">{row.category}</td>
                <td className="border px-4 py-2">{row.amount}</td>
                <td className="border px-4 py-2">{row.notes}</td>
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
