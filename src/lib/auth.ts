import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'admin' | 'farmer' | 'buyer';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole | null;
}

export const signUp = async (email: string, password: string, fullName: string, role: UserRole) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: `${window.location.origin}/`,
    },
  });

  if (error) throw error;
  if (!data.user) throw new Error('Failed to create user');

  // Add role to user_roles table
  const { error: roleError } = await supabase
    .from('user_roles')
    .insert({ user_id: data.user.id, role });

  if (roleError) throw roleError;

  return data;
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUserProfile = async (): Promise<UserProfile | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) return null;

  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  return {
    ...profile,
    role: roleData?.role || null,
  };
};

export const getUserRole = async (userId: string): Promise<UserRole | null> => {
  const { data } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .single();

  return data?.role || null;
};

export const hasRole = async (userId: string, role: UserRole): Promise<boolean> => {
  const userRole = await getUserRole(userId);
  return userRole === role;
};
