/**
 * MCPサーバー
 * MCPプロトコルに準拠したサーバーを実装します
 */

import express, { Request, Response } from 'express';
import {
  IMCPRequest,
  IMCPResponse,
  IMCPManifest,
  IMCPTool,
  ISynthesizeSpeechParams,
  IGetSpeakersParams,
  IGetSpeakerInfoParams,
  IGetEngineInfoParams,
} from './types';
import { MCPHandlers } from './handlers';
import { logger } from '../utils/logger';
import { z } from 'zod';

/**
 * MCPサーバーの設定
 */
export interface IMCPServerConfig {
  /** サーバーのポート番号 */
  port: number;
  /** MCPハンドラー */
  handlers: MCPHandlers;
}

/**
 * MCPサーバー
 * MCPプロトコルに準拠したサーバーを実装します
 */
export class MCPServer {
  /** Expressアプリケーション */
  private readonly app: express.Application;
  /** サーバーのポート番号 */
  private readonly port: number;
  /** MCPハンドラー */
  private readonly handlers: MCPHandlers;
  /** HTTPサーバー */
  private server: ReturnType<typeof express.application.listen> | null = null;

  /**
   * コンストラクタ
   * @param config - MCPサーバーの設定
   */
  constructor(config: IMCPServerConfig) {
    this.port = config.port;
    this.handlers = config.handlers;
    this.app = express();

    // JSONボディパーサーを設定
    this.app.use(express.json());

    // ルートハンドラーを設定
    this.setupRoutes();
  }

  /**
   * ルートハンドラーを設定
   */
  private setupRoutes(): void {
    // マニフェストエンドポイント
    this.app.get('/manifest.json', this.handleManifest.bind(this));

    // MCPエンドポイント
    this.app.post('/mcp', this.handleMCP.bind(this));

    // ヘルスチェックエンドポイント
    this.app.get('/health', (_req: Request, res: Response) => {
      res.status(200).json({ status: 'ok' });
    });

    // 404ハンドラー
    this.app.use((_req: Request, res: Response) => {
      res.status(404).json({ error: { message: 'Not Found' } });
    });

    // エラーハンドラー
    this.app.use((err: Error, _req: Request, res: Response, _next: express.NextFunction) => {
      logger.error('サーバーエラーが発生しました', { error: err });
      res.status(500).json({ error: { message: 'Internal Server Error' } });
    });
  }

  /**
   * マニフェストハンドラー
   * @param _req - リクエスト
   * @param res - レスポンス
   */
  private handleManifest(_req: Request, res: Response): void {
    const manifest: IMCPManifest = {
      protocol_version: '0.1',
      name: 'aivis-speech-mcp',
      description: 'AivisSpeech-EngineのMCPサーバー',
      version: '0.1.0',
      author: '',
      tools: this.getTools(),
    };

    res.status(200).json(manifest);
  }

  /**
   * MCPハンドラー
   * @param req - リクエスト
   * @param res - レスポンス
   */
  private async handleMCP(req: Request, res: Response): Promise<void> {
    try {
      // リクエストの検証
      const mcpRequest = this.validateMCPRequest(req.body);

      // リクエストのログ
      logger.info('MCPリクエストを受信しました', {
        id: mcpRequest.id,
        name: mcpRequest.name,
      });

      // ハンドラーの呼び出し
      const result = await this.callHandler(mcpRequest);

      // レスポンスの作成
      const mcpResponse: IMCPResponse = {
        id: mcpRequest.id,
        type: 'function_call_response',
        content: {
          type: 'success',
          value: result,
        },
      };

      // レスポンスのログ
      logger.info('MCPレスポンスを送信します', { id: mcpRequest.id });

      // レスポンスの送信
      res.status(200).json(mcpResponse);
    } catch (error) {
      // エラーのログ
      logger.error('MCPリクエストの処理中にエラーが発生しました', { error });

      // エラーレスポンスの作成
      const errorResponse: IMCPResponse = {
        id: req.body.id || 'unknown',
        type: 'function_call_response',
        content: {
          type: 'error',
          error: {
            type: 'internal_error',
            message: (error as Error).message || 'Unknown error',
          },
        },
      };

      // エラーレスポンスの送信
      res.status(200).json(errorResponse);
    }
  }

  /**
   * MCPリクエストを検証する
   * @param body - リクエストボディ
   * @returns 検証済みのMCPリクエスト
   */
  private validateMCPRequest(body: unknown): IMCPRequest {
    // リクエストスキーマ
    const requestSchema = z.object({
      id: z.string(),
      type: z.literal('function_call'),
      name: z.string(),
      args: z.record(z.unknown()),
    });

    try {
      return requestSchema.parse(body);
    } catch (error) {
      logger.error('MCPリクエストの検証に失敗しました', { error, body });
      throw new Error('Invalid MCP request');
    }
  }

  /**
   * ハンドラーを呼び出す
   * @param request - MCPリクエスト
   * @returns ハンドラーの実行結果
   */
  private async callHandler(request: IMCPRequest): Promise<unknown> {
    switch (request.name) {
      case 'synthesize_speech': {
        // 安全な型変換
        const args = request.args as Record<string, unknown>;
        const params: ISynthesizeSpeechParams = {
          text: String(args.text || ''),
          speaker_id: Number(args.speaker_id || 0),
          output_path: args.output_path ? String(args.output_path) : undefined,
          speed_scale: args.speed_scale ? Number(args.speed_scale) : undefined,
          pitch_scale: args.pitch_scale ? Number(args.pitch_scale) : undefined,
          intonation_scale: args.intonation_scale ? Number(args.intonation_scale) : undefined,
          volume_scale: args.volume_scale ? Number(args.volume_scale) : undefined,
        };
        return this.handlers.synthesizeSpeech(params);
      }
      case 'get_speakers':
        return this.handlers.getSpeakers(request.args as IGetSpeakersParams);
      case 'get_speaker_info': {
        // 安全な型変換
        const args = request.args as Record<string, unknown>;
        const params: IGetSpeakerInfoParams = {
          speaker_id: Number(args.speaker_id || 0),
        };
        return this.handlers.getSpeakerInfo(params);
      }
      case 'get_engine_info':
        return this.handlers.getEngineInfo(request.args as IGetEngineInfoParams);
      default:
        throw new Error(`Unknown function: ${request.name}`);
    }
  }

  /**
   * サポートするツールの定義を取得する
   * @returns ツールの定義
   */
  private getTools(): IMCPTool[] {
    return [
      {
        name: 'synthesize_speech',
        description: '指定されたテキストを音声に変換します',
        parameters: {
          type: 'object',
          properties: {
            text: {
              type: 'string',
              description: '音声合成するテキスト',
            },
            speaker_id: {
              type: 'integer',
              description: '話者（スタイル）ID',
            },
            output_path: {
              type: 'string',
              description: '出力ファイルパス（省略時は一時ファイル）',
            },
            speed_scale: {
              type: 'number',
              description: '話速（1.0が標準）',
              default: 1.0,
            },
            pitch_scale: {
              type: 'number',
              description: '音高（1.0が標準）',
              default: 1.0,
            },
            intonation_scale: {
              type: 'number',
              description: '抑揚（1.0が標準）',
              default: 1.0,
            },
            volume_scale: {
              type: 'number',
              description: '音量（1.0が標準）',
              default: 1.0,
            },
          },
          required: ['text', 'speaker_id'],
        },
      },
      {
        name: 'get_speakers',
        description: '利用可能な話者の一覧を取得します',
        parameters: {
          type: 'object',
          properties: {},
          required: [],
        },
      },
      {
        name: 'get_speaker_info',
        description: '指定されたスタイルIDの話者情報を取得します',
        parameters: {
          type: 'object',
          properties: {
            speaker_id: {
              type: 'integer',
              description: '話者（スタイル）ID',
            },
          },
          required: ['speaker_id'],
        },
      },
      {
        name: 'get_engine_info',
        description: 'AivisSpeech-Engineの情報を取得します',
        parameters: {
          type: 'object',
          properties: {},
          required: [],
        },
      },
    ];
  }

  /**
   * サーバーを起動する
   * @returns サーバーインスタンス
   */
  public start(): ReturnType<typeof express.application.listen> {
    if (this.server) {
      logger.warn('サーバーはすでに起動しています');
      return this.server;
    }

    this.server = this.app.listen(this.port, () => {
      logger.info(`MCPサーバーを起動しました: http://localhost:${this.port}`);
    });

    return this.server;
  }

  /**
   * サーバーを停止する
   */
  public stop(): void {
    if (!this.server) {
      logger.warn('サーバーは起動していません');
      return;
    }

    this.server.close(() => {
      logger.info('MCPサーバーを停止しました');
      this.server = null;
    });
  }
}
