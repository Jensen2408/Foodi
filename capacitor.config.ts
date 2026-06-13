import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.foodgram.app',
  appName: 'FoodGram',
  webDir: 'out',
  server: {
    url: 'https://foodgram-jensen2408s-projects.vercel.app',
    cleartext: false,
  },
  ios: {
    contentInset: 'always',
  },
  android: {
    backgroundColor: '#080c14',
  },
};

export default config;
