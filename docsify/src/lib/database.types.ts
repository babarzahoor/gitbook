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
      spaces: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          owner_id: string
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          owner_id: string
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          owner_id?: string
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      pages: {
        Row: {
          id: string
          space_id: string
          title: string
          slug: string
          content: string
          parent_id: string | null
          order_index: number
          is_published: boolean
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          space_id: string
          title: string
          slug: string
          content?: string
          parent_id?: string | null
          order_index?: number
          is_published?: boolean
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          space_id?: string
          title?: string
          slug?: string
          content?: string
          parent_id?: string | null
          order_index?: number
          is_published?: boolean
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
