import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Profile {
  id: string;
  phone: string;
  name: string;
  location: string;
  farm_size: number;
  main_crops: string[];
  soil_type?: string;
  preferred_language: string;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (phone: string, password: string, profileData: Omit<Profile, 'id'>) => Promise<{ error: any }>;
  signIn: (phone: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  signUp: async () => ({ error: null }),
  signIn: async () => ({ error: null }),
  signOut: async () => {},
  updateProfile: async () => ({ error: null }),
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await loadProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error loading profile:', error);
      } else if (data) {
        setProfile(data);
        // Cache profile for offline access
        await AsyncStorage.setItem('user_profile', JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      // Try to load from cache
      try {
        const cachedProfile = await AsyncStorage.getItem('user_profile');
        if (cachedProfile) {
          setProfile(JSON.parse(cachedProfile));
        }
      } catch (cacheError) {
        console.error('Error loading cached profile:', cacheError);
      }
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (phone: string, password: string, profileData: Omit<Profile, 'id'>) => {
    try {
      // For demo purposes, we'll use email format for phone auth
      const email = `${phone}@agro-shield.app`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            phone,
            ...profileData,
          },
        },
      });

      if (error) return { error };

      if (data.user) {
        // Create profile record
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            phone,
            ...profileData,
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
          return { error: profileError };
        }
      }

      return { error: null };
    } catch (error) {
      // Handle specific error cases
      if (error && typeof error === 'object' && 'message' in error) {
        if (error.message === 'User already registered') {
          return { error: { message: 'User already registered', code: 'USER_ALREADY_EXISTS' } };
        }
      }
      return { error };
    }
  };

  const signIn = async (phone: string, password: string) => {
    try {
      // For demo purposes, we'll use email format for phone auth
      const email = `${phone}@agro-shield.app`;
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      await AsyncStorage.removeItem('user_profile');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (error) return { error };

      // Update local state
      if (profile) {
        const updatedProfile = { ...profile, ...updates };
        setProfile(updatedProfile);
        await AsyncStorage.setItem('user_profile', JSON.stringify(updatedProfile));
      }

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const value = {
    session,
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};