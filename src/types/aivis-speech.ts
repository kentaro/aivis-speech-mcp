/**
 * AivisSpeech APIの型定義
 */

// スピーカー情報の型定義
export interface Speaker {
  name: string;
  speaker_id: number;
  styles: Style[];
  version: string;
}

// スタイル情報の型定義
export interface Style {
  name: string;
  id: number;
}

// 音声合成リクエストの型定義
export interface SynthesisRequest {
  text: string;
  speaker: number;
  style_id?: number;
  speed_scale?: number;
  pitch_scale?: number;
  intonation_scale?: number;
  volume_scale?: number;
  pre_phoneme_length?: number;
  post_phoneme_length?: number;
  output_sampling_rate?: number;
}

// 音声合成レスポンスの型定義
export interface SynthesisResponse {
  audio: string; // Base64エンコードされた音声データ
  sampling_rate: number;
}

// 音声合成のステータスレスポンスの型定義
export interface SynthesisStatusResponse {
  is_success: boolean;
  message: string;
}

// AivisSpeech APIのエンドポイント
export enum AivisSpeechEndpoint {
  SPEAKERS = '/speakers',
  SYNTHESIS = '/synthesis',
  AUDIO_QUERY = '/audio_query',
}
