/**
 * 設定ユーティリティ
 * アプリケーションの設定を管理します
 */

import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';
import { logger } from './logger';

/**
 * アプリケーション設定のスキーマ
 */
export const configSchema = z.object({
  /** MCPサーバーのポート番号 */
  port: z.number().int().positive().default(3000),
  /** AivisSpeech-EngineのURL */
  aivisSpeechEngineUrl: z.string().url().default('http://localhost:10101'),
  /** 一時ファイルの保存ディレクトリ */
  tempDir: z.string().optional(),
  /** ログレベル */
  logLevel: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  /** ログファイルのパス */
  logFile: z.string().optional(),
});

/**
 * アプリケーション設定の型
 */
export type TConfig = z.infer<typeof configSchema>;

/**
 * デフォルト設定
 */
export const defaultConfig: TConfig = {
  port: 3000,
  aivisSpeechEngineUrl: 'http://localhost:10101',
  logLevel: 'info',
};

/**
 * アプリケーション設定
 */
export interface IAppConfig {
  /** サーバーポート */
  port: number;
  /** AivisSpeech-EngineのURL */
  aivisSpeechEngineUrl: string;
  /** ログレベル */
  logLevel: string;
}

/**
 * 環境変数から設定を読み込む
 * @returns アプリケーション設定
 */
export function loadEnvConfig(): IAppConfig {
  // .envファイルを読み込む
  const envPath = path.resolve(process.cwd(), '.env');
  const result = dotenv.config({ path: envPath });

  if (result.error) {
    logger.warn(`.envファイルの読み込みに失敗しました: ${envPath}`, { error: result.error });
    logger.warn('デフォルト設定またはプロセス環境変数を使用します');
  } else {
    logger.info(`環境変数を読み込みました: ${envPath}`);
  }

  // 環境変数から設定を取得
  const config: IAppConfig = {
    port: parseInt(process.env.PORT || '3000', 10),
    aivisSpeechEngineUrl: process.env.AIVIS_SPEECH_ENGINE_URL || 'http://127.0.0.1:10101',
    logLevel: process.env.LOG_LEVEL || 'info',
  };

  return config;
}

/**
 * 設定をファイルに保存する
 * @param config - 保存する設定
 * @param filePath - 設定ファイルのパス
 * @returns 保存に成功した場合はtrue、失敗した場合はfalse
 */
export function saveConfigToFile(config: TConfig, filePath: string): boolean {
  try {
    // スキーマ検証
    const validatedConfig = configSchema.parse(config);

    // ディレクトリが存在しない場合は作成
    const directory = path.dirname(filePath);
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }

    // ファイルに書き込み
    fs.writeFileSync(filePath, JSON.stringify(validatedConfig, null, 2), 'utf-8');
    logger.info(`設定ファイルを保存しました: ${filePath}`);

    return true;
  } catch (error) {
    logger.error(`設定ファイルの保存に失敗しました: ${filePath}`, { error });
    return false;
  }
}

/**
 * 環境変数から設定を読み込む
 * @returns 環境変数から読み込んだ設定
 */
export function loadConfigFromEnv(): Partial<TConfig> {
  const config: Partial<TConfig> = {};

  // 環境変数から設定を読み込む
  if (process.env.PORT) {
    const port = parseInt(process.env.PORT, 10);
    if (!isNaN(port) && port > 0) {
      config.port = port;
    }
  }

  if (process.env.AIVIS_SPEECH_ENGINE_URL) {
    config.aivisSpeechEngineUrl = process.env.AIVIS_SPEECH_ENGINE_URL;
  }

  if (process.env.TEMP_DIR) {
    config.tempDir = process.env.TEMP_DIR;
  }

  if (process.env.LOG_LEVEL) {
    const logLevel = process.env.LOG_LEVEL.toLowerCase();
    if (['error', 'warn', 'info', 'debug'].includes(logLevel)) {
      config.logLevel = logLevel as TConfig['logLevel'];
    }
  }

  if (process.env.LOG_FILE) {
    config.logFile = process.env.LOG_FILE;
  }

  return config;
}
