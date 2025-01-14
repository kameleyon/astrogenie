export type Profile = {
  id: string
  created_at: string
  email: string
  birth_date: Date
  birth_time: string // time without time zone
  birth_location: string
  sun_sign: string | null
  moon_sign: string | null
  ascendant: string | null
  human_design_type: string | null
  life_path_number: string | null
  cardology_card: string | null
  birth_chart_aspects: Record<string, any> | null // jsonb
  birth_chart_houses: Record<string, any> | null // jsonb
  birth_chart_planets: Record<string, any> | null // jsonb
  birth_chart_description: string | null
}

export type AstrologicalReading = {
  id: string
  user_id: string
  created_at: string
  question: string
  response: string
  is_bookmarked: boolean
  parent_id: string | null
}

export type NotificationPreference = {
  id: string
  user_id: string
  email_updates: boolean
  reading_reminders: boolean
  marketing_emails: boolean
  created_at: string
  updated_at: string
}

export type Subscription = {
  id: string
  user_id: string
  status: 'trial' | 'active' | 'cancelled' | 'expired'
  credits_remaining: number
  rollover_credits: number
  trial_end_date: string | null
  current_period_end: string | null
  stripe_subscription_id: string | null
  created_at: string
  success_url: string | null
}

export type Report = {
  id: string
  title: string
  description: string
  price: number // numeric(10,2)
  category: string
  created_at: string
  updated_at: string
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'id' | 'created_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
      }
      astrological_readings: {
        Row: AstrologicalReading
        Insert: Omit<AstrologicalReading, 'id' | 'created_at'>
        Update: Partial<Omit<AstrologicalReading, 'id' | 'created_at'>>
      }
      notification_preferences: {
        Row: NotificationPreference
        Insert: Omit<NotificationPreference, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<NotificationPreference, 'id' | 'created_at' | 'updated_at'>>
      }
      subscriptions: {
        Row: Subscription
        Insert: Omit<Subscription, 'id' | 'created_at'>
        Update: Partial<Omit<Subscription, 'id' | 'created_at'>>
      }
      reports: {
        Row: Report
        Insert: Omit<Report, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Report, 'id' | 'created_at' | 'updated_at'>>
      }
    }
    Functions: {
      update_credits: {
        Args: { p_user_id: string; p_credits_used: number }
        Returns: void
      }
    }
  }
}
