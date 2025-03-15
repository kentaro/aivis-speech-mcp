/**
 * AivisSpeech-EngineのAPIクライアントのテスト
 */

import axios from 'axios';
import { AivisSpeechClient } from './client';
import { IAudioQuery, ISpeaker } from './types';

// axiosをモック化
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AivisSpeechClient', () => {
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
    {
      speaker_id: 2,
      name: 'テスト話者2',
      styles: [
        { id: 201, name: 'スタイル3' },
      ],
      speaker_policy: 'テストポリシー',
      speaker_uuid: 'test-uuid-2',
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

  // テスト前の準備
  beforeEach(() => {
    // axiosのcreateメソッドをモック化
    mockedAxios.create.mockReturnValue({
      get: jest.fn(),
      post: jest.fn(),
      interceptors: {
        response: {
          use: jest.fn(),
        },
      },
    } as any);
  });

  // テスト後のクリーンアップ
  afterEach(() => {
    jest.clearAllMocks();
  });

  // コンストラクタのテスト
  test('コンストラクタが正しくインスタンスを初期化すること', () => {
    const client = new AivisSpeechClient({ baseUrl: 'http://localhost:10101' });
    expect(mockedAxios.create).toHaveBeenCalledWith(expect.objectContaining({
      baseURL: 'http://localhost:10101',
    }));
  });

  // getSpeakersメソッドのテスト
  test('getSpeakersが話者一覧を取得できること', async () => {
    const mockGet = jest.fn().mockResolvedValue({ data: mockSpeakers });
    mockedAxios.create.mockReturnValue({
      get: mockGet,
      interceptors: {
        response: {
          use: jest.fn(),
        },
      },
    } as any);

    const client = new AivisSpeechClient({ baseUrl: 'http://localhost:10101' });
    const speakers = await client.getSpeakers();

    expect(mockGet).toHaveBeenCalledWith('/speakers');
    expect(speakers).toEqual(mockSpeakers);
  });

  // getSpeakerInfoメソッドのテスト
  test('getSpeakerInfoが指定されたスタイルIDの話者情報を取得できること', async () => {
    const mockGet = jest.fn().mockResolvedValue({ data: mockSpeakers });
    mockedAxios.create.mockReturnValue({
      get: mockGet,
      interceptors: {
        response: {
          use: jest.fn(),
        },
      },
    } as any);

    const client = new AivisSpeechClient({ baseUrl: 'http://localhost:10101' });
    const speaker = await client.getSpeakerInfo(102);

    expect(mockGet).toHaveBeenCalledWith('/speakers');
    expect(speaker).toEqual(mockSpeakers[0]);
  });

  // getSpeakerInfoメソッドのエラーケースのテスト
  test('getSpeakerInfoが存在しないスタイルIDでエラーをスローすること', async () => {
    const mockGet = jest.fn().mockResolvedValue({ data: mockSpeakers });
    mockedAxios.create.mockReturnValue({
      get: mockGet,
      interceptors: {
        response: {
          use: jest.fn(),
        },
      },
    } as any);

    const client = new AivisSpeechClient({ baseUrl: 'http://localhost:10101' });
    await expect(client.getSpeakerInfo(999)).rejects.toThrow('Speaker with style ID 999 not found');
  });

  // createAudioQueryメソッドのテスト
  test('createAudioQueryがテキストから音声合成クエリを生成できること', async () => {
    const mockPost = jest.fn().mockResolvedValue({ data: mockAudioQuery });
    mockedAxios.create.mockReturnValue({
      post: mockPost,
      interceptors: {
        response: {
          use: jest.fn(),
        },
      },
    } as any);

    const client = new AivisSpeechClient({ baseUrl: 'http://localhost:10101' });
    const query = await client.createAudioQuery('テストテキスト', 101);

    expect(mockPost).toHaveBeenCalledWith(
      '/audio_query',
      null,
      expect.objectContaining({
        params: {
          text: 'テストテキスト',
          speaker: 101,
        },
      })
    );
    expect(query).toEqual(mockAudioQuery);
  });

  // synthesizeメソッドのテスト
  test('synthesizeが音声合成クエリから音声を合成できること', async () => {
    const mockAudioData = Buffer.from('test audio data');
    const mockPost = jest.fn().mockResolvedValue({
      data: mockAudioData.buffer
    });
    mockedAxios.create.mockReturnValue({
      post: mockPost,
      interceptors: {
        response: {
          use: jest.fn(),
        },
      },
    } as any);

    const client = new AivisSpeechClient({ baseUrl: 'http://localhost:10101' });
    const audioData = await client.synthesize(mockAudioQuery, 101);

    expect(mockPost).toHaveBeenCalledWith(
      '/synthesis',
      mockAudioQuery,
      expect.objectContaining({
        params: {
          speaker: 101,
        },
        responseType: 'arraybuffer',
      })
    );
    expect(audioData).toBeInstanceOf(Buffer);
  });

  // adjustAudioQueryメソッドのテスト
  test('adjustAudioQueryが音声合成クエリのパラメータを調整できること', () => {
    const client = new AivisSpeechClient({ baseUrl: 'http://localhost:10101' });
    const adjustedQuery = client.adjustAudioQuery(mockAudioQuery, {
      speedScale: 1.5,
      pitchScale: 0.8,
    });

    expect(adjustedQuery).toEqual({
      ...mockAudioQuery,
      speedScale: 1.5,
      pitchScale: 0.8,
    });
  });
});
