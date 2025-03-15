import { MCPServer, MCPModel, MCPModelDefinition } from '@modelcontextprotocol/sdk';
import config from '../config';
import aivisSpeechService from './aivis-speech-service';
import { MCPSynthesisRequest, MCPSynthesisResponse } from '../types/mcp';
import { SynthesisRequest } from '../types/aivis-speech';

/**
 * MCPサービスクラス
 */
export class MCPService {
  private mcpServer: MCPServer;
  private modelDefinition: MCPModelDefinition;

  /**
   * コンストラクタ
   */
  constructor() {
    // MCPサーバーの初期化
    this.mcpServer = new MCPServer();

    // モデル定義の作成
    this.modelDefinition = {
      id: config.mcp.modelId,
      name: config.mcp.modelName,
      description: config.mcp.modelDescription,
      capabilities: config.mcp.capabilities,
      parameters: [
        {
          id: 'text',
          name: 'テキスト',
          description: '音声合成するテキスト',
          type: 'string',
          required: true,
        },
        {
          id: 'speaker_id',
          name: 'スピーカーID',
          description: '音声合成に使用するスピーカーのID',
          type: 'number',
          required: true,
        },
        {
          id: 'style_id',
          name: 'スタイルID',
          description: '音声合成に使用するスタイルのID',
          type: 'number',
          required: false,
        },
        {
          id: 'speed_scale',
          name: '話速',
          description: '話速のスケール（1.0が標準）',
          type: 'number',
          required: false,
          default: 1.0,
          minimum: 0.5,
          maximum: 2.0,
        },
        {
          id: 'pitch_scale',
          name: '音高',
          description: '音高のスケール（1.0が標準）',
          type: 'number',
          required: false,
          default: 1.0,
          minimum: 0.5,
          maximum: 2.0,
        },
        {
          id: 'intonation_scale',
          name: 'イントネーション',
          description: 'イントネーションのスケール（1.0が標準）',
          type: 'number',
          required: false,
          default: 1.0,
          minimum: 0.0,
          maximum: 2.0,
        },
        {
          id: 'volume_scale',
          name: '音量',
          description: '音量のスケール（1.0が標準）',
          type: 'number',
          required: false,
          default: 1.0,
          minimum: 0.0,
          maximum: 2.0,
        },
        {
          id: 'pre_phoneme_length',
          name: '先頭無音',
          description: '音声の先頭の無音時間（秒）',
          type: 'number',
          required: false,
          default: 0.1,
          minimum: 0.0,
          maximum: 1.0,
        },
        {
          id: 'post_phoneme_length',
          name: '末尾無音',
          description: '音声の末尾の無音時間（秒）',
          type: 'number',
          required: false,
          default: 0.1,
          minimum: 0.0,
          maximum: 1.0,
        },
        {
          id: 'output_sampling_rate',
          name: 'サンプリングレート',
          description: '出力音声のサンプリングレート（Hz）',
          type: 'number',
          required: false,
          default: 24000,
        },
      ],
    };

    // モデルの登録
    this.mcpServer.registerModel(this.modelDefinition, this.handleSynthesisRequest.bind(this));
  }

  /**
   * MCPサーバーを起動する
   * @param port ポート番号
   * @param host ホスト名
   */
  async start(port: number, host: string): Promise<void> {
    await this.mcpServer.start(port, host);
    console.log(`MCP Server started at http://${host}:${port}`);
  }

  /**
   * 音声合成リクエストを処理する
   * @param request MCPリクエスト
   * @returns MCP音声合成レスポンス
   */
  private async handleSynthesisRequest(request: MCPSynthesisRequest): Promise<MCPSynthesisResponse> {
    try {
      // リクエストパラメータの検証
      this.validateRequest(request);

      // AivisSpeech APIリクエストの作成
      const synthesisRequest: SynthesisRequest = {
        text: request.parameters.text,
        speaker: request.parameters.speaker_id,
        style_id: request.parameters.style_id,
        speed_scale: request.parameters.speed_scale,
        pitch_scale: request.parameters.pitch_scale,
        intonation_scale: request.parameters.intonation_scale,
        volume_scale: request.parameters.volume_scale,
        pre_phoneme_length: request.parameters.pre_phoneme_length,
        post_phoneme_length: request.parameters.post_phoneme_length,
        output_sampling_rate: request.parameters.output_sampling_rate,
      };

      // AivisSpeech APIを呼び出して音声合成を実行
      const response = await aivisSpeechService.synthesize(synthesisRequest);

      // MCPレスポンスを返す
      return {
        audio: response.audio,
        sampling_rate: response.sampling_rate,
      };
    } catch (error) {
      console.error('Synthesis request failed:', error);
      throw error;
    }
  }

  /**
   * リクエストパラメータを検証する
   * @param request MCPリクエスト
   */
  private validateRequest(request: MCPSynthesisRequest): void {
    // 必須パラメータの検証
    if (!request.parameters.text) {
      throw new Error('テキストは必須です');
    }

    if (request.parameters.speaker_id === undefined) {
      throw new Error('スピーカーIDは必須です');
    }

    // 数値パラメータの範囲検証
    if (request.parameters.speed_scale !== undefined && (request.parameters.speed_scale < 0.5 || request.parameters.speed_scale > 2.0)) {
      throw new Error('話速は0.5から2.0の範囲で指定してください');
    }

    if (request.parameters.pitch_scale !== undefined && (request.parameters.pitch_scale < 0.5 || request.parameters.pitch_scale > 2.0)) {
      throw new Error('音高は0.5から2.0の範囲で指定してください');
    }

    if (request.parameters.intonation_scale !== undefined && (request.parameters.intonation_scale < 0.0 || request.parameters.intonation_scale > 2.0)) {
      throw new Error('イントネーションは0.0から2.0の範囲で指定してください');
    }

    if (request.parameters.volume_scale !== undefined && (request.parameters.volume_scale < 0.0 || request.parameters.volume_scale > 2.0)) {
      throw new Error('音量は0.0から2.0の範囲で指定してください');
    }

    if (request.parameters.pre_phoneme_length !== undefined && (request.parameters.pre_phoneme_length < 0.0 || request.parameters.pre_phoneme_length > 1.0)) {
      throw new Error('先頭無音は0.0から1.0の範囲で指定してください');
    }

    if (request.parameters.post_phoneme_length !== undefined && (request.parameters.post_phoneme_length < 0.0 || request.parameters.post_phoneme_length > 1.0)) {
      throw new Error('末尾無音は0.0から1.0の範囲で指定してください');
    }
  }

  /**
   * モデル定義を取得する
   * @returns モデル定義
   */
  getModelDefinition(): MCPModelDefinition {
    return this.modelDefinition;
  }
}

// シングルトンインスタンスをエクスポート
export default new MCPService();
