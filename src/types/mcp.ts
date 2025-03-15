/**
 * MCP関連の型定義
 */

// MCPモデルの型定義
export interface MCPModel {
  id: string;
  name: string;
  description?: string;
  capabilities: string[];
  parameters: MCPParameter[];
}

// MCPパラメータの型定義
export interface MCPParameter {
  id: string;
  name: string;
  description?: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required: boolean;
  default?: any;
  enum?: any[];
  minimum?: number;
  maximum?: number;
}

// MCPリクエストの型定義
export interface MCPRequest {
  model: string;
  parameters: Record<string, any>;
}

// MCP音声合成リクエストの型定義
export interface MCPSynthesisRequest extends MCPRequest {
  parameters: {
    text: string;
    speaker_id: number;
    style_id?: number;
    speed_scale?: number;
    pitch_scale?: number;
    intonation_scale?: number;
    volume_scale?: number;
    pre_phoneme_length?: number;
    post_phoneme_length?: number;
    output_sampling_rate?: number;
  };
}

// MCP音声合成レスポンスの型定義
export interface MCPSynthesisResponse {
  audio: string; // Base64エンコードされた音声データ
  sampling_rate: number;
}

// MCPエラーレスポンスの型定義
export interface MCPErrorResponse {
  error: {
    message: string;
    type: string;
    param?: string;
    code?: string;
  };
}
