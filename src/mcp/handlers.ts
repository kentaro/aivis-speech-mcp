/**
 * MCPサーバーのハンドラー
 * 各ツールの処理を実装します
 */

import { AivisSpeechClient } from '../api/client';
import {
  ISynthesizeSpeechParams,
  IGetSpeakersParams,
  IGetSpeakerInfoParams,
  IGetEngineInfoParams
} from './types';
import { saveTempFile, saveBufferToFile } from '../utils/file';
import { logger } from '../utils/logger';

/**
 * ハンドラーの設定
 */
export interface IHandlersConfig {
  /** AivisSpeech-EngineのAPIクライアント */
  aivisSpeechClient: AivisSpeechClient;
}

/**
 * MCPサーバーのハンドラー
 * 各ツールの処理を実装します
 */
export class MCPHandlers {
  /** AivisSpeech-EngineのAPIクライアント */
  private readonly aivisSpeechClient: AivisSpeechClient;

  /**
   * コンストラクタ
   * @param config - ハンドラーの設定
   */
  constructor(config: IHandlersConfig) {
    this.aivisSpeechClient = config.aivisSpeechClient;
  }

  /**
   * 音声合成ハンドラー
   * テキストを音声に変換します
   * @param params - 音声合成パラメータ
   * @returns 音声ファイルのパス
   */
  public async synthesizeSpeech(params: ISynthesizeSpeechParams): Promise<{ file_path: string }> {
    logger.info('音声合成を開始します', { text: params.text, speaker_id: params.speaker_id });

    try {
      // 音声合成クエリを生成
      const query = await this.aivisSpeechClient.createAudioQuery(params.text, params.speaker_id);

      // パラメータを調整
      if (params.speed_scale !== undefined ||
          params.pitch_scale !== undefined ||
          params.intonation_scale !== undefined ||
          params.volume_scale !== undefined) {
        this.aivisSpeechClient.adjustAudioQuery(query, {
          speedScale: params.speed_scale,
          pitchScale: params.pitch_scale,
          intonationScale: params.intonation_scale,
          volumeScale: params.volume_scale,
        });
      }

      // 音声を合成
      const audioData = await this.aivisSpeechClient.synthesize(query, params.speaker_id);

      // 音声ファイルを保存
      let filePath: string;
      if (params.output_path) {
        filePath = saveBufferToFile(audioData, params.output_path);
      } else {
        filePath = saveTempFile(audioData);
      }

      logger.info('音声合成が完了しました', { file_path: filePath });
      return { file_path: filePath };
    } catch (error) {
      logger.error('音声合成に失敗しました', { error });
      throw new Error(`音声合成に失敗しました: ${(error as Error).message}`);
    }
  }

  /**
   * 話者一覧取得ハンドラー
   * 利用可能な話者の一覧を取得します
   * @returns 話者情報の配列
   */
  public async getSpeakers(_params: IGetSpeakersParams): Promise<{ speakers: unknown[] }> {
    logger.info('話者一覧を取得します');

    try {
      const speakers = await this.aivisSpeechClient.getSpeakers();
      logger.info('話者一覧を取得しました', { count: speakers.length });
      return { speakers };
    } catch (error) {
      logger.error('話者一覧の取得に失敗しました', { error });
      throw new Error(`話者一覧の取得に失敗しました: ${(error as Error).message}`);
    }
  }

  /**
   * 話者情報取得ハンドラー
   * 指定されたスタイルIDの話者情報を取得します
   * @param params - 話者情報取得パラメータ
   * @returns 話者情報
   */
  public async getSpeakerInfo(params: IGetSpeakerInfoParams): Promise<{ speaker: unknown }> {
    logger.info('話者情報を取得します', { speaker_id: params.speaker_id });

    try {
      const speaker = await this.aivisSpeechClient.getSpeakerInfo(params.speaker_id);
      logger.info('話者情報を取得しました', { speaker_id: params.speaker_id });
      return { speaker };
    } catch (error) {
      logger.error('話者情報の取得に失敗しました', { speaker_id: params.speaker_id, error });
      throw new Error(`話者情報の取得に失敗しました: ${(error as Error).message}`);
    }
  }

  /**
   * エンジン情報取得ハンドラー
   * AivisSpeech-Engineの情報を取得します
   * @returns エンジン情報
   */
  public async getEngineInfo(_params: IGetEngineInfoParams): Promise<{ engine_info: unknown }> {
    logger.info('エンジン情報を取得します');

    try {
      const engineInfo = await this.aivisSpeechClient.getEngineInfo();
      logger.info('エンジン情報を取得しました');
      return { engine_info: engineInfo };
    } catch (error) {
      logger.error('エンジン情報の取得に失敗しました', { error });
      throw new Error(`エンジン情報の取得に失敗しました: ${(error as Error).message}`);
    }
  }
}
