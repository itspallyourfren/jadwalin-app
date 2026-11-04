import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'id.jadwalin.companion',
  appName: 'Jadwal-In!',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_jadwalin',
      iconColor: '#2C4A3E',
    },
  },
}

export default config
