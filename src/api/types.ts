/**
 * AivisSpeech-EngineのAPI型定義
 * APIドキュメント: https://aivis-project.github.io/AivisSpeech-Engine/api/
 */

/**
 * 話者情報
 */
export interface ISpeaker {
  /** 話者ID */
  speaker_id: number;
  /** 話者名 */
  name: string;
  /** 話者のスタイル情報 */
  styles: ISpeakerStyle[];
  /** 話者のポリシー */
  speaker_policy: string;
  /** 話者のUUID */
  speaker_uuid: string;
}

/**
 * 話者のスタイル情報
 */
export interface ISpeakerStyle {
  /** スタイルID */
  id: number;
  /** スタイル名 */
  name: string;
}

/**
 * 音声合成クエリ
 */
export interface IAudioQuery {
  /** アクセント句のリスト */
  accent_phrases: IAccentPhrase[];
  /** 話速 */
  speedScale: number;
  /** 音高 */
  pitchScale: number;
  /** 抑揚 */
  intonationScale: number;
  /** 音量 */
  volumeScale: number;
  /** 前のポーズ時間 */
  prePhonemeLength: number;
  /** 後のポーズ時間 */
  postPhonemeLength: number;
  /** 全体の音程オフセット */
  outputSamplingRate: number;
  /** 出力サンプリングレート */
  outputStereo: boolean;
  /** ステレオ出力フラグ */
  kana: string;
}

/**
 * アクセント句
 */
export interface IAccentPhrase {
  /** モーラのリスト */
  moras: IMora[];
  /** アクセント句の音高 */
  accent: number;
  /** アクセント句の感情パラメータ */
  emotion_params?: Record<string, number>;
  /** アクセント句のパウゼ（休止）フラグ */
  is_interrogative: boolean;
}

/**
 * モーラ（日本語の音節単位）
 */
export interface IMora {
  /** テキスト */
  text: string;
  /** 発音記号 */
  consonant?: string;
  /** 子音の長さ */
  consonant_length?: number;
  /** 母音 */
  vowel: string;
  /** 母音の長さ */
  vowel_length: number;
  /** 音高 */
  pitch: number;
}

/**
 * エンジン情報
 * 文字列またはオブジェクトとして返される可能性があります
 */
export type TEngineInfo = string | {
  /** エンジン名 */
  name: string;
  /** エンジンのバージョン */
  version: string;
};

/**
 * 音声合成結果
 * バイナリデータとして返されるため、型は定義しない
 */
export type TAudioData = Buffer;

/**
 * エラーレスポンス
 */
export interface IErrorResponse {
  /** エラーメッセージ */
  error: {
    /** エラーコード */
    code: string;
    /** エラーメッセージ */
    message: string;
  };
}
