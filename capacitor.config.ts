import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.morsel.app',
  appName: 'Morsel',
  webDir: 'out',
  server: {
    url: 'https://foodgram-tau.vercel.app',
    cleartext: false,
  },
  ios: {
    contentInset: 'always',
  },
  android: {
    backgroundColor: '#f8f6f3',
  },
};

export default config;
