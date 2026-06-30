import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

import { createVuetify } from 'vuetify'

const clinicalTheme = {
  dark: false,
  colors: {
    background: '#DEF2F1',
    surface: '#FEFFFF',
    'surface-variant': '#EAF7F6',
    primary: '#2B7A78',
    secondary: '#3AAFA9',
    success: '#2E7D32',
    warning: '#B7791F',
    error: '#D32F2F',
    'on-surface': '#17252A',
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
