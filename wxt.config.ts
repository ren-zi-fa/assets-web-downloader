import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  // Fungsi per-browser: Firefox butuh ID stabil (`browser_specific_settings.gecko.id`)
  // agar bisa ditandatangani/dipasang permanen, sementara Chrome mengabaikannya.
  manifest: ({ browser }) => ({
    permissions: ['activeTab', 'scripting', 'downloads'],
    action: {
      default_title: 'Asset Downloader',
    },
    ...(browser === 'firefox'
      ? {
          browser_specific_settings: {
            gecko: {
              id: 'asset-downloader@renzi.dev',
              data_collection_permissions: { required: ['none'] },
            },
          },
        }
      : {}),
  }),
});
