import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import dotenv from 'dotenv';
import aivisSpeechService from './aivis-speech-service';
import { SynthesisRequest } from '../types/aivis-speech';

// .envファイルを読み込む
dotenv.config();

// MCPモデル設定
const MCP_MODEL_ID = 'aivis-speech-synthesis';
const MCP_MODEL_NAME = 'AivisSpeech Synthesis';

/**
 * MCPサービスクラス
 */
export class MCPService {
  private mcpServer: McpServer;

  /**
   * コンストラクタ
   */
  constructor() {
    // MCPサーバーの初期化
    this.mcpServer = new McpServer({
      name: MCP_MODEL_NAME,
      version: '1.0.0',
      description: 'AivisSpeech音声合成のMCPサーバー',
      capabilities: {
        tools: true
      }
    });

    // 音声合成ツールの登録
    this.mcpServer.tool(
      MCP_MODEL_ID,
      {
        text: z.string().describe('音声合成するテキスト'),
        speaker_id: z.number().optional().describe('音声合成に使用するスピーカーのID'),
        style_id: z.number().optional().describe('音声合成に使用するスタイルのID'),
        speed_scale: z.number().min(0.5).max(2.0).optional().default(1.0).describe('話速のスケール（1.0が標準）'),
        pitch_scale: z.number().min(0.5).max(2.0).optional().default(1.0).describe('音高のスケール（1.0が標準）'),
        intonation_scale: z.number().min(0.0).max(2.0).optional().default(1.0).describe('イントネーションのスケール（1.0が標準）'),
        volume_scale: z.number().min(0.0).max(2.0).optional().default(1.0).describe('音量のスケール（1.0が標準）'),
        pre_phoneme_length: z.number().min(0.0).max(1.0).optional().default(0.1).describe('音声の先頭の無音時間（秒）'),
        post_phoneme_length: z.number().min(0.0).max(1.0).optional().default(0.1).describe('音声の末尾の無音時間（秒）'),
        output_sampling_rate: z.number().optional().default(24000).describe('出力音声のサンプリングレート（Hz）'),
      },
      async (params, extra) => {
        try {
          // デフォルトのスピーカーIDを.envから取得
          const defaultSpeakerId = parseInt(process.env.AIVIS_SPEECH_SPEAKER_ID || '888753760', 10);

          // AivisSpeech APIリクエストの作成
          const synthesisRequest: SynthesisRequest = {
            text: params.text,
            speaker: params.speaker_id || defaultSpeakerId,
            style_id: params.style_id,
            speed_scale: params.speed_scale,
            pitch_scale: params.pitch_scale,
            intonation_scale: params.intonation_scale,
            volume_scale: params.volume_scale,
            pre_phoneme_length: params.pre_phoneme_length,
            post_phoneme_length: params.post_phoneme_length,
            output_sampling_rate: params.output_sampling_rate,
          };

          try {
            // AivisSpeech APIを呼び出して音声合成を実行
            await aivisSpeechService.synthesize(synthesisRequest);

            // 正しいMCPレスポンス形式で返す
            return {
              content: [
                {
                  type: "text",
                  text: `「${params.text}」の音声合成が完了しました`
                }
              ]
            };
          } catch (synthesisError) {
            console.error('Synthesis error:', synthesisError);
            const errorMessage = synthesisError instanceof Error ? synthesisError.message : '音声合成処理中にエラーが発生しました';
            return {
              content: [{ type: "text", text: `音声合成に失敗しました: ${errorMessage}` }],
              isError: true
            };
          }
        } catch (error) {
          console.error('Request handling error:', error);
          const errorMessage = error instanceof Error ? error.message : '音声合成リクエストの処理中にエラーが発生しました';
          return {
            content: [{ type: "text", text: `音声合成に失敗しました: ${errorMessage}` }],
            isError: true
          };
        }
      }
    );
  }

  /**
   * MCPサーバーを起動する
   */
  async start(): Promise<void> {
    console.log('Starting MCP Server with stdio transport...');

    try {
      // 標準入出力トランスポートを作成して接続
      const transport = new StdioServerTransport();
      await this.mcpServer.connect(transport);

      console.log('MCP Server started successfully');
      console.log(`Tool registered: ${MCP_MODEL_ID}`);
      console.log('Waiting for requests...');
    } catch (error) {
      console.error('Error starting MCP server:', error);
      throw error;
    }
  }
}

// シングルトンインスタンスをエクスポート
export default new MCPService();
