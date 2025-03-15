/**
 * ロガーユーティリティ
 * アプリケーション全体で一貫したログ出力を提供します
 */

import winston from 'winston';

/**
 * ロガーの設定オプション
 */
export interface ILoggerOptions {
  /** ログレベル */
  level?: string;
  /** ログファイルのパス（指定しない場合はコンソールのみに出力） */
  filePath?: string;
}

/**
 * デフォルトのロガー設定
 */
const defaultOptions: ILoggerOptions = {
  level: 'info',
};

/**
 * ロガーを作成する
 * @param options - ロガーの設定オプション
 * @returns Winstonロガーインスタンス
 */
export function createLogger(options: ILoggerOptions = {}): winston.Logger {
  const mergedOptions = { ...defaultOptions, ...options };

  // トランスポートの設定
  const transports: winston.transport[] = [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, ...rest }) => {
          const restString = Object.keys(rest).length ? JSON.stringify(rest, null, 2) : '';
          return `${timestamp} [${level}]: ${message} ${restString}`;
        })
      ),
    }),
  ];

  // ファイル出力が指定されている場合は追加
  if (mergedOptions.filePath) {
    transports.push(
      new winston.transports.File({
        filename: mergedOptions.filePath,
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json()
        ),
      })
    );
  }

  // ロガーの作成
  return winston.createLogger({
    level: mergedOptions.level,
    transports,
  });
}

/**
 * デフォルトのロガーインスタンス
 * アプリケーション全体で共有して使用できます
 */
export const logger = createLogger();
