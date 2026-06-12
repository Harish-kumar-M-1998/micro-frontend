import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isAnalyze = mode === 'analyze';

  return {
    plugins: [
      react(),
      /**
       * Module Federation - HOST configuration
       *
       * name: Unique identifier for this federation container
       * remotes: Map of remote app names to their remoteEntry.js URLs
       * shared: Dependencies shared as singletons across host + remotes
       */
      federation({
        name: 'host',
        remotes: {
          dashboardApp: env.VITE_DASHBOARD_REMOTE ?? 'http://localhost:5001/assets/remoteEntry.js',
          userApp: env.VITE_USER_REMOTE ?? 'http://localhost:5002/assets/remoteEntry.js',
          reportsApp: env.VITE_REPORTS_REMOTE ?? 'http://localhost:5003/assets/remoteEntry.js',
        },
        shared: {
          react: { singleton: true, requiredVersion: '^19.0.0' },
          'react-dom': { singleton: true, requiredVersion: '^19.0.0' },
          'react-router-dom': { singleton: true, requiredVersion: '^7.0.0' },
          '@reduxjs/toolkit': { singleton: true },
          'react-redux': { singleton: true },
        } as Record<string, unknown>,
      }),
      isAnalyze &&
        visualizer({
          open: true,
          filename: 'dist/stats.html',
          gzipSize: true,
        }),
    ].filter(Boolean),
    build: {
      target: 'esnext',
      minify: mode === 'production',
      cssCodeSplit: true,
    },
    server: {
      port: 5000,
      strictPort: true,
      cors: true,
    },
    preview: {
      port: 5000,
      cors: true,
    },
  };
});
