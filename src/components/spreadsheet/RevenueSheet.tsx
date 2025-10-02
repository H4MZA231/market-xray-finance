import { useState, useEffect } from "react";
import { EditableTable, TableColumn, TableRow } from "./EditableTable";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export const RevenueSheet = () => {
  const [revenueData, setRevenueData] = useState<TableRow[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    fetchRevenueData();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('revenue-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'revenue_entries', filter: `user_id=eq.${user.id}` }, fetchRevenueData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchRevenueData = async () => {
    const { data, error } = await supabase
      .from('revenue_entries')
      .select('*')
      .eq('user_id', user?.id)
      .order('date', { ascending: false });

    if (error) {
      toast({
        title: "Error loading revenue data",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setRevenueData(data.map(entry => ({
        id: entry.id,
        date: entry.date,
        client: entry.client,
        category: entry.category,
        amount: entry.amount,
        notes: entry.notes || ''
      })));
    }
  };

  const handleDataChange = async (newData: TableRow[]) => {
    const prevData = revenueData;
    setRevenueData(newData);

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to save data",
        variant: "destructive",
      });
      return;
    }

    const addedRows = newData.filter(r => !prevData.some(p => p.id === r.id));
    const removedRows = prevData.filter(p => !newData.some(r => r.id === p.id));
    const updatedRows = newData.filter(r => {
      const prev = prevData.find(p => p.id === r.id);
      return prev && JSON.stringify(prev) !== JSON.stringify(r);
    });

    let mutated = false;

    for (const row of updatedRows) {
      const isTemp = typeof row.id === 'string' && row.id.startsWith('temp_');
      if (isTemp) {
        if (!row.date || !row.client || !row.category || row.amount === '' || row.amount === null || row.amount === undefined) {
          continue;
        }
        const { error } = await supabase
          .from('revenue_entries')
          .insert({
            user_id: user.id,
            date: row.date,
            client: row.client,
            category: row.category,
            amount: Number(row.amount),
            notes: row.notes || null,
          });
        if (error) {
          console.error('Insert error:', error);
          toast({ title: "Error saving revenue entry", description: error.message, variant: "destructive" });
        } else {
          mutated = true;
        }
      } else {
        const { error } = await supabase
          .from('revenue_entries')
          .update({
            date: row.date,
            client: row.client,
            category: row.category,
            amount: Number(row.amount),
            notes: row.notes || null,
          })
          .eq('id', row.id)
          .eq('user_id', user.id);
        if (error) {
          console.error('Update error:', error);
          toast({ title: "Error updating revenue entry", description: error.message, variant: "destructive" });
        } else {
          mutated = true;
        }
      }
    }

    for (const row of removedRows) {
      if (typeof row.id === 'string' && row.id.startsWith('temp_')) continue;
      const { error } = await supabase.from('revenue_entries').delete().eq('id', row.id).eq('user_id', user.id);
      if (error) {
        console.error('Delete error:', error);
        toast({ title: "Error deleting revenue entry", description: error.message, variant: "destructive" });
      } else {
        mutated = true;
      }
    }

    if (mutated) {
      await fetchRevenueData();
    }
  };

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
        onDataChange={handleDataChange}
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