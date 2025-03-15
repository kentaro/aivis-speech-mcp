import dotenv from 'dotenv';
import path from 'path';

// .envファイルを読み込む
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

/**
 * 環境変数から設定を読み込む
 */
export const config = {
  // サーバー設定
  server: {
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
    host: process.env.HOST || 'localhost',
  },

  // AivisSpeech API設定
  aivisSpeech: {
    apiUrl: process.env.AIVIS_SPEECH_API_URL || 'http://localhost:50021',
  },

  // MCPモデル設定
  mcp: {
    modelId: 'aivis-speech-synthesis',
    modelName: 'AivisSpeech Synthesis',
    modelDescription: 'AivisSpeech音声合成モデル',
    capabilities: ['text-to-speech'],
  },
};

export default config;
