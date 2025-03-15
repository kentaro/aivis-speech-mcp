import axios from 'axios';
import { AivisSpeechService } from '../../services/aivis-speech-service';
import { Speaker, Style, SynthesisRequest, SynthesisResponse } from '../../types/aivis-speech';

// axiosのモック
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AivisSpeechService', () => {
  let service: AivisSpeechService;

  // テスト用のモックデータ
  const mockSpeakers: Speaker[] = [
    {
      name: 'テストスピーカー1',
      speaker_id: 1,
      styles: [
        { name: 'スタイル1', id: 1 },
        { name: 'スタイル2', id: 2 },
      ],
      version: '1.0.0',
    },
    {
      name: 'テストスピーカー2',
      speaker_id: 2,
      styles: [
        { name: 'スタイル3', id: 3 },
      ],
      version: '1.0.0',
    },
  ];

  const mockSynthesisResponse: SynthesisResponse = {
    audio: 'base64encodedaudio',
    sampling_rate: 24000,
  };

  beforeEach(() => {
    // テスト前にモックをリセット
    jest.clearAllMocks();

    // サービスのインスタンスを作成
    service = new AivisSpeechService();
  });

  describe('getSpeakers', () => {
    it('スピーカー一覧を取得できること', async () => {
      // モックの設定
      mockedAxios.get.mockResolvedValueOnce({ data: mockSpeakers });

      // テスト対象の関数を実行
      const result = await service.getSpeakers();

      // 結果の検証
      expect(result).toEqual(mockSpeakers);
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringContaining('/speakers'));
    });

    it('APIエラー時に例外をスローすること', async () => {
      // モックの設定
      mockedAxios.get.mockRejectedValueOnce(new Error('API error'));

      // テスト対象の関数を実行して例外をキャッチ
      await expect(service.getSpeakers()).rejects.toThrow('スピーカー一覧の取得に失敗しました');

      // 呼び出しの検証
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
  });

  describe('synthesize', () => {
    it('音声合成を実行できること', async () => {
      // モックの設定
      mockedAxios.post.mockResolvedValueOnce({ data: mockSynthesisResponse });

      // テスト用のリクエスト
      const request: SynthesisRequest = {
        text: 'こんにちは',
        speaker: 1,
        style_id: 1,
      };

      // テスト対象の関数を実行
      const result = await service.synthesize(request);

      // 結果の検証
      expect(result).toEqual(mockSynthesisResponse);
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/synthesis'),
        request
      );
    });

    it('APIエラー時に例外をスローすること', async () => {
      // モックの設定
      mockedAxios.post.mockRejectedValueOnce(new Error('API error'));

      // テスト用のリクエスト
      const request: SynthesisRequest = {
        text: 'こんにちは',
        speaker: 1,
      };

      // テスト対象の関数を実行して例外をキャッチ
      await expect(service.synthesize(request)).rejects.toThrow('音声合成に失敗しました');

      // 呼び出しの検証
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });
  });

  describe('getSpeakerById', () => {
    it('存在するスピーカーIDでスピーカー情報を取得できること', async () => {
      // モックの設定
      mockedAxios.get.mockResolvedValueOnce({ data: mockSpeakers });

      // テスト対象の関数を実行
      const result = await service.getSpeakerById(1);

      // 結果の検証
      expect(result).toEqual(mockSpeakers[0]);
    });

    it('存在しないスピーカーIDでundefinedを返すこと', async () => {
      // モックの設定
      mockedAxios.get.mockResolvedValueOnce({ data: mockSpeakers });

      // テスト対象の関数を実行
      const result = await service.getSpeakerById(999);

      // 結果の検証
      expect(result).toBeUndefined();
    });
  });

  describe('getStyleById', () => {
    it('存在するスピーカーIDとスタイルIDでスタイル情報を取得できること', async () => {
      // モックの設定
      mockedAxios.get.mockResolvedValueOnce({ data: mockSpeakers });

      // テスト対象の関数を実行
      const result = await service.getStyleById(1, 2);

      // 結果の検証
      expect(result).toEqual(mockSpeakers[0].styles[1]);
    });

    it('存在しないスタイルIDでundefinedを返すこと', async () => {
      // モックの設定
      mockedAxios.get.mockResolvedValueOnce({ data: mockSpeakers });

      // テスト対象の関数を実行
      const result = await service.getStyleById(1, 999);

      // 結果の検証
      expect(result).toBeUndefined();
    });
  });
});
