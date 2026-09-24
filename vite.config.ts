import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

function rewriteProxiedCookies(value: string): string {
  return value
    .replace(/;\s*Secure/gi, '')
    .replace(/;\s*SameSite=None/gi, '; SameSite=Lax')
    .replace(/;\s*Domain=[^;]*/gi, '');
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiProxyTarget = env.VITE_API_PROXY_TARGET || env.VITE_API_URL || 'http://localhost:3000';

  return {
    plugins: [react()],
    server: {
      host: 'localhost',
      port: 5173,
      strictPort: true,
      proxy: {
        '/api': {
          target: apiProxyTarget.replace(/\/$/, ''),
          changeOrigin: true,
          secure: true,
          configure: (proxy) => {
            proxy.on('proxyRes', (proxyRes) => {
              const setCookie = proxyRes.headers['set-cookie'];
              if (!setCookie) {
                return;
              }
              const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
              proxyRes.headers['set-cookie'] = cookies.map(rewriteProxiedCookies);
            });
          },
        },
      },
    },
    preview: {
      host: 'localhost',
      port: 5173,
      strictPort: true,
    },
  };
});
