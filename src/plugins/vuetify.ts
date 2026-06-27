import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

import { createVuetify } from 'vuetify'

const clinicalTheme = {
  dark: false,
  colors: {
    background: '#F7F8FA',
    surface: '#FFFFFF',
    'surface-variant': '#F1F4F7',
    primary: '#0F766E',
    secondary: '#1B2733',
    success: '#2E7D32',
    warning: '#F9A825',
    error: '#D32F2F',
    'on-surface': '#1B2733',
  },
}

const vuetify = createVuetify({
  theme: {
    defaultTheme: 'clinicalTheme',
    themes: {
      clinicalTheme,
    },
  },
  defaults: {
    VCard: {
      elevation: 0,
      rounded: 'lg',
    },
  },
})

export default vuetify
