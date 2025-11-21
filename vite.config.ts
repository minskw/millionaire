import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    base: './', // Ensures assets load correctly regardless of the subdirectory
    define: {
      // API Key updated to the valid key provided.
      'process.env.API_KEY': JSON.stringify("AIzaSyBP6D7Jrr06OP3hwtwKveAfpyBcjWqUeFE"),
    },
  };
});