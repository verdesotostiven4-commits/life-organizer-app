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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      accounts: {
        Row: {
          balance: number
          created_at: string
          id: string
          kind: string
          name: string
          note: string
          sort_order: number
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          kind: string
          name: string
          note?: string
          sort_order?: number
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          kind?: string
          name?: string
          note?: string
          sort_order?: number
          user_id?: string
        }
        Relationships: []
      }
      attendance: {
        Row: {
          created_at: string
          id: string
          note: string
          session_date: string
          session_id: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          note?: string
          session_date: string
          session_id: string
          status: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          note?: string
          session_date?: string
          session_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "class_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_logs: {
        Row: {
          attendance_date: string
          created_at: string | null
          id: string
          observation: string | null
          schedule_id: string | null
          status: string | null
        }
        Insert: {
          attendance_date: string
          created_at?: string | null
          id?: string
          observation?: string | null
          schedule_id?: string | null
          status?: string | null
        }
        Update: {
          attendance_date?: string
          created_at?: string | null
          id?: string
          observation?: string | null
          schedule_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_logs_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "class_schedule"
            referencedColumns: ["id"]
          },
        ]
      }
      class_schedule: {
        Row: {
          day_of_week: number
          end_time: string
          id: string
          start_time: string
          subject_id: string | null
        }
        Insert: {
          day_of_week: number
          end_time: string
          id?: string
          start_time: string
          subject_id?: string | null
        }
        Update: {
          day_of_week?: number
          end_time?: string
          id?: string
          start_time?: string
          subject_id?: string | null
        }
        Relationships: []
      }
      class_sessions: {
        Row: {
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          room: string | null
          start_time: string
          subject_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          room?: string | null
          start_time: string
          subject_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          room?: string | null
          start_time?: string
          subject_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_sessions_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_habits_log: {
        Row: {
          exercise_minutes: number | null
          exercise_type: string | null
          id: string
          log_date: string
          made_bed: boolean | null
          meditation: boolean | null
          notes: string | null
          skincare: boolean | null
          sleep_hours: number | null
          water_glasses: number | null
        }
        Insert: {
          exercise_minutes?: number | null
          exercise_type?: string | null
          id?: string
          log_date?: string
          made_bed?: boolean | null
          meditation?: boolean | null
          notes?: string | null
          skincare?: boolean | null
          sleep_hours?: number | null
          water_glasses?: number | null
        }
        Update: {
          exercise_minutes?: number | null
          exercise_type?: string | null
          id?: string
          log_date?: string
          made_bed?: boolean | null
          meditation?: boolean | null
          notes?: string | null
          skincare?: boolean | null
          sleep_hours?: number | null
          water_glasses?: number | null
        }
        Relationships: []
      }
      debts: {
        Row: {
          amount: number
          created_at: string
          direction: string
          id: string
          person: string
          reason: string
          settled_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          direction: string
          id?: string
          person: string
          reason?: string
          settled_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          direction?: string
          id?: string
          person?: string
          reason?: string
          settled_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      debts_pending: {
        Row: {
          amount: number
          due_date: string | null
          id: string
          is_settled: boolean | null
          person_or_place: string
          reason: string | null
          type: string | null
        }
        Insert: {
          amount: number
          due_date?: string | null
          id?: string
          is_settled?: boolean | null
          person_or_place: string
          reason?: string | null
          type?: string | null
        }
        Update: {
          amount?: number
          due_date?: string | null
          id?: string
          is_settled?: boolean | null
          person_or_place?: string
          reason?: string | null
          type?: string | null
        }
        Relationships: []
      }
      exam_grades: {
        Row: {
          created_at: string
          exam_date: string
          exam_name: string
          grade: number
          id: string
          max_grade: number
          subject_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          exam_date: string
          exam_name: string
          grade: number
          id?: string
          max_grade?: number
          subject_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          exam_date?: string
          exam_name?: string
          grade?: number
          id?: string
          max_grade?: number
          subject_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_grades_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      extra_expenses: {
        Row: {
          budget_id: string | null
          cost: number
          created_at: string
          expense_date: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          budget_id?: string | null
          cost: number
          created_at?: string
          expense_date: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          budget_id?: string | null
          cost?: number
          created_at?: string
          expense_date?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "extra_expenses_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "pantry_budgets"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_transactions: {
        Row: {
          account_id: string | null
          amount: number
          category: string
          created_at: string | null
          description: string | null
          destination_account_id: string | null
          id: string
          savings_amount: number | null
          savings_percentage: number | null
          type: string | null
        }
        Insert: {
          account_id?: string | null
          amount: number
          category: string
          created_at?: string | null
          description?: string | null
          destination_account_id?: string | null
          id?: string
          savings_amount?: number | null
          savings_percentage?: number | null
          type?: string | null
        }
        Update: {
          account_id?: string | null
          amount?: number
          category?: string
          created_at?: string | null
          description?: string | null
          destination_account_id?: string | null
          id?: string
          savings_amount?: number | null
          savings_percentage?: number | null
          type?: string | null
        }
        Relationships: []
      }
      grades: {
        Row: {
          date: string | null
          evaluation_name: string
          id: string
          max_score: number | null
          score: number
          subject_id: string | null
        }
        Insert: {
          date?: string | null
          evaluation_name: string
          id?: string
          max_score?: number | null
          score: number
          subject_id?: string | null
        }
        Update: {
          date?: string | null
          evaluation_name?: string
          id?: string
          max_score?: number | null
          score?: number
          subject_id?: string | null
        }
        Relationships: []
      }
      grocery_budgets: {
        Row: {
          budgeted_amount: number
          category: string
          id: string
          month_year: string
        }
        Insert: {
          budgeted_amount?: number
          category: string
          id?: string
          month_year: string
        }
        Update: {
          budgeted_amount?: number
          category?: string
          id?: string
          month_year?: string
        }
        Relationships: []
      }
      grocery_items: {
        Row: {
          actual_cost: number | null
          category: string
          id: string
          is_extra: boolean | null
          name: string
          planned_cost: number
          purchase_date: string | null
          purchased: boolean | null
        }
        Insert: {
          actual_cost?: number | null
          category: string
          id?: string
          is_extra?: boolean | null
          name: string
          planned_cost?: number
          purchase_date?: string | null
          purchased?: boolean | null
        }
        Update: {
          actual_cost?: number | null
          category?: string
          id?: string
          is_extra?: boolean | null
          name?: string
          planned_cost?: number
          purchase_date?: string | null
          purchased?: boolean | null
        }
        Relationships: []
      }
      pantry_budgets: {
        Row: {
          budget: number
          created_at: string
          id: string
          is_active: boolean
          user_id: string
          weeks: number
        }
        Insert: {
          budget?: number
          created_at?: string
          id?: string
          is_active?: boolean
          user_id: string
          weeks?: number
        }
        Update: {
          budget?: number
          created_at?: string
          id?: string
          is_active?: boolean
          user_id?: string
          weeks?: number
        }
        Relationships: []
      }
      pantry_category_expenses: {
        Row: {
          amount: number
          budget_id: string | null
          category: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          budget_id?: string | null
          category: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          budget_id?: string | null
          category?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pantry_category_expenses_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "pantry_budgets"
            referencedColumns: ["id"]
          },
        ]
      }
      practice_logs: {
        Row: {
          created_at: string
          description: string
          hours: number
          id: string
          practice_date: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description: string
          hours?: number
          id?: string
          practice_date: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          hours?: number
          id?: string
          practice_date?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string
          id: string
          role: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string
          id: string
          role?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string
          id?: string
          role?: string
        }
        Relationships: []
      }
      shopping_items: {
        Row: {
          budget_id: string | null
          category: string
          checked: boolean
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          budget_id?: string | null
          category: string
          checked?: boolean
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          budget_id?: string | null
          category?: string
          checked?: boolean
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shopping_items_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "pantry_budgets"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          created_at: string
          id: string
          is_practice: boolean
          name: string
          sort_order: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_practice?: boolean
          name: string
          sort_order?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_practice?: boolean
          name?: string
          sort_order?: number
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          category: string
          completed: boolean
          completed_at: string | null
          created_at: string
          due_date: string | null
          id: string
          priority: number
          subject_id: string | null
          title: string
          user_id: string
        }
        Insert: {
          category: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          priority?: number
          subject_id?: string | null
          title: string
          user_id: string
        }
        Update: {
          category?: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          priority?: number
          subject_id?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          account_id: string
          amount: number
          created_at: string
          description: string
          id: string
          main_category: string | null
          net_amount: number
          savings_amount: number
          savings_pct: number
          sub_category: string | null
          to_account_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          account_id: string
          amount: number
          created_at?: string
          description: string
          id?: string
          main_category?: string | null
          net_amount?: number
          savings_amount?: number
          savings_pct?: number
          sub_category?: string | null
          to_account_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          account_id?: string
          amount?: number
          created_at?: string
          description?: string
          id?: string
          main_category?: string | null
          net_amount?: number
          savings_amount?: number
          savings_pct?: number
          sub_category?: string | null
          to_account_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_to_account_id_fkey"
            columns: ["to_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      water_logs: {
        Row: {
          cups: number
          id: string
          log_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cups?: number
          id?: string
          log_date: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cups?: number
          id?: string
          log_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      workout_logs: {
        Row: {
          created_at: string
          id: string
          minutes: number
          muscle_group: string
          note: string
          user_id: string
          workout_date: string
        }
        Insert: {
          created_at?: string
          id?: string
          minutes?: number
          muscle_group: string
          note?: string
          user_id: string
          workout_date: string
        }
        Update: {
          created_at?: string
          id?: string
          minutes?: number
          muscle_group?: string
          note?: string
          user_id?: string
          workout_date?: string
        }
        Relationships: []
      }
    }
    Views: {
      attendance_aggregate: {
        Row: {
          attendance_pct: number | null
          attended: number | null
          cancelled: number | null
          missed: number | null
          subject_id: string | null
          subject_name: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "class_sessions_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      record_transaction: {
        Args: {
          p_account_id: string
          p_amount: number
          p_description: string
          p_main_category?: string
          p_savings_pct?: number
          p_sub_category?: string
          p_to_account_id?: string
          p_type: string
        }
        Returns: string
      }
      seed_initial_data: { Args: never; Returns: undefined }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
