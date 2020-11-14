export default {
  ssr: false,
  // Global page headers (https://go.nuxtjs.dev/config-head)

  env: {
    baseUrl:
      process.env.NODE_ENV === 'prod'
        ? process.env.URL
        : 'http://localhost:3000',
  },
  head: {
    title: 'nuxt-chat-frontend',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
  },

  // Global CSS (https://go.nuxtjs.dev/config-css)
  css: [],

  // Plugins to run before rendering page (https://go.nuxtjs.dev/config-plugins)
  plugins: [],

  // Auto import components (https://go.nuxtjs.dev/config-components)
  components: true,

  // Modules for dev and build (recommended) (https://go.nuxtjs.dev/config-modules)
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    '@nuxt/typescript-build',
  ],

  // Modules (https://go.nuxtjs.dev/config-modules)
  modules: [
    // https://go.nuxtjs.dev/buefy
    'nuxt-buefy',
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    // https://go.nuxtjs.dev/pwa
    '@nuxtjs/pwa',
  ],
  server: {
    port: 8000, // default: 3000
  },
  axios: {
    baseURL:   process.env.NODE_ENV === 'prod'
    ? process.env.URL
    : 'http://localhost:3000',
  },

  // Build Configuration (https://go.nuxtjs.dev/config-build)
  build: {},
  generate: {
    dir: '../public',
  },
}
