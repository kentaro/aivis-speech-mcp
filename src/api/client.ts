/**
 * AivisSpeech-EngineのAPIクライアント
 * APIドキュメント: https://aivis-project.github.io/AivisSpeech-Engine/api/
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import {
  ISpeaker,
  IAudioQuery,
  TAudioData,
  TEngineInfo,
  IErrorResponse
} from './types';

/**
 * AivisSpeech-EngineのAPIクライアント設定
 */
export interface IAivisSpeechClientConfig {
  /** APIのベースURL */
  baseUrl: string;
  /** タイムアウト（ミリ秒） */
  timeout?: number;
}

/**
 * AivisSpeech-EngineのAPIクライアント
 * AivisSpeech-EngineのREST APIを呼び出すためのクライアント
 */
export class AivisSpeechClient {
  /** Axiosインスタンス */
  private readonly client: AxiosInstance;

  /**
   * コンストラクタ
   * @param config - クライアント設定
   */
  constructor(config: IAivisSpeechClientConfig) {
    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout || 30000, // デフォルトタイムアウト: 30秒
      responseType: 'json',
    });

    // エラーハンドリングのためのインターセプター
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          // APIからのエラーレスポンス
          const errorResponse = error.response.data as IErrorResponse;
          throw new Error(`API Error: ${errorResponse.error?.message || 'Unknown API error'}`);
        } else if (error.request) {
          // リクエストは送信されたがレスポンスがない
          throw new Error(`No response from server: ${error.message}`);
        } else {
          // リクエスト設定中にエラーが発生
          throw new Error(`Request error: ${error.message}`);
        }
      }
    );
  }

  /**
   * 利用可能な話者の一覧を取得
   * @returns 話者情報の配列
   */
  public async getSpeakers(): Promise<ISpeaker[]> {
    const response = await this.client.get<ISpeaker[]>('/speakers');
    return response.data;
  }

  /**
   * 指定されたスタイルIDの話者情報を取得
   * @param styleId - スタイルID
   * @returns 話者情報
   */
  public async getSpeakerInfo(styleId: number): Promise<ISpeaker> {
    const speakers = await this.getSpeakers();

    // スタイルIDに一致する話者を検索
    for (const speaker of speakers) {
      for (const style of speaker.styles) {
        if (style.id === styleId) {
          return speaker;
        }
      }
    }

    throw new Error(`Speaker with style ID ${styleId} not found`);
  }

  /**
   * テキストから音声合成用のクエリを生成
   * @param text - 音声合成するテキスト
   * @param styleId - スタイルID
   * @returns 音声合成クエリ
   */
  public async createAudioQuery(text: string, styleId: number): Promise<IAudioQuery> {
    const response = await this.client.post<IAudioQuery>(
      '/audio_query',
      null,
      {
        params: {
          text,
          speaker: styleId,
        },
      }
    );
    return response.data;
  }

  /**
   * 音声合成クエリから音声を合成
   * @param query - 音声合成クエリ
   * @param styleId - スタイルID
   * @returns 音声データ（バイナリ）
   */
  public async synthesize(query: IAudioQuery, styleId: number): Promise<TAudioData> {
    const response = await this.client.post<TAudioData>(
      '/synthesis',
      query,
      {
        params: {
          speaker: styleId,
        },
        responseType: 'arraybuffer',
      } as AxiosRequestConfig
    );
    return Buffer.from(response.data as unknown as ArrayBuffer);
  }

  /**
   * テキストから直接音声を合成（createAudioQueryとsynthesizeを連続で呼び出す）
   * @param text - 音声合成するテキスト
   * @param styleId - スタイルID
   * @returns 音声データ（バイナリ）
   */
  public async synthesizeFromText(text: string, styleId: number): Promise<TAudioData> {
    const query = await this.createAudioQuery(text, styleId);
    return this.synthesize(query, styleId);
  }

  /**
   * エンジン情報を取得
   * @returns エンジン情報
   */
  public async getEngineInfo(): Promise<TEngineInfo> {
    const response = await this.client.get<TEngineInfo>('/version');
    return response.data;
  }

  /**
   * 音声合成クエリのパラメータを調整
   * @param query - 元の音声合成クエリ
   * @param params - 調整するパラメータ
   * @returns 調整された音声合成クエリ
   */
  public adjustAudioQuery(
    query: IAudioQuery,
    params: Partial<Pick<IAudioQuery, 'speedScale' | 'pitchScale' | 'intonationScale' | 'volumeScale'>>
  ): IAudioQuery {
    return {
      ...query,
      ...params,
    };
  }
}
