export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      cash_flow_entries: {
        Row: {
          created_at: string | null
          id: string
          inflows: number
          month: string
          outflows: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          inflows?: number
          month: string
          outflows?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          inflows?: number
          month?: string
          outflows?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      dashboards_entries: {
        Row: {
          burn_rate: number
          cash_flow: number
          created_at: string
          id: string
          monthly_debt_payments: number
          net_profit: number
          profit_margin: number
          recent_cash_flow: number | null
          recent_expenses: number | null
          recent_pl: number | null
          recent_revenue: number | null
          recent_updated_at: string | null
          runway: number
          total_debt: number
          total_expenses: number
          total_revenue: number
          updated_at: string
          user_id: string
        }
        Insert: {
          burn_rate?: number
          cash_flow?: number
          created_at?: string
          id?: string
          monthly_debt_payments?: number
          net_profit?: number
          profit_margin?: number
          recent_cash_flow?: number | null
          recent_expenses?: number | null
          recent_pl?: number | null
          recent_revenue?: number | null
          recent_updated_at?: string | null
          runway?: number
          total_debt?: number
          total_expenses?: number
          total_revenue?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          burn_rate?: number
          cash_flow?: number
          created_at?: string
          id?: string
          monthly_debt_payments?: number
          net_profit?: number
          profit_margin?: number
          recent_cash_flow?: number | null
          recent_expenses?: number | null
          recent_pl?: number | null
          recent_revenue?: number | null
          recent_updated_at?: string | null
          runway?: number
          total_debt?: number
          total_expenses?: number
          total_revenue?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      debt_entries: {
        Row: {
          created_at: string | null
          creditor: string
          current_balance: number
          due_date: string
          id: string
          interest_rate: number
          monthly_payment: number
          notes: string | null
          original_amount: number
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          creditor: string
          current_balance: number
          due_date: string
          id?: string
          interest_rate: number
          monthly_payment: number
          notes?: string | null
          original_amount: number
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          creditor?: string
          current_balance?: number
          due_date?: string
          id?: string
          interest_rate?: number
          monthly_payment?: number
          notes?: string | null
          original_amount?: number
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      expense_entries: {
        Row: {
          amount: number
          category: string
          created_at: string | null
          date: string
          id: string
          notes: string | null
          updated_at: string | null
          user_id: string
          vendor: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string | null
          date: string
          id?: string
          notes?: string | null
          updated_at?: string | null
          user_id: string
          vendor: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string | null
          date?: string
          id?: string
          notes?: string | null
          updated_at?: string | null
          user_id?: string
          vendor?: string
        }
        Relationships: []
      }
      kpi_entries: {
        Row: {
          category: string
          created_at: string | null
          id: string
          metric_name: string
          target: number
          updated_at: string | null
          user_id: string
          value: number
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          metric_name: string
          target: number
          updated_at?: string | null
          user_id: string
          value: number
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          metric_name?: string
          target?: number
          updated_at?: string | null
          user_id?: string
          value?: number
        }
        Relationships: []
      }
      notes: {
        Row: {
          category: string
          content: string | null
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          content?: string | null
          created_at?: string
          id?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          content?: string | null
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_name: string | null
          created_at: string
          full_name: string | null
          id: string
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profit_loss_entries: {
        Row: {
          created_at: string | null
          expenses_total: number
          id: string
          month: string
          revenue_total: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expenses_total?: number
          id?: string
          month: string
          revenue_total?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expenses_total?: number
          id?: string
          month?: string
          revenue_total?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      records: {
        Row: {
          business_id: number
          created_at: string
          data: Json
          id: number
          updated_at: string
          user_id: string
        }
        Insert: {
          business_id: number
          created_at?: string
          data: Json
          id?: number
          updated_at: string
          user_id?: string
        }
        Update: {
          business_id?: number
          created_at?: string
          data?: Json
          id?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "records_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "records"
            referencedColumns: ["id"]
          },
        ]
      }
      revenue_entries: {
        Row: {
          amount: number
          category: string
          client: string
          created_at: string | null
          date: string
          id: string
          notes: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          client: string
          created_at?: string | null
          date: string
          id?: string
          notes?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          client?: string
          created_at?: string | null
          date?: string
          id?: string
          notes?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      recalc_dashboards_for_user: {
        Args: { p_user: string }
        Returns: undefined
      }
      refresh_user_dashboard: {
        Args: { p_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
