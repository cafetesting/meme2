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
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      memes: {
        Row: {
          id: string
          user_id: string
          title: string | null
          image_url: string
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title?: string | null
          image_url: string
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string | null
          image_url?: string
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      meme_texts: {
        Row: {
          id: string
          meme_id: string
          content: string
          x: number
          y: number
          width: number
          height: number
          font_size: number
          font_family: string
          color: string
          order: number
          created_at: string
        }
        Insert: {
          id?: string
          meme_id: string
          content: string
          x: number
          y: number
          width: number
          height: number
          font_size: number
          font_family?: string
          color?: string
          order: number
          created_at?: string
        }
        Update: {
          id?: string
          meme_id?: string
          content?: string
          x?: number
          y?: number
          width?: number
          height?: number
          font_size?: number
          font_family?: string
          color?: string
          order?: number
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
      [_ in never]: never
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Meme = Database['public']['Tables']['memes']['Row']
export type MemeText = Database['public']['Tables']['meme_texts']['Row']
export type MemeInsert = Database['public']['Tables']['memes']['Insert']
export type MemeTextInsert = Database['public']['Tables']['meme_texts']['Insert']

