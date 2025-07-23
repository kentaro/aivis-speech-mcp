# AivisSpeech MCP サーバー

AivisSpeech用のModel Context Protocol (MCP) サーバーの実装です。このサーバーは、AivisSpeech Engineと連携して、音声合成のためのインターフェースを提供します。MCPプロトコルを通じて、AIアシスタントなどのアプリケーションからAivisSpeechの音声合成機能を簡単に利用できるようになります。

<a href="https://glama.ai/mcp/servers/@kentaro/aivis-speech-mcp">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/@kentaro/aivis-speech-mcp/badge" alt="AivisSpeech Server MCP server" />
</a>

## 概要

AivisSpeech MCP サーバーは以下の機能を提供します：

- MCPプロトコルに準拠したAPIエンドポイント
- AivisSpeech Engineとの連携による高品質な音声合成
- TypeScriptによる型安全な設計
- 簡単な設定と拡張性の高いアーキテクチャ

## 必要条件

- Node.js 18.x以上
- npm 9.x以上
- AivisSpeech Engine（別途インストールが必要）

## インストール

```bash
# リポジトリをクローン
git clone https://github.com/kentaro/aivis-speech-mcp.git
cd aivis-speech-mcp

# 依存関係のインストール
npm install

# ビルド
npm run build

# 環境変数の設定
cp .env.sample .env
# .envファイルを編集して、必要な設定を行ってください

# Cursor MCPの設定
cp .cursor/mcp.json.sample .cursor/mcp.json
# mcp.jsonファイル内の"/path/to/aivis-speech-mcp/dist/index.js"を
# 実際のプロジェクトパスに書き換えてください
# 例: "C:/Users/username/path/to/aivis-speech-mcp/dist/index.js"
```

## 環境設定

`.env`ファイルで以下の設定を行います：

```
# AivisSpeech API Configuration
AIVIS_SPEECH_API_URL=http://localhost:10101  # AivisSpeech EngineのAPIエンドポイント

# Speaker Configuration
AIVIS_SPEECH_SPEAKER_ID=888753760  # デフォルトのスピーカーID
```

## Cursor MCP設定

`.cursor/mcp.json`ファイルで以下の設定を行います：

```json
{
  "mcpServers": {
    "AivisSpeech-MCP": {
      "command": "node",
      "args": ["/path/to/aivis-speech-mcp/dist/index.js"]
    }
  }
}
```

`/path/to/aivis-speech-mcp/dist/index.js`を、実際のプロジェクトのパスに書き換えてください。
Windowsの場合は、バックスラッシュをエスケープするか、フォワードスラッシュを使用してください。
例: `"C:/Users/username/path/to/aivis-speech-mcp/dist/index.js"`

## 使い方

### 開発モード

開発中は以下のコマンドでホットリロード機能付きでサーバーを起動できます：

```bash
npm run dev
```

### ビルド

本番環境用にビルドする場合は以下のコマンドを実行します：

```bash
npm run build
```

### 本番モード

ビルド後、以下のコマンドで本番モードでサーバーを起動します：

```bash
npm start
```

### テスト

テストを実行するには以下のコマンドを使用します：

```bash
npm test
```

## アーキテクチャ

AivisSpeech MCP サーバーは以下のコンポーネントで構成されています：

- **MCPサービス**: Model Context Protocolに準拠したサーバーを提供し、クライアントからのリクエストを処理します
- **AivisSpeech サービス**: AivisSpeech EngineのAPIと通信し、音声合成を実行します

## API仕様

MCPプロトコルに準拠したAPIエンドポイントを提供します。主な機能は以下の通りです：

- 音声合成（テキストから音声を生成）
- スピーカー情報の取得
- 音声スタイルの設定

詳細なAPI仕様については[AivisSpeech Engine API仕様](https://aivis-project.github.io/AivisSpeech-Engine/api/)を参照してください。

## MCPプロトコルとの連携

このサーバーは、Model Context Protocol（MCP）を実装しており、AIアシスタントなどのアプリケーションからシームレスに利用できます。MCPプロトコルについての詳細は[MCP公式ドキュメント](https://modelcontextprotocol.github.io/)を参照してください。

## トラブルシューティング

よくある問題と解決策：

- **AivisSpeech Engineに接続できない**: `.env`ファイルの`AIVIS_SPEECH_API_URL`が正しく設定されているか確認してください
- **音声が再生されない**: システムの音声設定を確認し、適切なオーディオデバイスが選択されているか確認してください
- **スピーカーIDが見つからない**: AivisSpeech Engineが正しく起動しているか確認し、利用可能なスピーカーIDを確認してください

## 貢献

バグ報告や機能リクエストは、GitHubのIssueトラッカーを通じてお願いします。プルリクエストも歓迎します。

## ライセンス

[MIT](LICENSE)

## 謝辞

- [AivisSpeech Engine](https://github.com/aivis-project/AivisSpeech-Engine)チーム
- [Model Context Protocol](https://modelcontextprotocol.github.io/)の開発者