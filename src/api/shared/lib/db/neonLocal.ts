import { type WebSocketConstructor, neonConfig } from '@neondatabase/serverless';

// ローカル環境で Neon の WebSocket プロキシ経由接続を設定する共通ヘルパー
// drizzle.ts, reset.ts, setup.ts で同一設定が重複していたため抽出
export const configureNeonLocal = ({ wsConstructor }: { wsConstructor?: WebSocketConstructor } = {}) => {
  neonConfig.useSecureWebSocket = false;
  neonConfig.pipelineTLS = false;
  neonConfig.pipelineConnect = false;
  neonConfig.wsProxy = () => '127.0.0.1:5488/v1';
  if (wsConstructor) neonConfig.webSocketConstructor = wsConstructor;
};
