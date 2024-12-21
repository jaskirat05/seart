export type SessionStatus = 'active' | 'converted' | 'expired';

export interface AnonymousSession {
  id: string;
  ip_address: string;
  points_remaining: number;
  status: SessionStatus;
  created_at: string;
  last_used_at: string;
  converted_user_id?: string;
}

export interface UserPoints {
  user_id: string;
  points_remaining: number;
  total_points_earned: number;
  created_at: string;
  updated_at: string;
}
