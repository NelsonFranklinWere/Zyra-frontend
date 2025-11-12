const CHAT_ENDPOINT = '/api/ai/chat';
const UPLOAD_ENDPOINT = '/api/ai/upload';

export interface ChatHistoryItem {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatMetadata {
  confidence?: number;
  suggestedFollowups?: string[];
  references?: string[];
}

export interface ChatResponse {
  success: boolean;
  content: string;
  type: string;
  metadata: ChatMetadata;
}

export async function sendChatMessage({
  message,
  mode,
  context,
  history
}: {
  message: string;
  mode: 'general' | 'cv' | 'social' | 'analysis';
  context: Record<string, unknown>;
  history: ChatHistoryItem[];
}): Promise<ChatResponse> {
  const response = await fetch(CHAT_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      mode,
      context,
      history
    })
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Chat request failed');
  }

  return {
    success: true,
    content: data.response.content,
    type: data.response.type || 'text',
    metadata: data.response.metadata || {}
  };
}

export async function uploadFileForChat({
  file,
  context
}: {
  file: File;
  context: Record<string, unknown>;
}) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('context', JSON.stringify(context));

  const response = await fetch(UPLOAD_ENDPOINT, {
    method: 'POST',
    body: formData
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'File upload failed');
  }

  return data;
}


