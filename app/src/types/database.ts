// Supabaseデータベース型定義
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
      profiles: {
        Row: {
          id: string
          username: string | null
          display_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      card_sets: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      cards: {
        Row: {
          id: string
          card_set_id: string
          front_word: string
          front_hint: string | null
          front_description: string | null
          back_word: string
          back_hint: string | null
          back_description: string | null
          audio_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          card_set_id: string
          front_word: string
          front_hint?: string | null
          front_description?: string | null
          back_word: string
          back_hint?: string | null
          back_description?: string | null
          audio_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          card_set_id?: string
          front_word?: string
          front_hint?: string | null
          front_description?: string | null
          back_word?: string
          back_hint?: string | null
          back_description?: string | null
          audio_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_card_stats: {
        Row: {
          id: string
          user_id: string
          card_id: string
          score: number
          total_attempts: number
          correct_count: number
          incorrect_count: number
          last_studied_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          card_id: string
          score?: number
          total_attempts?: number
          correct_count?: number
          incorrect_count?: number
          last_studied_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          card_id?: string
          score?: number
          total_attempts?: number
          correct_count?: number
          incorrect_count?: number
          last_studied_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      learning_sessions: {
        Row: {
          id: string
          user_id: string
          card_set_id: string
          is_reversed: boolean
          is_random_order: boolean
          started_at: string
          completed_at: string | null
          total_words: number | null
          correct_words: number | null
          accuracy: number | null
        }
        Insert: {
          id?: string
          user_id: string
          card_set_id: string
          is_reversed?: boolean
          is_random_order?: boolean
          started_at?: string
          completed_at?: string | null
          total_words?: number | null
          correct_words?: number | null
          accuracy?: number | null
        }
        Update: {
          id?: string
          user_id?: string
          card_set_id?: string
          is_reversed?: boolean
          is_random_order?: boolean
          started_at?: string
          completed_at?: string | null
          total_words?: number | null
          correct_words?: number | null
          accuracy?: number | null
        }
      }
      card_progress: {
        Row: {
          id: string
          user_id: string
          card_id: string
          session_id: string
          is_correct: boolean | null
          response_time: number | null
          reviewed_at: string
        }
        Insert: {
          id?: string
          user_id: string
          card_id: string
          session_id: string
          is_correct?: boolean | null
          response_time?: number | null
          reviewed_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          card_id?: string
          session_id?: string
          is_correct?: boolean | null
          response_time?: number | null
          reviewed_at?: string
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
      [_ in never]: never
    }
  }
}