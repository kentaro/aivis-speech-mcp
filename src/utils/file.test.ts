/**
 * ファイル操作ユーティリティのテスト
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import {
  generateTempFilePath,
  saveBufferToFile,
  saveTempFile,
  fileExists,
  deleteFile,
} from './file';

// fsモジュールをモック化
jest.mock('fs');
const mockedFs = fs as jest.Mocked<typeof fs>;

// loggerをモック化
jest.mock('./logger', () => ({
  logger: {
    debug: jest.fn(),
    error: jest.fn(),
  },
}));

describe('ファイル操作ユーティリティ', () => {
  // テスト後のクリーンアップ
  afterEach(() => {
    jest.clearAllMocks();
  });

  // generateTempFilePathのテスト
  describe('generateTempFilePath', () => {
    test('デフォルトのプレフィックスと拡張子で一時ファイルパスを生成できること', () => {
      const tempPath = generateTempFilePath();
      expect(tempPath).toContain(os.tmpdir());
      expect(tempPath).toContain('aivis-');
      expect(tempPath).toMatch(/\.wav$/);
    });

    test('指定したプレフィックスと拡張子で一時ファイルパスを生成できること', () => {
      const tempPath = generateTempFilePath('test', 'mp3');
      expect(tempPath).toContain(os.tmpdir());
      expect(tempPath).toContain('test-');
      expect(tempPath).toMatch(/\.mp3$/);
    });
  });

  // saveBufferToFileのテスト
  describe('saveBufferToFile', () => {
    test('バイナリデータをファイルに保存できること', () => {
      // モックの設定
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.writeFileSync.mockImplementation(() => undefined);

      const testBuffer = Buffer.from('test data');
      const filePath = path.join(os.tmpdir(), 'test.wav');

      const result = saveBufferToFile(testBuffer, filePath);

      expect(result).toBe(filePath);
      expect(mockedFs.writeFileSync).toHaveBeenCalledWith(filePath, testBuffer);
    });

    test('ディレクトリが存在しない場合は作成すること', () => {
      // モックの設定
      mockedFs.existsSync.mockReturnValue(false);
      mockedFs.mkdirSync.mockImplementation(() => undefined);
      mockedFs.writeFileSync.mockImplementation(() => undefined);

      const testBuffer = Buffer.from('test data');
      const filePath = path.join(os.tmpdir(), 'subdir', 'test.wav');

      const result = saveBufferToFile(testBuffer, filePath);

      expect(result).toBe(filePath);
      expect(mockedFs.mkdirSync).toHaveBeenCalledWith(path.dirname(filePath), { recursive: true });
      expect(mockedFs.writeFileSync).toHaveBeenCalledWith(filePath, testBuffer);
    });

    test('ファイル保存に失敗した場合はエラーをスローすること', () => {
      // モックの設定
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.writeFileSync.mockImplementation(() => {
        throw new Error('書き込みエラー');
      });

      const testBuffer = Buffer.from('test data');
      const filePath = path.join(os.tmpdir(), 'test.wav');

      expect(() => saveBufferToFile(testBuffer, filePath)).toThrow('ファイルの保存に失敗しました: 書き込みエラー');
    });
  });

  // saveTempFileのテスト
  describe('saveTempFile', () => {
    test('バイナリデータを一時ファイルに保存できること', () => {
      // モックの設定
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.writeFileSync.mockImplementation(() => undefined);

      const testBuffer = Buffer.from('test data');

      const result = saveTempFile(testBuffer);

      expect(result).toContain(os.tmpdir());
      expect(result).toMatch(/\.wav$/);
      expect(mockedFs.writeFileSync).toHaveBeenCalledWith(expect.any(String), testBuffer);
    });
  });

  // fileExistsのテスト
  describe('fileExists', () => {
    test('ファイルが存在する場合はtrueを返すこと', () => {
      // モックの設定
      mockedFs.existsSync.mockReturnValue(true);

      const filePath = path.join(os.tmpdir(), 'test.wav');

      const result = fileExists(filePath);

      expect(result).toBe(true);
      expect(mockedFs.existsSync).toHaveBeenCalledWith(filePath);
    });

    test('ファイルが存在しない場合はfalseを返すこと', () => {
      // モックの設定
      mockedFs.existsSync.mockReturnValue(false);

      const filePath = path.join(os.tmpdir(), 'test.wav');

      const result = fileExists(filePath);

      expect(result).toBe(false);
      expect(mockedFs.existsSync).toHaveBeenCalledWith(filePath);
    });

    test('エラーが発生した場合はfalseを返すこと', () => {
      // モックの設定
      mockedFs.existsSync.mockImplementation(() => {
        throw new Error('存在確認エラー');
      });

      const filePath = path.join(os.tmpdir(), 'test.wav');

      const result = fileExists(filePath);

      expect(result).toBe(false);
    });
  });

  // deleteFileのテスト
  describe('deleteFile', () => {
    test('ファイルが存在する場合は削除してtrueを返すこと', () => {
      // モックの設定
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.unlinkSync.mockImplementation(() => undefined);

      const filePath = path.join(os.tmpdir(), 'test.wav');

      const result = deleteFile(filePath);

      expect(result).toBe(true);
      expect(mockedFs.unlinkSync).toHaveBeenCalledWith(filePath);
    });

    test('ファイルが存在しない場合はfalseを返すこと', () => {
      // モックの設定
      mockedFs.existsSync.mockReturnValue(false);

      const filePath = path.join(os.tmpdir(), 'test.wav');

      const result = deleteFile(filePath);

      expect(result).toBe(false);
      expect(mockedFs.unlinkSync).not.toHaveBeenCalled();
    });

    test('削除中にエラーが発生した場合はfalseを返すこと', () => {
      // モックの設定
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.unlinkSync.mockImplementation(() => {
        throw new Error('削除エラー');
      });

      const filePath = path.join(os.tmpdir(), 'test.wav');

      const result = deleteFile(filePath);

      expect(result).toBe(false);
    });
  });
});
