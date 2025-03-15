import axios from 'axios';
import fs from 'fs';
import path from 'path';
import wavPlayer from 'node-wav-player';
import dotenv from 'dotenv';
import {
  Speaker,
  SynthesisRequest,
  SynthesisResponse,
  AivisSpeechEndpoint,
  Style
} from '../types/aivis-speech';

// .envファイルを読み込む
dotenv.config();

/**
 * AivisSpeech APIとの通信を行うサービスクラス
 */
export class AivisSpeechService {
  private baseUrl: string;

  /**
   * コンストラクタ
   */
  constructor() {
    this.baseUrl = process.env.AIVIS_SPEECH_API_URL || 'http://localhost:10101';
    console.log('AivisSpeech API URL:', this.baseUrl);
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
      this.logDetailedError(error);
      throw new Error('スピーカー一覧の取得に失敗しました');
    }
  }

  /**
   * 指定されたIDのスピーカー情報を取得する
   * @param speakerId スピーカーID
   * @returns スピーカー情報（見つからない場合はundefined）
   */
  async getSpeakerById(speakerId: number): Promise<Speaker | undefined> {
    try {
      const speakers = await this.getSpeakers();
      return speakers.find(speaker => speaker.speaker_id === speakerId);
    } catch (error) {
      console.error(`Failed to get speaker by ID ${speakerId}:`, error);
      this.logDetailedError(error);
      throw new Error(`スピーカー情報の取得に失敗しました: ${this.getErrorMessage(error)}`);
    }
  }

  /**
   * 指定されたスピーカーIDとスタイルIDのスタイル情報を取得する
   * @param speakerId スピーカーID
   * @param styleId スタイルID
   * @returns スタイル情報（見つからない場合はundefined）
   */
  async getStyleById(speakerId: number, styleId: number): Promise<Style | undefined> {
    try {
      const speaker = await this.getSpeakerById(speakerId);
      if (!speaker) return undefined;
      return speaker.styles.find(style => style.id === styleId);
    } catch (error) {
      console.error(`Failed to get style by ID ${styleId} for speaker ${speakerId}:`, error);
      this.logDetailedError(error);
      throw new Error(`スタイル情報の取得に失敗しました: ${this.getErrorMessage(error)}`);
    }
  }

  /**
   * 音声合成を実行する
   * @param params 音声合成パラメータ
   * @returns 音声合成レスポンス
   */
  async synthesize(params: SynthesisRequest): Promise<SynthesisResponse> {
    try {
      // 1. まずaudio_queryを取得
      const queryUrl = `${this.baseUrl}/audio_query`;
      const queryResponse = await axios.post(
        queryUrl,
        null,
        {
          params: {
            text: params.text,
            speaker: params.speaker
          }
        }
      );

      // 2. audio_queryを取得したら、必要に応じてパラメータを更新
      const audioQuery = queryResponse.data;

      if (params.style_id !== undefined) {
        audioQuery.style_id = params.style_id;
      }

      if (params.speed_scale !== undefined) {
        audioQuery.speed_scale = params.speed_scale;
      }

      if (params.pitch_scale !== undefined) {
        audioQuery.pitch_scale = params.pitch_scale;
      }

      if (params.intonation_scale !== undefined) {
        audioQuery.intonation_scale = params.intonation_scale;
      }

      if (params.volume_scale !== undefined) {
        audioQuery.volume_scale = params.volume_scale;
      }

      if (params.pre_phoneme_length !== undefined) {
        audioQuery.pre_phoneme_length = params.pre_phoneme_length;
      }

      if (params.post_phoneme_length !== undefined) {
        audioQuery.post_phoneme_length = params.post_phoneme_length;
      }

      if (params.output_sampling_rate !== undefined) {
        audioQuery.output_sampling_rate = params.output_sampling_rate;
      }

      // 3. 更新したaudio_queryを使って音声合成
      const synthesisUrl = `${this.baseUrl}/synthesis`;
      const synthesisResponse = await axios.post<ArrayBuffer>(
        synthesisUrl,
        audioQuery,
        {
          responseType: 'arraybuffer',
          params: {
            speaker: params.speaker
          },
          headers: {
            'Accept': 'audio/wav',
            'Content-Type': 'application/json'
          }
        }
      );

      // 音声データを一時ファイルに保存して再生
      const audioData = synthesisResponse.data;
      const tempDir = path.join(process.cwd(), 'temp');

      // 一時ディレクトリが存在しない場合は作成
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      // 一時ファイルのパスを生成
      const audioFilePath = path.join(tempDir, `speech_${Date.now()}.wav`);

      // 音声データをファイルに書き込み
      fs.writeFileSync(audioFilePath, Buffer.from(audioData));

      // node-wav-playerを使って音声を再生（メディアプレイヤーが立ち上がらない）
      try {
        await wavPlayer.play({
          path: audioFilePath,
          sync: false // 非同期再生
        });
      } catch (playError) {
        console.error('Error playing audio:', playError);
      }

      return {
        audioData: synthesisResponse.data
      };
    } catch (error) {
      console.error('Error in synthesize:', error);
      this.logDetailedError(error);
      throw new Error(`音声合成に失敗しました: ${this.getErrorMessage(error)}`);
    }
  }

  /**
   * 詳細なエラー情報をログに出力する
   * @param error エラーオブジェクト
   */
  private logDetailedError(error: any): void {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // サーバーからのレスポンスがある場合
        console.error('Response error data:', error.response.data);
        console.error('Response error status:', error.response.status);
      } else if (error.request) {
        // リクエストは送信されたがレスポンスがない場合
        console.error('No response received. Request:', error.request);
      } else {
        // リクエスト設定中にエラーが発生した場合
        console.error('Error message:', error.message);
      }
    } else {
      // Axiosエラーでない場合
      console.error('Non-Axios error:', error);
    }
  }

  /**
   * エラーメッセージを取得する
   * @param error エラーオブジェクト
   * @returns エラーメッセージ
   */
  private getErrorMessage(error: any): string {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        return `サーバーエラー: ${error.response.status} - ${JSON.stringify(error.response.data)}`;
      } else if (error.request) {
        return `通信エラー: サーバーからの応答がありません`;
      } else {
        return `リクエストエラー: ${error.message}`;
      }
    }
    return error instanceof Error ? error.message : String(error);
  }
}

// シングルトンインスタンスをエクスポート
export default new AivisSpeechService();
