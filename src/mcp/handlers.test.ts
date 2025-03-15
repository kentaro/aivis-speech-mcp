/**
 * MCPサーバーのハンドラーのテスト
 */

import { MCPHandlers } from './handlers';
import { AivisSpeechClient } from '../api/client';
import { IAudioQuery, ISpeaker } from '../api/types';
import * as fileUtils from '../utils/file';

// AivisSpeechClientをモック化
jest.mock('../api/client');
const MockedAivisSpeechClient = AivisSpeechClient as jest.MockedClass<typeof AivisSpeechClient>;

// ファイルユーティリティをモック化
jest.mock('../utils/file');
const mockedFileUtils = fileUtils as jest.Mocked<typeof fileUtils>;

// loggerをモック化
jest.mock('../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('MCPHandlers', () => {
  // テスト用のモックデータ
  const mockSpeakers: ISpeaker[] = [
    {
      speaker_id: 1,
      name: 'テスト話者1',
      styles: [
        { id: 101, name: 'スタイル1' },
        { id: 102, name: 'スタイル2' },
      ],
      speaker_policy: 'テストポリシー',
      speaker_uuid: 'test-uuid-1',
    },
  ];

  const mockAudioQuery: IAudioQuery = {
    accent_phrases: [],
    speedScale: 1.0,
    pitchScale: 1.0,
    intonationScale: 1.0,
    volumeScale: 1.0,
    prePhonemeLength: 0.1,
    postPhonemeLength: 0.1,
    outputSamplingRate: 24000,
    outputStereo: false,
    kana: 'テスト',
  };

  const mockEngineInfo = {
    name: 'AivisSpeech-Engine',
    version: '1.0.0',
  };

  // テスト前の準備
  beforeEach(() => {
    // モックをリセット
    MockedAivisSpeechClient.mockClear();
    Object.values(mockedFileUtils).forEach(mock => {
      if (jest.isMockFunction(mock)) {
        mock.mockClear();
      }
    });
  });

  // synthesizeSpeechメソッドのテスト
  describe('synthesizeSpeech', () => {
    test('テキストから音声を合成して一時ファイルに保存できること', async () => {
      // モックの設定
      const mockClient = {
        createAudioQuery: jest.fn().mockResolvedValue(mockAudioQuery),
        adjustAudioQuery: jest.fn().mockReturnValue(mockAudioQuery),
        synthesize: jest.fn().mockResolvedValue(Buffer.from('test audio data')),
      };
      MockedAivisSpeechClient.mockImplementation(() => mockClient as unknown as AivisSpeechClient);
      mockedFileUtils.saveTempFile.mockReturnValue('/tmp/test.wav');

      const handlers = new MCPHandlers({
        aivisSpeechClient: new AivisSpeechClient({ baseUrl: 'http://localhost:10101' }),
      });

      const result = await handlers.synthesizeSpeech({
        text: 'テストテキスト',
        speaker_id: 101,
      });

      expect(mockClient.createAudioQuery).toHaveBeenCalledWith('テストテキスト', 101);
      expect(mockClient.synthesize).toHaveBeenCalledWith(mockAudioQuery, 101);
      expect(mockedFileUtils.saveTempFile).toHaveBeenCalled();
      expect(result).toEqual({ file_path: '/tmp/test.wav' });
    });

    test('テキストから音声を合成して指定されたパスに保存できること', async () => {
      // モックの設定
      const mockClient = {
        createAudioQuery: jest.fn().mockResolvedValue(mockAudioQuery),
        adjustAudioQuery: jest.fn().mockReturnValue(mockAudioQuery),
        synthesize: jest.fn().mockResolvedValue(Buffer.from('test audio data')),
      };
      MockedAivisSpeechClient.mockImplementation(() => mockClient as unknown as AivisSpeechClient);
      mockedFileUtils.saveBufferToFile.mockReturnValue('/path/to/output.wav');

      const handlers = new MCPHandlers({
        aivisSpeechClient: new AivisSpeechClient({ baseUrl: 'http://localhost:10101' }),
      });

      const result = await handlers.synthesizeSpeech({
        text: 'テストテキスト',
        speaker_id: 101,
        output_path: '/path/to/output.wav',
      });

      expect(mockClient.createAudioQuery).toHaveBeenCalledWith('テストテキスト', 101);
      expect(mockClient.synthesize).toHaveBeenCalledWith(mockAudioQuery, 101);
      expect(mockedFileUtils.saveBufferToFile).toHaveBeenCalled();
      expect(result).toEqual({ file_path: '/path/to/output.wav' });
    });

    test('パラメータを調整して音声を合成できること', async () => {
      // モックの設定
      const mockClient = {
        createAudioQuery: jest.fn().mockResolvedValue(mockAudioQuery),
        adjustAudioQuery: jest.fn().mockReturnValue({
          ...mockAudioQuery,
          speedScale: 1.5,
          pitchScale: 0.8,
        }),
        synthesize: jest.fn().mockResolvedValue(Buffer.from('test audio data')),
      };
      MockedAivisSpeechClient.mockImplementation(() => mockClient as unknown as AivisSpeechClient);
      mockedFileUtils.saveTempFile.mockReturnValue('/tmp/test.wav');

      const handlers = new MCPHandlers({
        aivisSpeechClient: new AivisSpeechClient({ baseUrl: 'http://localhost:10101' }),
      });

      const result = await handlers.synthesizeSpeech({
        text: 'テストテキスト',
        speaker_id: 101,
        speed_scale: 1.5,
        pitch_scale: 0.8,
      });

      expect(mockClient.createAudioQuery).toHaveBeenCalledWith('テストテキスト', 101);
      expect(mockClient.adjustAudioQuery).toHaveBeenCalledWith(mockAudioQuery, {
        speedScale: 1.5,
        pitchScale: 0.8,
        intonationScale: undefined,
        volumeScale: undefined,
      });
      expect(mockClient.synthesize).toHaveBeenCalled();
      expect(result).toEqual({ file_path: '/tmp/test.wav' });
    });

    test('音声合成に失敗した場合はエラーをスローすること', async () => {
      // モックの設定
      const mockClient = {
        createAudioQuery: jest.fn().mockRejectedValue(new Error('API Error')),
      };
      MockedAivisSpeechClient.mockImplementation(() => mockClient as unknown as AivisSpeechClient);

      const handlers = new MCPHandlers({
        aivisSpeechClient: new AivisSpeechClient({ baseUrl: 'http://localhost:10101' }),
      });

      await expect(handlers.synthesizeSpeech({
        text: 'テストテキスト',
        speaker_id: 101,
      })).rejects.toThrow('音声合成に失敗しました: API Error');
    });
  });

  // getSpeakersメソッドのテスト
  describe('getSpeakers', () => {
    test('話者一覧を取得できること', async () => {
      // モックの設定
      const mockClient = {
        getSpeakers: jest.fn().mockResolvedValue(mockSpeakers),
      };
      MockedAivisSpeechClient.mockImplementation(() => mockClient as unknown as AivisSpeechClient);

      const handlers = new MCPHandlers({
        aivisSpeechClient: new AivisSpeechClient({ baseUrl: 'http://localhost:10101' }),
      });

      const result = await handlers.getSpeakers({});

      expect(mockClient.getSpeakers).toHaveBeenCalled();
      expect(result).toEqual({ speakers: mockSpeakers });
    });

    test('話者一覧の取得に失敗した場合はエラーをスローすること', async () => {
      // モックの設定
      const mockClient = {
        getSpeakers: jest.fn().mockRejectedValue(new Error('API Error')),
      };
      MockedAivisSpeechClient.mockImplementation(() => mockClient as unknown as AivisSpeechClient);

      const handlers = new MCPHandlers({
        aivisSpeechClient: new AivisSpeechClient({ baseUrl: 'http://localhost:10101' }),
      });

      await expect(handlers.getSpeakers({})).rejects.toThrow('話者一覧の取得に失敗しました: API Error');
    });
  });

  // getSpeakerInfoメソッドのテスト
  describe('getSpeakerInfo', () => {
    test('話者情報を取得できること', async () => {
      // モックの設定
      const mockClient = {
        getSpeakerInfo: jest.fn().mockResolvedValue(mockSpeakers[0]),
      };
      MockedAivisSpeechClient.mockImplementation(() => mockClient as unknown as AivisSpeechClient);

      const handlers = new MCPHandlers({
        aivisSpeechClient: new AivisSpeechClient({ baseUrl: 'http://localhost:10101' }),
      });

      const result = await handlers.getSpeakerInfo({ speaker_id: 101 });

      expect(mockClient.getSpeakerInfo).toHaveBeenCalledWith(101);
      expect(result).toEqual({ speaker: mockSpeakers[0] });
    });

    test('話者情報の取得に失敗した場合はエラーをスローすること', async () => {
      // モックの設定
      const mockClient = {
        getSpeakerInfo: jest.fn().mockRejectedValue(new Error('API Error')),
      };
      MockedAivisSpeechClient.mockImplementation(() => mockClient as unknown as AivisSpeechClient);

      const handlers = new MCPHandlers({
        aivisSpeechClient: new AivisSpeechClient({ baseUrl: 'http://localhost:10101' }),
      });

      await expect(handlers.getSpeakerInfo({ speaker_id: 101 })).rejects.toThrow('話者情報の取得に失敗しました: API Error');
    });
  });

  // getEngineInfoメソッドのテスト
  describe('getEngineInfo', () => {
    test('エンジン情報を取得できること', async () => {
      // モックの設定
      const mockClient = {
        getEngineInfo: jest.fn().mockResolvedValue(mockEngineInfo),
      };
      MockedAivisSpeechClient.mockImplementation(() => mockClient as unknown as AivisSpeechClient);

      const handlers = new MCPHandlers({
        aivisSpeechClient: new AivisSpeechClient({ baseUrl: 'http://localhost:10101' }),
      });

      const result = await handlers.getEngineInfo({});

      expect(mockClient.getEngineInfo).toHaveBeenCalled();
      expect(result).toEqual({ engine_info: mockEngineInfo });
    });

    test('エンジン情報の取得に失敗した場合はエラーをスローすること', async () => {
      // モックの設定
      const mockClient = {
        getEngineInfo: jest.fn().mockRejectedValue(new Error('API Error')),
      };
      MockedAivisSpeechClient.mockImplementation(() => mockClient as unknown as AivisSpeechClient);

      const handlers = new MCPHandlers({
        aivisSpeechClient: new AivisSpeechClient({ baseUrl: 'http://localhost:10101' }),
      });

      await expect(handlers.getEngineInfo({})).rejects.toThrow('エンジン情報の取得に失敗しました: API Error');
    });
  });
});
