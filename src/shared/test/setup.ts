import { neonConfig } from '@neondatabase/serverless';
import { config } from 'dotenv';
import ws from 'ws';

config({
  path: '.env.test',
});

// ローカル PostgreSQL に WebSocket プロキシ経由で接続するための設定
neonConfig.webSocketConstructor = ws;
neonConfig.useSecureWebSocket = false;
neonConfig.pipelineTLS = false;
neonConfig.pipelineConnect = false;
neonConfig.wsProxy = () => '127.0.0.1:5488/v1';
