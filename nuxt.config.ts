export default defineNuxtConfig({
  devtools: { enabled: true },

  app: {
    head: {
      title: 'Семейное дерево',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap',
        },
      ],
    },
  },

  compatibilityDate: '2026-07-13',
});