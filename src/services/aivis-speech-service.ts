import axios from 'axios';
import config from '../config';
import {
  Speaker,
  Style,
  SynthesisRequest,
  SynthesisResponse,
  AivisSpeechEndpoint
} from '../types/aivis-speech';

/**
 * AivisSpeech APIとの通信を行うサービスクラス
 */
export class AivisSpeechService {
  private baseUrl: string;

  /**
   * コンストラクタ
   */
  constructor() {
    this.baseUrl = config.aivisSpeech.apiUrl;
  }

  /**
   * 利用可能なスピーカー一覧を取得する
   * @returns スピーカー一覧
   */
  async getSpeakers(): Promise<Speaker[]> {
    try {
      const response = await axios.get<Speaker[]>(`${this.baseUrl}${AivisSpeechEndpoint.SPEAKERS}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get speakers:', error);
      throw new Error('スピーカー一覧の取得に失敗しました');
    }
  }

  /**
   * 音声合成を実行する
   * @param request 音声合成リクエスト
   * @returns 音声合成レスポンス
   */
  async synthesize(request: SynthesisRequest): Promise<SynthesisResponse> {
    try {
      const response = await axios.post<SynthesisResponse>(
        `${this.baseUrl}${AivisSpeechEndpoint.SYNTHESIS}`,
        request
      );
      return response.data;
    } catch (error) {
      console.error('Failed to synthesize speech:', error);
      throw new Error('音声合成に失敗しました');
    }
  }

  /**
   * スピーカーIDからスピーカー情報を取得する
   * @param speakerId スピーカーID
   * @returns スピーカー情報
   */
  async getSpeakerById(speakerId: number): Promise<Speaker | undefined> {
    const speakers = await this.getSpeakers();
    return speakers.find(speaker => speaker.speaker_id === speakerId);
  }

  /**
   * スピーカーIDとスタイルIDからスタイル情報を取得する
   * @param speakerId スピーカーID
   * @param styleId スタイルID
   * @returns スタイル情報
   */
  async getStyleById(speakerId: number, styleId: number): Promise<Style | undefined> {
    const speaker = await this.getSpeakerById(speakerId);
    return speaker?.styles.find(style => style.id === styleId);
  }
}

// シングルトンインスタンスをエクスポート
export default new AivisSpeechService();
