export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      borrow_records: {
        Row: {
          actual_return_date: string | null
          borrow_date: string
          borrow_notes: string | null
          borrowed_by: string | null
          borrower_id: string | null
          created_at: string | null
          equipment_id: string | null
          expected_return_date: string
          id: string
          return_notes: string | null
          returned_by: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          actual_return_date?: string | null
          borrow_date: string
          borrow_notes?: string | null
          borrowed_by?: string | null
          borrower_id?: string | null
          created_at?: string | null
          equipment_id?: string | null
          expected_return_date: string
          id?: string
          return_notes?: string | null
          returned_by?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          actual_return_date?: string | null
          borrow_date?: string
          borrow_notes?: string | null
          borrowed_by?: string | null
          borrower_id?: string | null
          created_at?: string | null
          equipment_id?: string | null
          expected_return_date?: string
          id?: string
          return_notes?: string | null
          returned_by?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "borrow_records_borrowed_by_fkey"
            columns: ["borrowed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "borrow_records_borrower_id_fkey"
            columns: ["borrower_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "borrow_records_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "borrow_records_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "borrow_records_returned_by_fkey"
            columns: ["returned_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          manager_id: string | null
          name: string
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          manager_id?: string | null
          name: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          manager_id?: string | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_departments_manager"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment: {
        Row: {
          asset_number: string | null
          brand: string
          cpu: string | null
          created_at: string | null
          created_by: string | null
          current_user_id: string | null
          department_id: string | null
          equipment_code: string
          gpu: string | null
          hostname: string | null
          id: string
          ip_address: unknown | null
          location: string | null
          mac_address: unknown | null
          model: string
          name: string
          notes: string | null
          operating_system: string | null
          product_key: string | null
          purchase_date: string | null
          purchase_price: number | null
          qr_code: string | null
          ram: string | null
          serial_number: string
          status: Database["public"]["Enums"]["equipment_status"] | null
          storage: string | null
          supplier: string | null
          type: Database["public"]["Enums"]["equipment_type"]
          updated_at: string | null
          updated_by: string | null
          warranty_date: string | null
        }
        Insert: {
          asset_number?: string | null
          brand: string
          cpu?: string | null
          created_at?: string | null
          created_by?: string | null
          current_user_id?: string | null
          department_id?: string | null
          equipment_code: string
          gpu?: string | null
          hostname?: string | null
          id?: string
          ip_address?: unknown | null
          location?: string | null
          mac_address?: unknown | null
          model: string
          name: string
          notes?: string | null
          operating_system?: string | null
          product_key?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          qr_code?: string | null
          ram?: string | null
          serial_number: string
          status?: Database["public"]["Enums"]["equipment_status"] | null
          storage?: string | null
          supplier?: string | null
          type: Database["public"]["Enums"]["equipment_type"]
          updated_at?: string | null
          updated_by?: string | null
          warranty_date?: string | null
        }
        Update: {
          asset_number?: string | null
          brand?: string
          cpu?: string | null
          created_at?: string | null
          created_by?: string | null
          current_user_id?: string | null
          department_id?: string | null
          equipment_code?: string
          gpu?: string | null
          hostname?: string | null
          id?: string
          ip_address?: unknown | null
          location?: string | null
          mac_address?: unknown | null
          model?: string
          name?: string
          notes?: string | null
          operating_system?: string | null
          product_key?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          qr_code?: string | null
          ram?: string | null
          serial_number?: string
          status?: Database["public"]["Enums"]["equipment_status"] | null
          storage?: string | null
          supplier?: string | null
          type?: Database["public"]["Enums"]["equipment_type"]
          updated_at?: string | null
          updated_by?: string | null
          warranty_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_current_user_id_fkey"
            columns: ["current_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_activities: {
        Row: {
          activity_data: Json | null
          activity_type: Database["public"]["Enums"]["activity_type"]
          created_at: string | null
          description: string
          equipment_id: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          activity_data?: Json | null
          activity_type: Database["public"]["Enums"]["activity_type"]
          created_at?: string | null
          description: string
          equipment_id?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          activity_data?: Json | null
          activity_type?: Database["public"]["Enums"]["activity_type"]
          created_at?: string | null
          description?: string
          equipment_id?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_activities_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_activities_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_images: {
        Row: {
          created_at: string | null
          equipment_id: string | null
          file_name: string | null
          file_size: number | null
          id: string
          image_type: string | null
          image_url: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          equipment_id?: string | null
          file_name?: string | null
          file_size?: number | null
          id?: string
          image_type?: string | null
          image_url: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          equipment_id?: string | null
          file_name?: string | null
          file_size?: number | null
          id?: string
          image_type?: string | null
          image_url?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_images_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_images_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_images_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_records: {
        Row: {
          assigned_to: string | null
          completed_date: string | null
          cost: number | null
          created_at: string | null
          equipment_id: string | null
          id: string
          issue_description: string
          priority: string | null
          reported_by: string | null
          reported_date: string | null
          solution_description: string | null
          start_date: string | null
          status: string | null
          updated_at: string | null
          vendor: string | null
        }
        Insert: {
          assigned_to?: string | null
          completed_date?: string | null
          cost?: number | null
          created_at?: string | null
          equipment_id?: string | null
          id?: string
          issue_description: string
          priority?: string | null
          reported_by?: string | null
          reported_date?: string | null
          solution_description?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
          vendor?: string | null
        }
        Update: {
          assigned_to?: string | null
          completed_date?: string | null
          cost?: number | null
          created_at?: string | null
          equipment_id?: string | null
          id?: string
          issue_description?: string
          priority?: string | null
          reported_by?: string | null
          reported_date?: string | null
          solution_description?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
          vendor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_records_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_records_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_records_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_records_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          department_id: string | null
          email: string
          first_name: string
          id: string
          is_active: boolean | null
          last_name: string
          password_hash: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
          username: string
        }
        Insert: {
          created_at?: string | null
          department_id?: string | null
          email: string
          first_name: string
          id?: string
          is_active?: boolean | null
          last_name: string
          password_hash: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
          username: string
        }
        Update: {
          created_at?: string | null
          department_id?: string | null
          email?: string
          first_name?: string
          id?: string
          is_active?: boolean | null
          last_name?: string
          password_hash?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      warranty_alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          alert_date: string
          alert_type: string
          created_at: string | null
          days_until_expiry: number | null
          equipment_id: string | null
          id: string
          is_acknowledged: boolean | null
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_date: string
          alert_type: string
          created_at?: string | null
          days_until_expiry?: number | null
          equipment_id?: string | null
          id?: string
          is_acknowledged?: boolean | null
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_date?: string
          alert_type?: string
          created_at?: string | null
          days_until_expiry?: number | null
          equipment_id?: string | null
          id?: string
          is_acknowledged?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "warranty_alerts_acknowledged_by_fkey"
            columns: ["acknowledged_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warranty_alerts_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warranty_alerts_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment_details"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      dashboard_stats: {
        Row: {
          damaged_equipment: number | null
          expired_warranty: number | null
          expiring_warranty: number | null
          maintenance_equipment: number | null
          normal_equipment: number | null
          total_equipment: number | null
        }
        Relationships: []
      }
      equipment_details: {
        Row: {
          asset_number: string | null
          brand: string | null
          cpu: string | null
          created_at: string | null
          created_by: string | null
          current_user_id: string | null
          current_user_name: string | null
          current_user_username: string | null
          department_code: string | null
          department_id: string | null
          department_name: string | null
          equipment_code: string | null
          gpu: string | null
          hostname: string | null
          id: string | null
          ip_address: unknown | null
          location: string | null
          mac_address: unknown | null
          model: string | null
          name: string | null
          notes: string | null
          operating_system: string | null
          product_key: string | null
          purchase_date: string | null
          purchase_price: number | null
          qr_code: string | null
          ram: string | null
          serial_number: string | null
          status: Database["public"]["Enums"]["equipment_status"] | null
          storage: string | null
          supplier: string | null
          type: Database["public"]["Enums"]["equipment_type"] | null
          updated_at: string | null
          updated_by: string | null
          warranty_date: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_current_user_id_fkey"
            columns: ["current_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      recent_activities: {
        Row: {
          activity_data: Json | null
          activity_type: Database["public"]["Enums"]["activity_type"] | null
          created_at: string | null
          description: string | null
          equipment_code: string | null
          equipment_id: string | null
          equipment_name: string | null
          id: string | null
          user_id: string | null
          user_name: string | null
          user_username: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_activities_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_activities_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      activity_type:
        | "add"
        | "update"
        | "delete"
        | "borrow"
        | "return"
        | "maintenance"
        | "damage"
        | "warranty_expired"
      equipment_status:
        | "normal"
        | "damaged"
        | "maintenance"
        | "disposed"
        | "borrowed"
      equipment_type:
        | "computer"
        | "laptop"
        | "monitor"
        | "printer"
        | "ups"
        | "network_device"
      user_role: "admin" | "manager" | "user"
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
    Enums: {
      activity_type: [
        "add",
        "update",
        "delete",
        "borrow",
        "return",
        "maintenance",
        "damage",
        "warranty_expired",
      ],
      equipment_status: [
        "normal",
        "damaged",
        "maintenance",
        "disposed",
        "borrowed",
      ],
      equipment_type: [
        "computer",
        "laptop",
        "monitor",
        "printer",
        "ups",
        "network_device",
      ],
      user_role: ["admin", "manager", "user"],
    },
  },
} as const
