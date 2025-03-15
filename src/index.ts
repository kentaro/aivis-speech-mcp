import mcpService from './services/mcp-service';
import config from './config';

/**
 * アプリケーションのメイン関数
 */
async function main() {
  try {
    // MCPサーバーを起動
    await mcpService.start(config.server.port, config.server.host);

    // 終了時の処理
    process.on('SIGINT', () => {
      console.log('Shutting down MCP server...');
      process.exit(0);
    });
  } catch (error) {
    console.error('Failed to start MCP server:', error);
    process.exit(1);
  }
}

// アプリケーションを起動
main();
