/**
 * MCPサーバーの型定義
 * MCPプロトコルに準拠した型を定義します
 * 参考: https://github.com/anthropics/anthropic-cookbook/tree/main/mcp
 */

/**
 * MCPリクエストの型
 */
export interface IMCPRequest {
  /** リクエストID */
  id: string;
  /** リクエストの種類 */
  type: 'function_call';
  /** 関数名 */
  name: string;
  /** 関数の引数 */
  args: Record<string, unknown>;
}

/**
 * MCPレスポンスの型
 */
export interface IMCPResponse {
  /** リクエストID */
  id: string;
  /** レスポンスの種類 */
  type: 'function_call_response';
  /** レスポンスの内容 */
  content: {
    /** レスポンスの種類 */
    type: 'success' | 'error';
    /** 成功時のレスポンス */
    value?: unknown;
    /** エラー時のエラー情報 */
    error?: {
      /** エラーの種類 */
      type: string;
      /** エラーメッセージ */
      message: string;
    };
  };
}

/**
 * MCPツールの型
 */
export interface IMCPTool {
  /** ツール名 */
  name: string;
  /** ツールの説明 */
  description: string;
  /** ツールのパラメータスキーマ */
  parameters: {
    /** パラメータの型 */
    type: string;
    /** パラメータのプロパティ */
    properties: Record<string, {
      /** プロパティの型 */
      type: string;
      /** プロパティの説明 */
      description: string;
      /** デフォルト値 */
      default?: unknown;
    }>;
    /** 必須パラメータ */
    required: string[];
  };
}

/**
 * MCPマニフェストの型
 */
export interface IMCPManifest {
  /** MCPプロトコルのバージョン */
  protocol_version: string;
  /** サーバーの名前 */
  name: string;
  /** サーバーの説明 */
  description: string;
  /** サーバーのバージョン */
  version: string;
  /** サーバーの作者 */
  author: string;
  /** サーバーのホームページ */
  homepage?: string;
  /** サーバーが提供するツール */
  tools: IMCPTool[];
}

/**
 * 音声合成ツールのパラメータ
 */
export interface ISynthesizeSpeechParams {
  /** 音声合成するテキスト */
  text: string;
  /** 話者（スタイル）ID */
  speaker_id: number;
  /** 出力ファイルパス（省略時は一時ファイル） */
  output_path?: string;
  /** 話速（1.0が標準） */
  speed_scale?: number;
  /** 音高（1.0が標準） */
  pitch_scale?: number;
  /** 抑揚（1.0が標準） */
  intonation_scale?: number;
  /** 音量（1.0が標準） */
  volume_scale?: number;
}

/**
 * 話者一覧取得ツールのパラメータ
 */
export interface IGetSpeakersParams {
  // パラメータなし
}

/**
 * 話者情報取得ツールのパラメータ
 */
export interface IGetSpeakerInfoParams {
  /** 話者（スタイル）ID */
  speaker_id: number;
}

/**
 * エンジン情報取得ツールのパラメータ
 */
export interface IGetEngineInfoParams {
  // パラメータなし
}
