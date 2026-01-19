import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  let apiBaseUrl = env.VITE_API_BASE_URL || 'http://localhost:4500'
  if (apiBaseUrl.includes(':3000')) {
    apiBaseUrl = apiBaseUrl.replace(':3000', ':4500')
    console.log(`[Vite Config] Detected frontend port in API URL, redirecting to backend: ${apiBaseUrl}`)
  }
  
  return {
    plugins: [react()],
    css: {
      postcss: './src/config/postcss.config.js',
    },
    server: {
      port: 3000,
      open: true,
      proxy: {
        '/api': {
          target: apiBaseUrl,
          changeOrigin: true,
          secure: false,
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('Proxy error:', err);
            });
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log('Proxying request:', req.method, req.url, 'to', apiBaseUrl);
            });
          },
        }
      }
    },
    build: {
      outDir: 'dist',
      sourcemap: true
    }
  }
})
