/**
 * AivisSpeech-EngineのMCPサーバー
 * アプリケーションのエントリーポイント
 */

import { AivisSpeechClient } from './api/client';
import { MCPHandlers } from './mcp/handlers';
import { MCPServer } from './mcp/server';
import { loadEnvConfig } from './utils/config';
import { logger } from './utils/logger';

/**
 * メイン関数
 * アプリケーションのエントリーポイント
 */
async function main(): Promise<void> {
  try {
    // 設定の読み込み（.envファイルのみを使用）
    const config = loadEnvConfig();

    // ロガーの設定
    logger.level = config.logLevel;

    // AivisSpeech-EngineのAPIクライアントを作成
    const aivisSpeechClient = new AivisSpeechClient({
      baseUrl: config.aivisSpeechEngineUrl,
    });

    // MCPハンドラーを作成
    const mcpHandlers = new MCPHandlers({
      aivisSpeechClient,
    });

    // MCPサーバーを作成
    const mcpServer = new MCPServer({
      port: config.port,
      handlers: mcpHandlers,
    });

    // サーバーを起動
    mcpServer.start();

    // プロセス終了時の処理
    process.on('SIGINT', () => {
      logger.info('SIGINTを受信しました、サーバーを停止します');
      mcpServer.stop();
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      logger.info('SIGTERMを受信しました、サーバーを停止します');
      mcpServer.stop();
      process.exit(0);
    });

    // エンジン情報を取得して表示
    try {
      const engineInfo = await aivisSpeechClient.getEngineInfo();

      // デバッグ用にエンジン情報の型を出力
      logger.debug(`エンジン情報の型: ${typeof engineInfo}`);
      logger.debug('エンジン情報:', { engineInfo });

      if (typeof engineInfo === 'string') {
        // 文字列の場合はバージョン情報として表示
        logger.info(`AivisSpeech-Engineに接続しました: バージョン ${engineInfo}`);
      } else if (engineInfo && typeof engineInfo === 'object' && 'name' in engineInfo && 'version' in engineInfo) {
        // オブジェクトの場合は名前とバージョンを表示
        logger.info(`AivisSpeech-Engineに接続しました: ${engineInfo.name} ${engineInfo.version}`);
      } else {
        // 不完全な情報の場合は警告
        logger.warn('AivisSpeech-Engineから不完全な情報が返されました', { engineInfo });
        logger.warn('AivisSpeech-Engineが正しく設定されているか確認してください');
      }
    } catch (error) {
      logger.warn(`AivisSpeech-Engineに接続できませんでした: ${config.aivisSpeechEngineUrl}`, { error });
      logger.warn('AivisSpeech-Engineが起動していることを確認してください');
      logger.warn('MCPサーバーは起動しますが、音声合成機能は利用できません');
    }

    logger.info(`MCPサーバーを起動しました: http://localhost:${config.port}`);
    logger.info('Ctrl+Cで終了します');
  } catch (error) {
    logger.error('アプリケーションの起動に失敗しました', { error });
    process.exit(1);
  }
}

// アプリケーションを起動
if (require.main === module) {
  main().catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

export { main };
