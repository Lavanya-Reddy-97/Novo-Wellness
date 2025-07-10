
export interface UserRole {
  id: string;
  user_id: string;
  role: 'student' | 'management';
  created_at: string;
}

export interface ExtendedUser {
  id: string;
  email: string;
  role?: 'student' | 'management';
  name?: string;
}
