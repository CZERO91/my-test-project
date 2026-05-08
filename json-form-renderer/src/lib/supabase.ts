import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function saveFormConfig(name: string, config: any) {
  const { data, error } = await supabase
    .from('form_configs')
    .insert([{ name, config }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function loadFormConfigs() {
  const { data, error } = await supabase
    .from('form_configs')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function loadFormConfig(id: string) {
  const { data, error } = await supabase
    .from('form_configs')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteFormConfig(id: string) {
  const { error } = await supabase
    .from('form_configs')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

export async function saveFormSubmission(configId: string, data: Record<string, any>) {
  const { data: result, error } = await supabase
    .from('form_submissions')
    .insert([{ config_id: configId, data }])
    .select()
    .single();
  
  if (error) throw error;
  return result;
}

export async function loadFormSubmissions(configId: string) {
  const { data, error } = await supabase
    .from('form_submissions')
    .select('*')
    .eq('config_id', configId)
    .order('submitted_at', { ascending: false });
  
  if (error) throw error;
  return data;
}
