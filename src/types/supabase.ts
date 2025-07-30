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
            foreignKeyName: "borrow_records_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment_with_related_counts"
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
          current_employee_name: string | null
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
          current_employee_name?: string | null
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
          current_employee_name?: string | null
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
            foreignKeyName: "equipment_activities_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment_with_related_counts"
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
      equipment_categories: {
        Row: {
          code: string
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          code: string
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      equipment_history: {
        Row: {
          action_type: string
          change_reason: string | null
          changed_by: string | null
          created_at: string | null
          equipment_id: string
          field_name: string | null
          id: string
          new_value: string | null
          old_value: string | null
        }
        Insert: {
          action_type: string
          change_reason?: string | null
          changed_by?: string | null
          created_at?: string | null
          equipment_id: string
          field_name?: string | null
          id?: string
          new_value?: string | null
          old_value?: string | null
        }
        Update: {
          action_type?: string
          change_reason?: string | null
          changed_by?: string | null
          created_at?: string | null
          equipment_id?: string
          field_name?: string | null
          id?: string
          new_value?: string | null
          old_value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_history_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_history_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_history_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment_with_related_counts"
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
            foreignKeyName: "equipment_images_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment_with_related_counts"
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
            foreignKeyName: "maintenance_records_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment_with_related_counts"
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
          {
            foreignKeyName: "warranty_alerts_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment_with_related_counts"
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
      equipment_history_with_users: {
        Row: {
          action_type: string | null
          change_reason: string | null
          created_at: string | null
          equipment_id: string | null
          field_name: string | null
          first_name: string | null
          id: string | null
          last_name: string | null
          new_value: string | null
          old_value: string | null
          user_role: Database["public"]["Enums"]["user_role"] | null
          username: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_history_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_history_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_history_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment_with_related_counts"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_with_related_counts: {
        Row: {
          activity_count: number | null
          asset_number: string | null
          borrow_count: number | null
          brand: string | null
          cpu: string | null
          created_at: string | null
          created_by: string | null
          current_user_id: string | null
          department_id: string | null
          equipment_code: string | null
          gpu: string | null
          hostname: string | null
          id: string | null
          image_count: number | null
          ip_address: unknown | null
          location: string | null
          mac_address: unknown | null
          maintenance_count: number | null
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
          total_related_records: number | null
          type: Database["public"]["Enums"]["equipment_type"] | null
          updated_at: string | null
          updated_by: string | null
          warranty_count: number | null
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
            foreignKeyName: "equipment_activities_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment_with_related_counts"
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
      delete_equipment_safely: {
        Args: {
          equipment_uuid: string
        }
        Returns: boolean
      }
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
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
        }
        Relationships: []
      }
      buckets_analytics: {
        Row: {
          created_at: string
          format: string
          id: string
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          format?: string
          id: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          format?: string
          id?: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Relationships: []
      }
      iceberg_namespaces: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "iceberg_namespaces_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets_analytics"
            referencedColumns: ["id"]
          },
        ]
      }
      iceberg_tables: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          location: string
          name: string
          namespace_id: string
          updated_at: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id?: string
          location: string
          name: string
          namespace_id: string
          updated_at?: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          location?: string
          name?: string
          namespace_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "iceberg_tables_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets_analytics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "iceberg_tables_namespace_id_fkey"
            columns: ["namespace_id"]
            isOneToOne: false
            referencedRelation: "iceberg_namespaces"
            referencedColumns: ["id"]
          },
        ]
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          level: number | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          user_metadata: Json | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          level?: number | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          level?: number | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      prefixes: {
        Row: {
          bucket_id: string
          created_at: string | null
          level: number
          name: string
          updated_at: string | null
        }
        Insert: {
          bucket_id: string
          created_at?: string | null
          level?: number
          name: string
          updated_at?: string | null
        }
        Update: {
          bucket_id?: string
          created_at?: string | null
          level?: number
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prefixes_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          in_progress_size: number
          key: string
          owner_id: string | null
          upload_signature: string
          user_metadata: Json | null
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id: string
          in_progress_size?: number
          key: string
          owner_id?: string | null
          upload_signature: string
          user_metadata?: Json | null
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          in_progress_size?: number
          key?: string
          owner_id?: string | null
          upload_signature?: string
          user_metadata?: Json | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string
          created_at: string
          etag: string
          id: string
          key: string
          owner_id: string | null
          part_number: number
          size: number
          upload_id: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          etag: string
          id?: string
          key: string
          owner_id?: string | null
          part_number: number
          size?: number
          upload_id: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          etag?: string
          id?: string
          key?: string
          owner_id?: string | null
          part_number?: number
          size?: number
          upload_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_parts_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "s3_multipart_uploads_parts_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "s3_multipart_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_prefixes: {
        Args: {
          _bucket_id: string
          _name: string
        }
        Returns: undefined
      }
      can_insert_object: {
        Args: {
          bucketid: string
          name: string
          owner: string
          metadata: Json
        }
        Returns: undefined
      }
      delete_prefix: {
        Args: {
          _bucket_id: string
          _name: string
        }
        Returns: boolean
      }
      extension: {
        Args: {
          name: string
        }
        Returns: string
      }
      filename: {
        Args: {
          name: string
        }
        Returns: string
      }
      foldername: {
        Args: {
          name: string
        }
        Returns: string[]
      }
      get_level: {
        Args: {
          name: string
        }
        Returns: number
      }
      get_prefix: {
        Args: {
          name: string
        }
        Returns: string
      }
      get_prefixes: {
        Args: {
          name: string
        }
        Returns: string[]
      }
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>
        Returns: {
          size: number
          bucket_id: string
        }[]
      }
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string
          prefix_param: string
          delimiter_param: string
          max_keys?: number
          next_key_token?: string
          next_upload_token?: string
        }
        Returns: {
          key: string
          id: string
          created_at: string
        }[]
      }
      list_objects_with_delimiter: {
        Args: {
          bucket_id: string
          prefix_param: string
          delimiter_param: string
          max_keys?: number
          start_after?: string
          next_token?: string
        }
        Returns: {
          name: string
          id: string
          metadata: Json
          updated_at: string
        }[]
      }
      operation: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      search: {
        Args: {
          prefix: string
          bucketname: string
          limits?: number
          levels?: number
          offsets?: number
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          name: string
          id: string
          updated_at: string
          created_at: string
          last_accessed_at: string
          metadata: Json
        }[]
      }
      search_legacy_v1: {
        Args: {
          prefix: string
          bucketname: string
          limits?: number
          levels?: number
          offsets?: number
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          name: string
          id: string
          updated_at: string
          created_at: string
          last_accessed_at: string
          metadata: Json
        }[]
      }
      search_v1_optimised: {
        Args: {
          prefix: string
          bucketname: string
          limits?: number
          levels?: number
          offsets?: number
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          name: string
          id: string
          updated_at: string
          created_at: string
          last_accessed_at: string
          metadata: Json
        }[]
      }
      search_v2: {
        Args: {
          prefix: string
          bucket_name: string
          limits?: number
          levels?: number
          start_after?: string
        }
        Returns: {
          key: string
          name: string
          id: string
          updated_at: string
          created_at: string
          metadata: Json
        }[]
      }
    }
    Enums: {
      buckettype: "STANDARD" | "ANALYTICS"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

