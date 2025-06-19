import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client-side Supabase client (with RLS enabled)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side Supabase client (bypasses RLS for admin operations)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Database types for better TypeScript support
export type Database = {
  public: {
    Tables: {
      trades: {
        Row: {
          id: string
          user_id: string
          symbol: string
          side: 'STO' | 'BTO'
          type: 'Call' | 'Put' | 'Stock'
          start_date: string
          strike_price: number | null
          price: number
          contracts: number
          expiration_date: string | null
          status: 'open' | 'closed' | 'expired' | 'assigned'
          premium: number
          commission: number
          notes: string | null
          covered: boolean | null
          secured: boolean | null
          closing_price: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          symbol: string
          side: 'STO' | 'BTO'
          type: 'Call' | 'Put' | 'Stock'
          start_date: string
          strike_price?: number | null
          price: number
          contracts: number
          expiration_date?: string | null
          status?: 'open' | 'closed' | 'expired' | 'assigned'
          premium: number
          commission: number
          notes?: string | null
          covered?: boolean | null
          secured?: boolean | null
          closing_price?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          symbol?: string
          side?: 'STO' | 'BTO'
          type?: 'Call' | 'Put' | 'Stock'
          start_date?: string
          strike_price?: number | null
          price?: number
          contracts?: number
          expiration_date?: string | null
          status?: 'open' | 'closed' | 'expired' | 'assigned'
          premium?: number
          commission?: number
          notes?: string | null
          covered?: boolean | null
          secured?: boolean | null
          closing_price?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          default_commission: number
          risk_alerts: boolean
          email_notifications: boolean
          dark_mode: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          default_commission?: number
          risk_alerts?: boolean
          email_notifications?: boolean
          dark_mode?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          default_commission?: number
          risk_alerts?: boolean
          email_notifications?: boolean
          dark_mode?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      cash_transactions: {
        Row: {
          id: string
          user_id: string
          type: 'deposit' | 'withdraw'
          amount: number
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'deposit' | 'withdraw'
          amount: number
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'deposit' | 'withdraw'
          amount?: number
          notes?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      trade_side: 'STO' | 'BTO'
      trade_type: 'Call' | 'Put' | 'Stock'
      trade_status: 'open' | 'closed' | 'expired' | 'assigned'
      transaction_type: 'deposit' | 'withdraw'
    }
  }
} 