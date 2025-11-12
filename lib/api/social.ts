import apiClient from '../api-client';

export interface SocialGeneratePayload {
  platform: string;
  brandName?: string;
  brandCategory?: string;
  targetAudience?: string;
  tone?: string;
  contentGoal: string;
  theme?: string;
  contentType?: string;
}

export interface SocialEngineDiagnostics {
  brand_summary: string;
  trend_signals: string;
  creative_angle: string;
  visual_direction: string;
  engagement_plan: string;
}

export interface SocialPostResponse {
  platform: string;
  tone: string;
  content_goal: string;
  post_caption: string;
  hashtags: string[];
  image_idea: string;
  cta: string;
  suggested_post_time: string;
  engines: SocialEngineDiagnostics;
}

export interface SocialHistoryItem {
  id: string;
  platform: string;
  tone: string;
  content_goal: string;
  output: SocialPostResponse;
  diagnostics?: SocialEngineDiagnostics;
  is_favorite: boolean;
  created_at: string;
}

export async function generateSocialPost(payload: SocialGeneratePayload) {
  const data = await apiClient.request<any>('/social/generate', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  if (!data.success) {
    throw new Error(data.message || 'Failed to generate social content');
  }
  return data as {
    success: true;
    data: SocialPostResponse;
    postId: string;
    warnings?: string[];
    score?: number;
    diagnostics?: SocialEngineDiagnostics;
  };
}

export async function fetchSocialHistory() {
  const data = await apiClient.request<any>('/social/history', {
    method: 'GET'
  });
  if (!data.success) {
    throw new Error(data.message || 'Failed to load history');
  }
  return data.data as SocialHistoryItem[];
}

export async function markSocialFavorite(postId: string, favorite = true) {
  const data = await apiClient.request<any>('/social/save', {
    method: 'POST',
    body: JSON.stringify({ postId, favorite })
  });
  return data.data as { id: string; is_favorite: boolean };
}

