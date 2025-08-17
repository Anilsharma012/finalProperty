// server/start-server.ts

import { createServer, initializeSocket } from "./index";
import { createServer as createHttpServer } from 'http';

const app = createServer();
const httpServer = createHttpServer(app);
const PORT = process.env.PORT || 8080;

// Initialize Socket.io
initializeSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`🔌 Socket.io server ready`);
});
