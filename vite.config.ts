import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createServer, initializeSocket } from "./server";

// ✅ Final working config
export default defineConfig(({ command }) => {
  const isDev = command === "serve";

  return {
    plugins: [react(), isDev ? expressPlugin() : undefined].filter(Boolean),

    build: {
      outDir: "client/dist", // ✅ Output still goes to client/dist for Netlify
      emptyOutDir: true,
    },

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./client"),
        "@shared": path.resolve(__dirname, "./shared"),
      },
    },

    server: {
      port: 5173,
    },
  };
});

// ✅ Dev plugin (Express middleware for dev)
function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve",
    configureServer(viteServer) {
      const app = createServer();

      // Initialize Socket.io with the Vite HTTP server
      if (viteServer.httpServer) {
        initializeSocket(viteServer.httpServer);
        console.log('🔌 Socket.io initialized in Vite dev server');
      }

      viteServer.middlewares.use(app);
    },
  };
}
