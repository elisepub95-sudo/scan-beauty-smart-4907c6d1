import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.a6c8b0b1067c4a0e83e710906529be00',
  appName: 'scan-beauty-smart',
  webDir: 'dist',
  server: {
    url: 'https://a6c8b0b1-067c-4a0e-83e7-10906529be00.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    CapacitorHttp: {
      enabled: true
    }
  }
};

export default config;
