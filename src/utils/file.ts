/**
 * ファイル操作ユーティリティ
 * 音声ファイルの保存や一時ファイルの作成などの機能を提供します
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import { logger } from './logger';

/**
 * 一時ファイルのパスを生成する
 * @param prefix - ファイル名のプレフィックス
 * @param extension - ファイルの拡張子（ドットなし）
 * @returns 一時ファイルのパス
 */
export function generateTempFilePath(prefix: string = 'aivis', extension: string = 'wav'): string {
  const randomString = crypto.randomBytes(8).toString('hex');
  return path.join(os.tmpdir(), `${prefix}-${randomString}.${extension}`);
}

/**
 * バイナリデータをファイルに保存する
 * @param data - 保存するバイナリデータ
 * @param filePath - 保存先のファイルパス
 * @returns 保存したファイルのパス
 */
export function saveBufferToFile(data: Buffer, filePath: string): string {
  try {
    // ディレクトリが存在しない場合は作成
    const directory = path.dirname(filePath);
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }

    // ファイルに書き込み
    fs.writeFileSync(filePath, data);
    logger.debug(`ファイルを保存しました: ${filePath}`);
    return filePath;
  } catch (error) {
    logger.error(`ファイルの保存に失敗しました: ${filePath}`, { error });
    throw new Error(`ファイルの保存に失敗しました: ${(error as Error).message}`);
  }
}

/**
 * バイナリデータを一時ファイルに保存する
 * @param data - 保存するバイナリデータ
 * @param prefix - ファイル名のプレフィックス
 * @param extension - ファイルの拡張子（ドットなし）
 * @returns 保存した一時ファイルのパス
 */
export function saveTempFile(data: Buffer, prefix: string = 'aivis', extension: string = 'wav'): string {
  const tempFilePath = generateTempFilePath(prefix, extension);
  return saveBufferToFile(data, tempFilePath);
}

/**
 * ファイルが存在するか確認する
 * @param filePath - 確認するファイルパス
 * @returns ファイルが存在する場合はtrue、存在しない場合はfalse
 */
export function fileExists(filePath: string): boolean {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    logger.error(`ファイルの存在確認に失敗しました: ${filePath}`, { error });
    return false;
  }
}

/**
 * ファイルを削除する
 * @param filePath - 削除するファイルパス
 * @returns 削除に成功した場合はtrue、失敗した場合はfalse
 */
export function deleteFile(filePath: string): boolean {
  try {
    if (fileExists(filePath)) {
      fs.unlinkSync(filePath);
      logger.debug(`ファイルを削除しました: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    logger.error(`ファイルの削除に失敗しました: ${filePath}`, { error });
    return false;
  }
}
