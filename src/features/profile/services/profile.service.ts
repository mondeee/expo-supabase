import { supabase } from '@/lib/supabase';

export const profileService = {
  async getMyProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  async updateMyProfile(userId: string, fullName: string) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ full_name: fullName.trim(), updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
