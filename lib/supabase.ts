import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database Types
export interface DbUser {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbSpace {
  id: string;
  name: string;
  color: string;
  description: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface DbSpaceMember {
  id: string;
  space_id: string;
  user_id: string;
  role: 'owner' | 'lead' | 'teammate';
  joined_at: string;
}

export interface DbTask {
  id: string;
  space_id: string;
  title: string;
  description: string | null;
  status: 'todo' | 'inProgress' | 'review' | 'done';
  due_date: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface DbTaskAssignee {
  id: string;
  task_id: string;
  user_id: string;
  assigned_at: string;
}

export interface DbEchoTask {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  priority: 'High' | 'Medium' | 'Low';
  status: 'To Do' | 'In Progress' | 'Completed';
  category_id: string | null;
  due_date: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface DbEchoCategory {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface DbActivity {
  id: string;
  user_id: string;
  type: 'comment' | 'move' | 'complete' | 'create' | 'assign' | 'delete';
  task_title: string;
  task_id: string | null;
  space_id: string | null;
  space_name: string | null;
  from_column: string | null;
  to_column: string | null;
  created_at: string;
}
