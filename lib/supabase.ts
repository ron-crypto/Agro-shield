import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          phone: string;
          name: string;
          location: string;
          farm_size: number;
          main_crops: string[];
          soil_type?: string;
          preferred_language: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          phone: string;
          name: string;
          location: string;
          farm_size: number;
          main_crops: string[];
          soil_type?: string;
          preferred_language?: string;
        };
        Update: {
          phone?: string;
          name?: string;
          location?: string;
          farm_size?: number;
          main_crops?: string[];
          soil_type?: string;
          preferred_language?: string;
          updated_at?: string;
        };
      };
      weather_data: {
        Row: {
          id: string;
          location: string;
          date: string;
          temperature: number;
          humidity: number;
          rainfall_probability: number;
          wind_speed: number;
          condition: string;
          created_at: string;
        };
        Insert: {
          location: string;
          date: string;
          temperature: number;
          humidity: number;
          rainfall_probability: number;
          wind_speed: number;
          condition: string;
        };
        Update: {
          temperature?: number;
          humidity?: number;
          rainfall_probability?: number;
          wind_speed?: number;
          condition?: string;
        };
      };
      diagnoses: {
        Row: {
          id: string;
          user_id: string;
          image_url: string;
          disease: string;
          confidence: number;
          description: string;
          symptoms: string[];
          treatments: any[];
          severity: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          image_url: string;
          disease: string;
          confidence: number;
          description: string;
          symptoms: string[];
          treatments: any[];
          severity: string;
        };
        Update: {
          disease?: string;
          confidence?: number;
          description?: string;
          symptoms?: string[];
          treatments?: any[];
          severity?: string;
        };
      };
      market_prices: {
        Row: {
          id: string;
          crop: string;
          market: string;
          price: number;
          unit: string;
          date: string;
          created_at: string;
        };
        Insert: {
          crop: string;
          market: string;
          price: number;
          unit: string;
          date: string;
        };
        Update: {
          price?: number;
          date?: string;
        };
      };
      farm_journal: {
        Row: {
          id: string;
          user_id: string;
          activity: string;
          crop: string;
          notes: string;
          category: string;
          quantity?: string;
          cost?: number;
          date: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          activity: string;
          crop: string;
          notes: string;
          category: string;
          quantity?: string;
          cost?: number;
          date: string;
        };
        Update: {
          activity?: string;
          crop?: string;
          notes?: string;
          category?: string;
          quantity?: string;
          cost?: number;
          date?: string;
        };
      };
      advisories: {
        Row: {
          id: string;
          user_id: string;
          crop: string;
          variety: string;
          planting_window: string;
          recommendations: any[];
          confidence: number;
          created_at: string;
        };
        Insert: {
          user_id: string;
          crop: string;
          variety: string;
          planting_window: string;
          recommendations: any[];
          confidence: number;
        };
        Update: {
          crop?: string;
          variety?: string;
          planting_window?: string;
          recommendations?: any[];
          confidence?: number;
        };
      };
    };
  };
};