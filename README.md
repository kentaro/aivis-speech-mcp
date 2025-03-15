# AivisSpeech MCP Server

AivisSpeech用のModel Context Protocol (MCP) サーバーの実装です。このサーバーは、AivisSpeech Engineと連携して、音声合成のためのインターフェースを提供します。

## 機能

- MCPプロトコルに準拠したAPIエンドポイント
- AivisSpeech Engineとの連携
- 型安全な設計

## 必要条件

- Node.js 18.x以上
- npm 9.x以上
- AivisSpeech Engine

## インストール

```bash
# リポジトリをクローン
git clone https://github.com/yourusername/aivis-speech-mcp.git
cd aivis-speech-mcp

# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env
# .envファイルを編集して、必要な設定を行ってください
```

## 使い方

### 開発モード

```bash
npm run dev
```

### ビルド

```bash
npm run build
```

### 本番モード

```bash
npm start
```

### テスト

```bash
npm test
```

## API仕様

MCPプロトコルに準拠したAPIエンドポイントを提供します。詳細は[AivisSpeech Engine API仕様](https://aivis-project.github.io/AivisSpeech-Engine/api/)を参照してください。

## ライセンス

[MIT](LICENSE)
