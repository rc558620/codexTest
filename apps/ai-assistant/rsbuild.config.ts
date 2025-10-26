import { defineConfig, loadEnv } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginLess } from '@rsbuild/plugin-less';
import { pluginYth } from '@yth/rsbuild-plugin-yth';
import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';

const { publicVars } = loadEnv({ prefixes: ['YTH_'] });

const remoteEntry = 'remoteEntry.js';
const name = 'aiAssistant';

export default defineConfig({
  server: {
    proxy: {
      '/sys': {
        target: process.env.YTH_AUTH_PROXY_URL,
        changeOrigin: true,
      },
      '/auth': {
        target: process.env.YTH_AUTH_PROXY_URL,
        changeOrigin: true,
      },

      '/api/': {
        target: process.env.YTH_API_PROXY_URL,
        changeOrigin: true,
        secure: true,
        bypass(req, res, options) {
          const proxyURL = options.target + req.url;
          req.headers['x-req-proxyURL'] = proxyURL;
          res.setHeader('x-req-proxyURL', proxyURL);
        },
        // onProxyRes(proxyRes) {
        //   // 禁用缓存以支持流式响应
        //   proxyRes.headers['Content-Type'] = 'text/event-stream';
        //   proxyRes.headers['transfer-encoding'] = 'chunked';
        //   proxyRes.headers['Cache-Control'] = 'no-cache';
        //   proxyRes.headers['Connection'] = 'keep-alive';
        //   proxyRes.headers['X-Accel-Buffering'] = 'no';
        // },
      },
      '/knowledge/': {
        target: 'http://10.5.6.39:8520',
        changeOrigin: true,
        secure: true,
      },
      '/gw/hse3-data-center': {
        target: 'http://gwgp-wcjmjlpkro4.i.apiverse.ythit.cn',
        pathRewrite: {
          '^/gw/ai-center': '',
        },
        changeOrigin: true,
      },
      '/gw/ai-center': {
        target: 'http://gwgp-wcjmjlpkro4.i.apiverse.ythit.cn',
        pathRewrite: {
          '^/gw/ai-center': '',
        },
        changeOrigin: true,
      },
      '/gw/': {
        target: process.env.YTH_GW_PROXY_URL,
        changeOrigin: true,
      },
    },
  },
  html: {
    template: './public/index.html',
  },
  output: {
    legalComments: 'none',
  },
  plugins: [
    pluginReact(),
    pluginLess(),
    pluginYth({
      moduleParams: {
        Bulk: {
          title: '大宗商品',
          description: '大宗商品信息页面',
          author: 'YTH',
        },
        Knowledge: {
          title: 'AI助手',
          description: '云天化智能助手',
          author: 'YTH',
        },
      },
    }),
  ],
  source: {
    alias: {
      '@': './src',
    },
    define: publicVars,
  },
  performance: {
    removeConsole: true,
  },
  tools: {
    rspack: (config, { appendPlugins }) => {
      config.output!.uniqueName = name;
      config.output!.publicPath = 'auto';
      appendPlugins([
        new ModuleFederationPlugin({
          name,
          filename: remoteEntry,
          remotes: {
            ythUtils: `ythUtils@${process.env.YTH_GW_PROXY_URL}/gw/yth-utils-module/remoteEntry.js`,
          },
          exposes: {
            './Bulk': './src/pages/Bulk/index.tsx',
            './Knowledge': './src/pages/Knowledge/index.tsx',
          },
          dev: {
            disableHotTypesReload: true,
            disableLiveReload: true,
            disableDynamicRemoteTypeHints: true,
          },
          shared: {
            react: {
              singleton: true,
              requiredVersion: '18.3.1',
            },
            'react-dom': {
              singleton: true,
              requiredVersion: '18.3.1',
            },
          },
        }),
      ]);
    },
  },
});
