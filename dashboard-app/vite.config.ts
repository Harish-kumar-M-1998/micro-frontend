import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    /**
     * Module Federation - REMOTE configuration (Dashboard)
     *
     * name: Must match the key used in host's remotes config
     * filename: Output filename for the remote entry manifest
     * exposes: Modules this remote makes available to the host
     * shared: Singleton shared deps to prevent duplicate React instances
     */
    federation({
      name: 'dashboardApp',
      filename: 'remoteEntry.js',
      exposes: {
        './DashboardPage': './src/pages/DashboardPage.tsx',
      },
      shared: {
        react: { singleton: true, requiredVersion: '^19.0.0' },
        'react-dom': { singleton: true, requiredVersion: '^19.0.0' },
        '@reduxjs/toolkit': { singleton: true },
        'react-redux': { singleton: true },
      },
    }),
  ],
  build: {
    target: 'esnext',
    minify: true,
    cssCodeSplit: true,
  },
  server: { port: 5001, strictPort: true, cors: true },
  preview: { port: 5001, cors: true },
});
