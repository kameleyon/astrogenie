import { supabase } from './client'
import type { Database } from '@/lib/types/database'

type Tables = Database['public']['Tables']

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) throw error
  return data
}

export async function updateProfile(userId: string, profile: Partial<Tables['profiles']['Update']>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(profile)
    .eq('id', userId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function getAstrologicalReadings(userId: string) {
  const { data, error } = await supabase
    .from('astrological_readings')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export async function createAstrologicalReading(reading: Tables['astrological_readings']['Insert']) {
  const { data, error } = await supabase
    .from('astrological_readings')
    .insert(reading)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function getNotificationPreferences(userId: string) {
  const { data, error } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  if (error) throw error
  return data
}

export async function updateNotificationPreferences(
  userId: string, 
  preferences: Tables['notification_preferences']['Update']
) {
  const { data, error } = await supabase
    .from('notification_preferences')
    .update(preferences)
    .eq('user_id', userId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function getSubscription(userId: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  if (error) throw error
  return data
}

export async function updateSubscription(
  userId: string,
  subscription: Tables['subscriptions']['Update']
) {
  const { data, error } = await supabase
    .from('subscriptions')
    .update(subscription)
    .eq('user_id', userId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function getReports() {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export async function getReportById(reportId: string) {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('id', reportId)
    .single()
  
  if (error) throw error
  return data
}
