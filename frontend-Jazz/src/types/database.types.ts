export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      waitlist: {
        Row: {
          id: string
          email: string
          name: string
          provider: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string
          provider?: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          provider?: string
          created_at?: string
        }
        Relationships: []
      }
      meetings: {
        Row: {
          id: string
          user_id: string
          bot_id: string | null
          meet_url: string
          status: string
          title: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          bot_id?: string | null
          meet_url: string
          status?: string
          title?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          bot_id?: string | null
          meet_url?: string
          status?: string
          title?: string | null
          created_at?: string
        }
        Relationships: []
      }
      transcripts: {
        Row: {
          id: string
          meeting_id: string
          speaker: string
          text: string
          timestamp: number
          created_at: string
        }
        Insert: {
          id?: string
          meeting_id: string
          speaker?: string
          text: string
          timestamp?: number
          created_at?: string
        }
        Update: {
          id?: string
          meeting_id?: string
          speaker?: string
          text?: string
          timestamp?: number
          created_at?: string
        }
        Relationships: []
      }
      summaries: {
        Row: {
          id: string
          meeting_id: string
          summary: string
          action_items: string[]
          key_decisions: string[]
          follow_ups: string[]
          created_at: string
        }
        Insert: {
          id?: string
          meeting_id: string
          summary: string
          action_items?: string[]
          key_decisions?: string[]
          follow_ups?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          meeting_id?: string
          summary?: string
          action_items?: string[]
          key_decisions?: string[]
          follow_ups?: string[]
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
