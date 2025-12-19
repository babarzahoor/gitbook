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
      teams: {
        Row: {
          id: string
          name: string
          slug: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      team_members: {
        Row: {
          id: string
          team_id: string
          user_id: string
          role: 'owner' | 'admin' | 'editor' | 'viewer'
          created_at: string
        }
        Insert: {
          id?: string
          team_id: string
          user_id: string
          role?: 'owner' | 'admin' | 'editor' | 'viewer'
          created_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          user_id?: string
          role?: 'owner' | 'admin' | 'editor' | 'viewer'
          created_at?: string
        }
      }
      workspaces: {
        Row: {
          id: string
          team_id: string
          name: string
          slug: string
          description: string | null
          icon: string | null
          is_public: boolean
          theme: Json
          custom_domain: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          team_id: string
          name: string
          slug: string
          description?: string | null
          icon?: string | null
          is_public?: boolean
          theme?: Json
          custom_domain?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          name?: string
          slug?: string
          description?: string | null
          icon?: string | null
          is_public?: boolean
          theme?: Json
          custom_domain?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      collections: {
        Row: {
          id: string
          workspace_id: string
          name: string
          slug: string
          description: string | null
          icon: string | null
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          name: string
          slug: string
          description?: string | null
          icon?: string | null
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          name?: string
          slug?: string
          description?: string | null
          icon?: string | null
          order_index?: number
          created_at?: string
          updated_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          collection_id: string
          parent_id: string | null
          title: string
          slug: string
          content: string
          excerpt: string | null
          icon: string | null
          order_index: number
          is_published: boolean
          template: string | null
          version: number
          created_by: string
          updated_by: string | null
          created_at: string
          updated_at: string
          published_at: string | null
        }
        Insert: {
          id?: string
          collection_id: string
          parent_id?: string | null
          title: string
          slug: string
          content?: string
          excerpt?: string | null
          icon?: string | null
          order_index?: number
          is_published?: boolean
          template?: string | null
          version?: number
          created_by: string
          updated_by?: string | null
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
        Update: {
          id?: string
          collection_id?: string
          parent_id?: string | null
          title?: string
          slug?: string
          content?: string
          excerpt?: string | null
          icon?: string | null
          order_index?: number
          is_published?: boolean
          template?: string | null
          version?: number
          created_by?: string
          updated_by?: string | null
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
      }
      document_versions: {
        Row: {
          id: string
          document_id: string
          version: number
          title: string
          content: string
          created_by: string
          created_at: string
          change_summary: string | null
        }
        Insert: {
          id?: string
          document_id: string
          version: number
          title: string
          content: string
          created_by: string
          created_at?: string
          change_summary?: string | null
        }
        Update: {
          id?: string
          document_id?: string
          version?: number
          title?: string
          content?: string
          created_by?: string
          created_at?: string
          change_summary?: string | null
        }
      }
      comments: {
        Row: {
          id: string
          document_id: string
          user_id: string
          content: string
          resolved: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          document_id: string
          user_id: string
          content: string
          resolved?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          document_id?: string
          user_id?: string
          content?: string
          resolved?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      templates: {
        Row: {
          id: string
          workspace_id: string
          name: string
          description: string | null
          content: string
          icon: string | null
          is_default: boolean
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          name: string
          description?: string | null
          content: string
          icon?: string | null
          is_default?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          name?: string
          description?: string | null
          content?: string
          icon?: string | null
          is_default?: boolean
          created_at?: string
        }
      }
      page_views: {
        Row: {
          id: string
          document_id: string
          visitor_id: string
          user_id: string | null
          viewed_at: string
        }
        Insert: {
          id?: string
          document_id: string
          visitor_id: string
          user_id?: string | null
          viewed_at?: string
        }
        Update: {
          id?: string
          document_id?: string
          visitor_id?: string
          user_id?: string | null
          viewed_at?: string
        }
      }
    }
  }
}
