export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      permissions: {
        Row: {
          action: string
          created_at: string
          description: string | null
          id: number
          name: string
          resource: string
        }
        Insert: {
          action: string
          created_at?: string
          description?: string | null
          id?: number
          name: string
          resource: string
        }
        Update: {
          action?: string
          created_at?: string
          description?: string | null
          id?: number
          name?: string
          resource?: string
        }
        Relationships: []
      }
      players: {
        Row: {
          created_at: string
          firstname: string
          id: number
          lastname: string
          rating_class_id: number
        }
        Insert: {
          created_at?: string
          firstname: string
          id?: number
          lastname: string
          rating_class_id: number
        }
        Update: {
          created_at?: string
          firstname?: string
          id?: number
          lastname?: string
          rating_class_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "players_rating_class_id_fkey"
            columns: ["rating_class_id"]
            isOneToOne: false
            referencedRelation: "rating_classes"
            referencedColumns: ["id"]
          },
        ]
      }
      rating_classes: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
      rating_classes_to_tournaments: {
        Row: {
          rating_class_id: number
          tournament_id: number
        }
        Insert: {
          rating_class_id: number
          tournament_id: number
        }
        Update: {
          rating_class_id?: number
          tournament_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "rating_classes_to_tournaments_rating_classes_id_fkey"
            columns: ["rating_class_id"]
            isOneToOne: false
            referencedRelation: "rating_classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rating_classes_to_tournaments_tournaments_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          permission_id: number
          role_id: number
        }
        Insert: {
          permission_id: number
          role_id: number
        }
        Update: {
          permission_id?: number
          role_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string
          description: string | null
          id: number
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      scorecards: {
        Row: {
          data: Json
          id: number
          player_id: number
          session_id: number
        }
        Insert: {
          data: Json
          id?: number
          player_id: number
          session_id: number
        }
        Update: {
          data?: Json
          id?: number
          player_id?: number
          session_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "scorecards_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scorecards_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          created_at: string
          id: number
          submitted_at: string | null
          tournament_id: number | null
        }
        Insert: {
          created_at?: string
          id?: number
          submitted_at?: string | null
          tournament_id?: number | null
        }
        Update: {
          created_at?: string
          id?: number
          submitted_at?: string | null
          tournament_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sessions_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournaments: {
        Row: {
          created_at: string
          description: string | null
          end_date: string
          id: number
          minimum_participants: number
          name: string
          number_of_holes: number
          start_date: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date: string
          id?: number
          minimum_participants: number
          name: string
          number_of_holes: number
          start_date: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string
          id?: number
          minimum_participants?: number
          name?: string
          number_of_holes?: number
          start_date?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          role_id: number
          user_id: string
        }
        Insert: {
          created_at?: string
          role_id: number
          user_id: string
        }
        Update: {
          created_at?: string
          role_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_permission_to_role: {
        Args: { p_role_id: number; p_permission_id: number }
        Returns: undefined
      }
      assign_role_to_user: {
        Args: { p_user_id: string; p_role_name: string }
        Returns: undefined
      }
      can_access_resource: {
        Args: { resource_table: string; resource_id: number; action: string }
        Returns: boolean
      }
      create_role: {
        Args: { p_name: string; p_description: string }
        Returns: number
      }
      current_user_has_permission: {
        Args: { resource: string; action: string }
        Returns: boolean
      }
      delete_role: {
        Args: { p_role_id: number }
        Returns: undefined
      }
      ensure_admin_exists: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_current_user_permissions: {
        Args: Record<PropertyKey, never>
        Returns: {
          permission_name: string
          resource: string
          action: string
        }[]
      }
      get_current_user_roles: {
        Args: Record<PropertyKey, never>
        Returns: {
          role_id: number
          role_name: string
          role_description: string
        }[]
      }
      get_user_permissions: {
        Args: { user_id: string }
        Returns: {
          permission_name: string
          resource: string
          action: string
        }[]
      }
      is_owner: {
        Args: { resource_table: string; resource_id: number }
        Returns: boolean
      }
      list_roles_with_permissions: {
        Args: Record<PropertyKey, never>
        Returns: {
          role_id: number
          role_name: string
          role_description: string
          permissions: Json
        }[]
      }
      list_users_with_roles: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
          email: string
          user_name: string
          roles: string[]
        }[]
      }
      remove_permission_from_role: {
        Args: { p_role_id: number; p_permission_id: number }
        Returns: undefined
      }
      remove_role_from_user: {
        Args: { p_user_id: string; p_role_name: string }
        Returns: undefined
      }
      update_jsonb_array_element: {
        Args: { record_id: number; array_index: number; new_value: Json }
        Returns: undefined
      }
      update_role: {
        Args: { p_role_id: number; p_name: string; p_description: string }
        Returns: undefined
      }
      user_has_permission: {
        Args: { user_id: string; resource: string; action: string }
        Returns: boolean
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
