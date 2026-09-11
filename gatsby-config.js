module.exports = {
  plugins: [
    'gatsby-plugin-image',
    'gatsby-plugin-sharp',
    'gatsby-transformer-sharp',
    'gatsby-plugin-sitemap',
    'gatsby-plugin-robots-txt',
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'scenes',
        path: `${__dirname}/scenes/`,
      },
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'assets',
        path: `${__dirname}/assets/`,
      },
    },
    {
      resolve: 'gatsby-plugin-manifest',
      options: {
        name: 'Midnight Walk',
        short_name: 'Midnight',
        start_url: '/',
        background_color: '#05070a',
        theme_color: '#05070a',
        display: 'standalone',
        icon: 'assets/icon.png',
      },
    },
  ],
  flags: { DEV_SSR: true },
};