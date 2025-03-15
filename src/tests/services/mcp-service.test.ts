import { MCPServer } from '@modelcontextprotocol/sdk';
import { MCPService } from '../../services/mcp-service';
import aivisSpeechService from '../../services/aivis-speech-service';
import config from '../../config';
import { MCPSynthesisRequest } from '../../types/mcp';

// MCPサーバーのモック
jest.mock('@modelcontextprotocol/sdk', () => {
  return {
    MCPServer: jest.fn().mockImplementation(() => {
      return {
        registerModel: jest.fn(),
        start: jest.fn().mockResolvedValue(undefined),
      };
    }),
  };
});

// AivisSpeechサービスのモック
jest.mock('../../services/aivis-speech-service', () => {
  return {
    __esModule: true,
    default: {
      synthesize: jest.fn().mockResolvedValue({
        audio: 'base64encodedaudio',
        sampling_rate: 24000,
      }),
    },
  };
});

describe('MCPService', () => {
  let service: MCPService;
  let mcpServerMock: jest.Mocked<MCPServer>;

  beforeEach(() => {
    // テスト前にモックをリセット
    jest.clearAllMocks();

    // サービスのインスタンスを作成
    service = new MCPService();

    // MCPServerのモックを取得
    mcpServerMock = (MCPServer as jest.Mock).mock.instances[0] as jest.Mocked<MCPServer>;
  });

  describe('constructor', () => {
    it('MCPサーバーを初期化し、モデルを登録すること', () => {
      // MCPServerのコンストラクタが呼ばれたことを確認
      expect(MCPServer).toHaveBeenCalledTimes(1);

      // registerModelが呼ばれたことを確認
      expect(mcpServerMock.registerModel).toHaveBeenCalledTimes(1);

      // 登録されたモデル定義を確認
      const modelDefinition = service.getModelDefinition();
      expect(modelDefinition.id).toBe(config.mcp.modelId);
      expect(modelDefinition.name).toBe(config.mcp.modelName);
      expect(modelDefinition.description).toBe(config.mcp.modelDescription);
      expect(modelDefinition.capabilities).toEqual(config.mcp.capabilities);
      expect(modelDefinition.parameters.length).toBeGreaterThan(0);
    });
  });

  describe('start', () => {
    it('MCPサーバーを起動すること', async () => {
      // テスト用のポートとホスト
      const port = 3000;
      const host = 'localhost';

      // サービスを起動
      await service.start(port, host);

      // startが呼ばれたことを確認
      expect(mcpServerMock.start).toHaveBeenCalledTimes(1);
      expect(mcpServerMock.start).toHaveBeenCalledWith(port, host);
    });
  });

  describe('handleSynthesisRequest', () => {
    // privateメソッドをテストするためのヘルパー関数
    const invokeHandleSynthesisRequest = async (request: MCPSynthesisRequest) => {
      // registerModelの呼び出し時に渡されたコールバック関数を取得
      const callback = (mcpServerMock.registerModel as jest.Mock).mock.calls[0][1];

      // コールバック関数を呼び出す
      return await callback(request);
    };

    it('有効なリクエストを処理できること', async () => {
      // テスト用のリクエスト
      const request: MCPSynthesisRequest = {
        model: config.mcp.modelId,
        parameters: {
          text: 'こんにちは',
          speaker_id: 1,
          style_id: 1,
        },
      };

      // ハンドラを呼び出す
      const result = await invokeHandleSynthesisRequest(request);

      // AivisSpeechサービスが呼ばれたことを確認
      expect(aivisSpeechService.synthesize).toHaveBeenCalledTimes(1);
      expect(aivisSpeechService.synthesize).toHaveBeenCalledWith({
        text: 'こんにちは',
        speaker: 1,
        style_id: 1,
      });

      // 結果を確認
      expect(result).toEqual({
        audio: 'base64encodedaudio',
        sampling_rate: 24000,
      });
    });

    it('必須パラメータが欠けている場合にエラーをスローすること', async () => {
      // テキストが欠けているリクエスト
      const requestWithoutText: MCPSynthesisRequest = {
        model: config.mcp.modelId,
        parameters: {
          speaker_id: 1,
        } as any,
      };

      // ハンドラを呼び出して例外をキャッチ
      await expect(invokeHandleSynthesisRequest(requestWithoutText)).rejects.toThrow('テキストは必須です');

      // スピーカーIDが欠けているリクエスト
      const requestWithoutSpeakerId: MCPSynthesisRequest = {
        model: config.mcp.modelId,
        parameters: {
          text: 'こんにちは',
        } as any,
      };

      // ハンドラを呼び出して例外をキャッチ
      await expect(invokeHandleSynthesisRequest(requestWithoutSpeakerId)).rejects.toThrow('スピーカーIDは必須です');
    });

    it('パラメータの範囲が無効な場合にエラーをスローすること', async () => {
      // 話速が範囲外のリクエスト
      const requestWithInvalidSpeedScale: MCPSynthesisRequest = {
        model: config.mcp.modelId,
        parameters: {
          text: 'こんにちは',
          speaker_id: 1,
          speed_scale: 3.0, // 範囲外
        },
      };

      // ハンドラを呼び出して例外をキャッチ
      await expect(invokeHandleSynthesisRequest(requestWithInvalidSpeedScale)).rejects.toThrow('話速は0.5から2.0の範囲で指定してください');
    });
  });
});
