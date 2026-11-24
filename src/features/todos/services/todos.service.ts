import { supabase } from '@/lib/supabase';

export const todosService = {
  async list(userId: string) {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async create(userId: string, title: string) {
    const { data, error } = await supabase
      .from('todos')
      .insert({ user_id: userId, title: title.trim() })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async toggle(userId: string, id: string, isComplete: boolean) {
    const { data, error } = await supabase
      .from('todos')
      .update({ is_complete: isComplete, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async remove(userId: string, id: string) {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  }
};
