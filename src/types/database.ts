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
          household_id: string
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
          household_id: string
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
          household_id?: string
          id?: string
          kind?: string
          name?: string
          note?: string
          sort_order?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounts_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance: {
        Row: {
          created_at: string
          household_id: string
          id: string
          note: string
          session_date: string
          session_id: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          household_id: string
          id?: string
          note?: string
          session_date: string
          session_id: string
          status: string
          user_id: string
        }
        Update: {
          created_at?: string
          household_id?: string
          id?: string
          note?: string
          session_date?: string
          session_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
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
          household_id: string
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
          household_id: string
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
          household_id?: string
          id?: string
          room?: string | null
          start_time?: string
          subject_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_sessions_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
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
          household_id: string
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
          household_id: string
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
          household_id?: string
          id?: string
          person?: string
          reason?: string
          settled_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "debts_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
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
          household_id: string
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
          household_id: string
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
          household_id?: string
          id?: string
          max_grade?: number
          subject_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_grades_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
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
          household_id: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          budget_id?: string | null
          cost: number
          created_at?: string
          expense_date: string
          household_id: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          budget_id?: string | null
          cost?: number
          created_at?: string
          expense_date?: string
          household_id?: string
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
          {
            foreignKeyName: "extra_expenses_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
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
      household_invites: {
        Row: {
          code_hash: string
          created_at: string
          created_by: string
          expires_at: string
          household_id: string
          id: string
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          code_hash: string
          created_at?: string
          created_by: string
          expires_at?: string
          household_id: string
          id?: string
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          code_hash?: string
          created_at?: string
          created_by?: string
          expires_at?: string
          household_id?: string
          id?: string
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "household_invites_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      household_members: {
        Row: {
          household_id: string
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          household_id: string
          joined_at?: string
          role?: string
          user_id: string
        }
        Update: {
          household_id?: string
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "household_members_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      household_purchase_items: {
        Row: {
          created_at: string
          created_by: string
          household_id: string
          id: string
          list_id: string
          name: string
          note: string
          purchased_at: string | null
          purchased_by: string | null
          quantity: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          household_id: string
          id?: string
          list_id: string
          name: string
          note?: string
          purchased_at?: string | null
          purchased_by?: string | null
          quantity?: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          household_id?: string
          id?: string
          list_id?: string
          name?: string
          note?: string
          purchased_at?: string | null
          purchased_by?: string | null
          quantity?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "household_purchase_items_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "household_purchase_items_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "household_purchase_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      household_purchase_lists: {
        Row: {
          active: boolean
          created_at: string
          created_by: string
          household_id: string
          id: string
          location: string
          name: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          created_by: string
          household_id: string
          id?: string
          location?: string
          name?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          created_by?: string
          household_id?: string
          id?: string
          location?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "household_purchase_lists_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      households: {
        Row: {
          created_at: string
          id: string
          name: string
          owner_id: string
          timezone: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string
          owner_id: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          academics: boolean
          advance_minutes: number
          browser_enabled: boolean
          enabled: boolean
          household_id: string
          purchases: boolean
          quiet_end: string
          quiet_start: string
          schedule: boolean
          tasks: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          academics?: boolean
          advance_minutes?: number
          browser_enabled?: boolean
          enabled?: boolean
          household_id: string
          purchases?: boolean
          quiet_end?: string
          quiet_start?: string
          schedule?: boolean
          tasks?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          academics?: boolean
          advance_minutes?: number
          browser_enabled?: boolean
          enabled?: boolean
          household_id?: string
          purchases?: boolean
          quiet_end?: string
          quiet_start?: string
          schedule?: boolean
          tasks?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          dedupe_key: string | null
          household_id: string
          href: string
          id: string
          push_attempted_at: string | null
          push_attempts: number
          push_sent_at: string | null
          read_at: string | null
          recipient_user_id: string
          title: string
          type: string
        }
        Insert: {
          body?: string
          created_at?: string
          dedupe_key?: string | null
          household_id: string
          href?: string
          id?: string
          push_attempted_at?: string | null
          push_attempts?: number
          push_sent_at?: string | null
          read_at?: string | null
          recipient_user_id: string
          title: string
          type: string
        }
        Update: {
          body?: string
          created_at?: string
          dedupe_key?: string | null
          household_id?: string
          href?: string
          id?: string
          push_attempted_at?: string | null
          push_attempts?: number
          push_sent_at?: string | null
          read_at?: string | null
          recipient_user_id?: string
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      pantry_budgets: {
        Row: {
          budget: number
          created_at: string
          household_id: string
          id: string
          is_active: boolean
          user_id: string
          weeks: number
        }
        Insert: {
          budget?: number
          created_at?: string
          household_id: string
          id?: string
          is_active?: boolean
          user_id: string
          weeks?: number
        }
        Update: {
          budget?: number
          created_at?: string
          household_id?: string
          id?: string
          is_active?: boolean
          user_id?: string
          weeks?: number
        }
        Relationships: [
          {
            foreignKeyName: "pantry_budgets_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: true
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      pantry_category_expenses: {
        Row: {
          amount: number
          budget_id: string | null
          category: string
          household_id: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          budget_id?: string | null
          category: string
          household_id: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          budget_id?: string | null
          category?: string
          household_id?: string
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
          {
            foreignKeyName: "pantry_category_expenses_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      planner_documents: {
        Row: {
          accent: string
          content: Json
          created_at: string
          household_id: string
          id: string
          template_key: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          accent?: string
          content?: Json
          created_at?: string
          household_id: string
          id?: string
          template_key: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          accent?: string
          content?: Json
          created_at?: string
          household_id?: string
          id?: string
          template_key?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "planner_documents_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      practice_logs: {
        Row: {
          created_at: string
          description: string
          hours: number
          household_id: string
          id: string
          practice_date: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description: string
          hours?: number
          household_id: string
          id?: string
          practice_date: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          hours?: number
          household_id?: string
          id?: string
          practice_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "practice_logs_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
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
      push_public_config: {
        Row: {
          id: boolean
          updated_at: string
          vapid_public: string
        }
        Insert: {
          id?: boolean
          updated_at?: string
          vapid_public: string
        }
        Update: {
          id?: boolean
          updated_at?: string
          vapid_public?: string
        }
        Relationships: []
      }
      reminders: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          created_by: string
          household_id: string
          href: string
          id: string
          note: string
          remind_at: string
          title: string
          updated_at: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          created_by: string
          household_id: string
          href?: string
          id?: string
          note?: string
          remind_at: string
          title: string
          updated_at?: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          created_by?: string
          household_id?: string
          href?: string
          id?: string
          note?: string
          remind_at?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminders_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      shopping_items: {
        Row: {
          budget_id: string | null
          category: string
          checked: boolean
          created_at: string
          household_id: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          budget_id?: string | null
          category: string
          checked?: boolean
          created_at?: string
          household_id: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          budget_id?: string | null
          category?: string
          checked?: boolean
          created_at?: string
          household_id?: string
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
          {
            foreignKeyName: "shopping_items_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          created_at: string
          household_id: string
          id: string
          is_practice: boolean
          name: string
          sort_order: number
          user_id: string
        }
        Insert: {
          created_at?: string
          household_id: string
          id?: string
          is_practice?: boolean
          name: string
          sort_order?: number
          user_id: string
        }
        Update: {
          created_at?: string
          household_id?: string
          id?: string
          is_practice?: boolean
          name?: string
          sort_order?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subjects_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          category: string
          completed: boolean
          completed_at: string | null
          created_at: string
          due_date: string | null
          household_id: string
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
          household_id: string
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
          household_id?: string
          id?: string
          priority?: number
          subject_id?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
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
          household_id: string
          id: string
          main_category: string | null
          net_amount: number
          savings_amount: number
          savings_pct: number
          sub_category: string | null
          to_account_id: string | null
          type: string
          updated_at: string
          updated_by: string | null
          user_id: string
        }
        Insert: {
          account_id: string
          amount: number
          created_at?: string
          description: string
          household_id: string
          id?: string
          main_category?: string | null
          net_amount?: number
          savings_amount?: number
          savings_pct?: number
          sub_category?: string | null
          to_account_id?: string | null
          type: string
          updated_at?: string
          updated_by?: string | null
          user_id: string
        }
        Update: {
          account_id?: string
          amount?: number
          created_at?: string
          description?: string
          household_id?: string
          id?: string
          main_category?: string | null
          net_amount?: number
          savings_amount?: number
          savings_pct?: number
          sub_category?: string | null
          to_account_id?: string | null
          type?: string
          updated_at?: string
          updated_by?: string | null
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
            foreignKeyName: "transactions_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
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
          household_id: string
          id: string
          log_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cups?: number
          household_id: string
          id?: string
          log_date: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cups?: number
          household_id?: string
          id?: string
          log_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "water_logs_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      web_push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          household_id: string
          id: string
          last_error: string | null
          last_success_at: string | null
          p256dh: string
          updated_at: string
          user_agent: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          household_id: string
          id?: string
          last_error?: string | null
          last_success_at?: string | null
          p256dh: string
          updated_at?: string
          user_agent?: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          household_id?: string
          id?: string
          last_error?: string | null
          last_success_at?: string | null
          p256dh?: string
          updated_at?: string
          user_agent?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "web_push_subscriptions_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "web_push_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_logs: {
        Row: {
          created_at: string
          household_id: string
          id: string
          minutes: number
          muscle_group: string
          note: string
          user_id: string
          workout_date: string
        }
        Insert: {
          created_at?: string
          household_id: string
          id?: string
          minutes?: number
          muscle_group: string
          note?: string
          user_id: string
          workout_date: string
        }
        Update: {
          created_at?: string
          household_id?: string
          id?: string
          minutes?: number
          muscle_group?: string
          note?: string
          user_id?: string
          workout_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_logs_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      attendance_aggregate: {
        Row: {
          attendance_pct: number | null
          attended: number | null
          cancelled: number | null
          household_id: string | null
          missed: number | null
          subject_id: string | null
          subject_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "class_sessions_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
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
      delete_transaction: { Args: { p_id: string }; Returns: undefined }
      get_harmony_push_secrets: {
        Args: never
        Returns: {
          cron_token: string
          vapid_private: string
        }[]
      }
      join_household_by_code: { Args: { p_code: string }; Returns: string }
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
      store_harmony_push_secrets: {
        Args: { p_cron: string; p_private: string; p_public: string }
        Returns: undefined
      }
      update_transaction: {
        Args: {
          p_account_id: string
          p_amount: number
          p_description: string
          p_id: string
          p_main_category?: string
          p_savings_pct?: number
          p_sub_category?: string
          p_to_account_id?: string
          p_type: string
        }
        Returns: string
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
