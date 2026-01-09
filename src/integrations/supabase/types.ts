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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      booking_requests: {
        Row: {
          budget: number | null
          category: string | null
          coordinates_lat: number | null
          coordinates_lng: number | null
          created_at: string | null
          duration_minutes: number | null
          explorer_id: string
          guests_count: number
          guide_id: string | null
          id: string
          is_draft: boolean | null
          location: string | null
          message: string | null
          preferred_date: string
          preferred_time: string | null
          request_type: string | null
          service_id: string | null
          status: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          budget?: number | null
          category?: string | null
          coordinates_lat?: number | null
          coordinates_lng?: number | null
          created_at?: string | null
          duration_minutes?: number | null
          explorer_id: string
          guests_count?: number
          guide_id?: string | null
          id?: string
          is_draft?: boolean | null
          location?: string | null
          message?: string | null
          preferred_date: string
          preferred_time?: string | null
          request_type?: string | null
          service_id?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          budget?: number | null
          category?: string | null
          coordinates_lat?: number | null
          coordinates_lng?: number | null
          created_at?: string | null
          duration_minutes?: number | null
          explorer_id?: string
          guests_count?: number
          guide_id?: string | null
          id?: string
          is_draft?: boolean | null
          location?: string | null
          message?: string | null
          preferred_date?: string
          preferred_time?: string | null
          request_type?: string | null
          service_id?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_requests_explorer_id_fkey"
            columns: ["explorer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_requests_explorer_id_fkey"
            columns: ["explorer_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_requests_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_requests_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_requests_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          completed_at: string | null
          created_at: string | null
          currency: string | null
          explorer_id: string
          guests_count: number
          guide_id: string
          id: string
          meeting_link: string | null
          notes: string | null
          price: number
          request_id: string | null
          scheduled_date: string
          scheduled_time: string | null
          service_id: string | null
          status: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          currency?: string | null
          explorer_id: string
          guests_count?: number
          guide_id: string
          id?: string
          meeting_link?: string | null
          notes?: string | null
          price: number
          request_id?: string | null
          scheduled_date: string
          scheduled_time?: string | null
          service_id?: string | null
          status?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          currency?: string | null
          explorer_id?: string
          guests_count?: number
          guide_id?: string
          id?: string
          meeting_link?: string | null
          notes?: string | null
          price?: number
          request_id?: string | null
          scheduled_date?: string
          scheduled_time?: string | null
          service_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_explorer_id_fkey"
            columns: ["explorer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_explorer_id_fkey"
            columns: ["explorer_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "booking_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          booking_id: string | null
          created_at: string | null
          id: string
          last_message_at: string | null
          participant_1_id: string
          participant_2_id: string
          service_id: string | null
        }
        Insert: {
          booking_id?: string | null
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          participant_1_id: string
          participant_2_id: string
          service_id?: string | null
        }
        Update: {
          booking_id?: string | null
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          participant_1_id?: string
          participant_2_id?: string
          service_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_participant_1_id_fkey"
            columns: ["participant_1_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_participant_1_id_fkey"
            columns: ["participant_1_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_participant_2_id_fkey"
            columns: ["participant_2_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_participant_2_id_fkey"
            columns: ["participant_2_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          service_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          service_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          service_id?: string
          user_id?: string
        }
        Relationships: []
      }
      followers: {
        Row: {
          created_at: string | null
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string | null
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string | null
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "followers_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "followers_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "followers_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "followers_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      guide_availability: {
        Row: {
          created_at: string | null
          day_of_week: number
          end_time: string
          guide_id: string
          id: string
          is_available: boolean | null
          start_time: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          day_of_week: number
          end_time: string
          guide_id: string
          id?: string
          is_available?: boolean | null
          start_time: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          day_of_week?: number
          end_time?: string
          guide_id?: string
          id?: string
          is_available?: boolean | null
          start_time?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      guide_settings: {
        Row: {
          advance_booking_days: number | null
          buffer_time_minutes: number | null
          created_at: string | null
          currency: string | null
          fixed_duration: number | null
          guide_id: string
          hourly_rate: number | null
          id: string
          max_daily_bookings: number | null
          pricing_type: string
          updated_at: string | null
        }
        Insert: {
          advance_booking_days?: number | null
          buffer_time_minutes?: number | null
          created_at?: string | null
          currency?: string | null
          fixed_duration?: number | null
          guide_id: string
          hourly_rate?: number | null
          id?: string
          max_daily_bookings?: number | null
          pricing_type?: string
          updated_at?: string | null
        }
        Update: {
          advance_booking_days?: number | null
          buffer_time_minutes?: number | null
          created_at?: string | null
          currency?: string | null
          fixed_duration?: number | null
          guide_id?: string
          hourly_rate?: number | null
          id?: string
          max_daily_bookings?: number | null
          pricing_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      livestream_sessions: {
        Row: {
          booking_id: string
          channel_name: string
          created_at: string
          daily_room_name: string | null
          daily_room_url: string | null
          explorer_token: string | null
          guide_token: string | null
          id: string
          session_end_time: string | null
          session_start_time: string | null
          status: string
          updated_at: string
        }
        Insert: {
          booking_id: string
          channel_name: string
          created_at?: string
          daily_room_name?: string | null
          daily_room_url?: string | null
          explorer_token?: string | null
          guide_token?: string | null
          id?: string
          session_end_time?: string | null
          session_start_time?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          booking_id?: string
          channel_name?: string
          created_at?: string
          daily_room_name?: string | null
          daily_room_url?: string | null
          explorer_token?: string | null
          guide_token?: string | null
          id?: string
          session_end_time?: string | null
          session_start_time?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "livestream_sessions_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          is_read: boolean | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          created_at: string | null
          email_bookings: boolean | null
          email_marketing: boolean | null
          email_messages: boolean | null
          email_reminders: boolean | null
          id: string
          push_enabled: boolean | null
          timezone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email_bookings?: boolean | null
          email_marketing?: boolean | null
          email_messages?: boolean | null
          email_reminders?: boolean | null
          id?: string
          push_enabled?: boolean | null
          timezone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email_bookings?: boolean | null
          email_marketing?: boolean | null
          email_messages?: boolean | null
          email_reminders?: boolean | null
          id?: string
          push_enabled?: boolean | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          link: string | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          coordinates_lat: number | null
          coordinates_lng: number | null
          created_at: string
          email: string
          followers_count: number | null
          following_count: number | null
          full_name: string | null
          guide_title: string | null
          id: string
          languages_spoken: string[] | null
          location: string | null
          onboarding_completed: boolean | null
          phone: string | null
          response_rate: number | null
          response_time: string | null
          total_bookings: number | null
          total_earnings: number | null
          updated_at: string
          user_type: string | null
          verification_status: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          coordinates_lat?: number | null
          coordinates_lng?: number | null
          created_at?: string
          email: string
          followers_count?: number | null
          following_count?: number | null
          full_name?: string | null
          guide_title?: string | null
          id: string
          languages_spoken?: string[] | null
          location?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          response_rate?: number | null
          response_time?: string | null
          total_bookings?: number | null
          total_earnings?: number | null
          updated_at?: string
          user_type?: string | null
          verification_status?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          coordinates_lat?: number | null
          coordinates_lng?: number | null
          created_at?: string
          email?: string
          followers_count?: number | null
          following_count?: number | null
          full_name?: string | null
          guide_title?: string | null
          id?: string
          languages_spoken?: string[] | null
          location?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          response_rate?: number | null
          response_time?: string | null
          total_bookings?: number | null
          total_earnings?: number | null
          updated_at?: string
          user_type?: string | null
          verification_status?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          booking_id: string
          comment: string | null
          created_at: string | null
          explorer_id: string
          guide_id: string
          id: string
          rating: number
          response: string | null
          service_id: string
          updated_at: string | null
        }
        Insert: {
          booking_id: string
          comment?: string | null
          created_at?: string | null
          explorer_id: string
          guide_id: string
          id?: string
          rating: number
          response?: string | null
          service_id: string
          updated_at?: string | null
        }
        Update: {
          booking_id?: string
          comment?: string | null
          created_at?: string | null
          explorer_id?: string
          guide_id?: string
          id?: string
          rating?: number
          response?: string | null
          service_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_explorer_id_fkey"
            columns: ["explorer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_explorer_id_fkey"
            columns: ["explorer_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          bookings_count: number | null
          category: string
          coordinates_lat: number | null
          coordinates_lng: number | null
          created_at: string | null
          currency: string | null
          description: string
          duration_minutes: number
          guide_id: string
          id: string
          image_urls: string[] | null
          is_guest_favorite: boolean | null
          languages: string[] | null
          location: string
          max_guests: number
          price: number
          rating_avg: number | null
          requirements: string[] | null
          reviews_count: number | null
          status: string | null
          title: string
          type: string
          updated_at: string | null
          views_count: number | null
          whats_included: string[] | null
        }
        Insert: {
          bookings_count?: number | null
          category: string
          coordinates_lat?: number | null
          coordinates_lng?: number | null
          created_at?: string | null
          currency?: string | null
          description: string
          duration_minutes: number
          guide_id: string
          id?: string
          image_urls?: string[] | null
          is_guest_favorite?: boolean | null
          languages?: string[] | null
          location: string
          max_guests?: number
          price: number
          rating_avg?: number | null
          requirements?: string[] | null
          reviews_count?: number | null
          status?: string | null
          title: string
          type: string
          updated_at?: string | null
          views_count?: number | null
          whats_included?: string[] | null
        }
        Update: {
          bookings_count?: number | null
          category?: string
          coordinates_lat?: number | null
          coordinates_lng?: number | null
          created_at?: string | null
          currency?: string | null
          description?: string
          duration_minutes?: number
          guide_id?: string
          id?: string
          image_urls?: string[] | null
          is_guest_favorite?: boolean | null
          languages?: string[] | null
          location?: string
          max_guests?: number
          price?: number
          rating_avg?: number | null
          requirements?: string[] | null
          reviews_count?: number | null
          status?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          views_count?: number | null
          whats_included?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "services_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          booking_id: string | null
          completed_at: string | null
          created_at: string | null
          currency: string | null
          guide_earnings: number
          guide_id: string
          id: string
          payment_method: string | null
          platform_fee: number | null
          status: string | null
          type: string
        }
        Insert: {
          amount: number
          booking_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          currency?: string | null
          guide_earnings: number
          guide_id: string
          id?: string
          payment_method?: string | null
          platform_fee?: number | null
          status?: string | null
          type: string
        }
        Update: {
          amount?: number
          booking_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          currency?: string | null
          guide_earnings?: number
          guide_id?: string
          id?: string
          payment_method?: string | null
          platform_fee?: number | null
          status?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          coordinates_lat: number | null
          coordinates_lng: number | null
          followers_count: number | null
          following_count: number | null
          full_name: string | null
          guide_title: string | null
          id: string | null
          languages_spoken: string[] | null
          location: string | null
          response_rate: number | null
          response_time: string | null
          total_bookings: number | null
          user_type: string | null
          verification_status: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          coordinates_lat?: number | null
          coordinates_lng?: number | null
          followers_count?: number | null
          following_count?: number | null
          full_name?: string | null
          guide_title?: string | null
          id?: string | null
          languages_spoken?: string[] | null
          location?: string | null
          response_rate?: number | null
          response_time?: string | null
          total_bookings?: number | null
          user_type?: string | null
          verification_status?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          coordinates_lat?: number | null
          coordinates_lng?: number | null
          followers_count?: number | null
          following_count?: number | null
          full_name?: string | null
          guide_title?: string | null
          id?: string | null
          languages_spoken?: string[] | null
          location?: string | null
          response_rate?: number | null
          response_time?: string | null
          total_bookings?: number | null
          user_type?: string | null
          verification_status?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_user_roles: { Args: { _user_id: string }; Returns: string[] }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      switch_user_role: {
        Args: { new_role: Database["public"]["Enums"]["app_role"] }
        Returns: undefined
      }
      user_has_role: {
        Args: { _role: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "explorer" | "host"
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
      app_role: ["explorer", "host"],
    },
  },
} as const
