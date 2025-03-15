# AivisSpeech-MCP

AivisSpeech-EngineのModel Context Protocol (MCP) サーバー実装です。このサーバーを使用することで、Claude等のAIアシスタントがAivisSpeech-Engineの音声合成機能を利用できるようになります。

## 概要

AivisSpeech-MCPは、[AivisSpeech-Engine](https://github.com/Aivis-Project/AivisSpeech-Engine)の機能をModel Context Protocol (MCP) を通じて提供するサーバーです。MCPは、AIモデルがローカルやリモートのリソースと安全に対話できるようにするためのプロトコルです。

このサーバーを使用することで、以下の機能をAIアシスタントから利用できます：

- テキストから音声を合成
- 利用可能な話者（スタイル）の一覧を取得
- 話者（スタイル）の詳細情報を取得
- エンジン情報を取得

## 前提条件

- Node.js 18以上
- AivisSpeech-Engine（ローカルで実行中）

## インストール

```bash
# リポジトリをクローン
git clone https://github.com/yourusername/aivis-speech-mcp.git
cd aivis-speech-mcp

# 依存関係をインストール
npm install

# TypeScriptをコンパイル
npm run build
```

## 設定

設定は以下の方法で行えます：

1. `.env`ファイルを作成（推奨）
2. `config.json`ファイルを作成（レガシーサポート）
3. 環境変数を直接設定

設定の優先順位は、`.env` > `config.json` > デフォルト値 の順です。

### .envファイルの例

```
# サーバーポート
PORT=3000

# AivisSpeech-Engine URL
AIVIS_SPEECH_ENGINE_URL=http://127.0.0.1:10101

# ログレベル (debug, info, warn, error)
LOG_LEVEL=info
```

### config.jsonの例（レガシーサポート）

```json
{
  "port": 3000,
  "aivisSpeechEngineUrl": "http://127.0.0.1:10101",
  "logLevel": "info"
}
```

### 環境変数

- `PORT`: サーバーのポート番号
- `AIVIS_SPEECH_ENGINE_URL`: AivisSpeech-EngineのURL
- `LOG_LEVEL`: ログレベル（error, warn, info, debug）

## 使用方法

### サーバーの起動

```bash
# 開発モード
npm run dev

# 本番モード
npm start
```

サーバーが起動すると、以下のエンドポイントが利用可能になります：

- `GET /manifest.json`: MCPマニフェスト
- `POST /mcp`: MCPリクエスト
- `GET /health`: ヘルスチェック

### AIアシスタントからの利用

Claude等のAIアシスタントからは、以下のようにして利用できます：

```
「こんにちは、世界！」というテキストを、女性の声で音声合成してください。
```

AIアシスタントはMCPサーバーを通じてAivisSpeech-Engineに接続し、音声を合成して結果を返します。

## サポートするツール

### synthesize_speech

指定されたテキストを音声に変換します。

**パラメータ**:
- `text`: 音声合成するテキスト（必須）
- `speaker_id`: 話者（スタイル）ID（必須）
- `output_path`: 出力ファイルパス（省略時は一時ファイル）
- `speed_scale`: 話速（1.0が標準）
- `pitch_scale`: 音高（1.0が標準）
- `intonation_scale`: 抑揚（1.0が標準）
- `volume_scale`: 音量（1.0が標準）

**戻り値**:
- `file_path`: 音声ファイルのパス

### get_speakers

利用可能な話者の一覧を取得します。

**パラメータ**: なし

**戻り値**:
- `speakers`: 話者情報の配列

### get_speaker_info

指定されたスタイルIDの話者情報を取得します。

**パラメータ**:
- `speaker_id`: 話者（スタイル）ID（必須）

**戻り値**:
- `speaker`: 話者情報

### get_engine_info

AivisSpeech-Engineの情報を取得します。

**パラメータ**: なし

**戻り値**:
- `engine_info`: エンジン情報

## 開発

### テスト

```bash
# テストを実行
npm test

# カバレッジレポートを生成
npm run test:coverage
```

### リント

```bash
# コードをリント
npm run lint

# コードを自動修正
npm run format
```

## ライセンス

MITライセンスの下で公開されています。詳細は[LICENSE](LICENSE)ファイルを参照してください。

## 謝辞

- [AivisSpeech-Engine](https://github.com/Aivis-Project/AivisSpeech-Engine)
- [Model Context Protocol](https://github.com/anthropics/anthropic-cookbook/tree/main/mcp)
