

export type GenerationStatus = 'pending' | 'completed' | 'failed';

export interface ModelSettings {
  // Add specific model settings based on RunPod requirements
  model?: string;
  prompt?: number;
  width?: number;
  height?: number; 
  // Add other settings as needed
}

export interface ImageGeneration {
  id: number;
  job_id: string;
  user_id: string | null;
  session_id: string | null;    // Updated to support UUID type
  prompt: string;
  name: string | null;
  favorite: boolean;
  status: GenerationStatus;
  image_url: string | null;
  model_settings: ModelSettings | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
  error_message: string | null;
}

export type CreateImageGeneration = Omit<
  ImageGeneration,
  'id' | 'created_at' | 'updated_at' | 'image_url' | 'status' | 'error_message'
>;

export type UpdateImageGeneration = Partial<
  Pick<ImageGeneration, 'name' | 'favorite' | 'tags' | 'status' | 'image_url' | 'error_message'>
>;
