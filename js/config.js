module.exports = {
  site: 'midnight-walk.com',
  author: 'Midnight Walk',
  description: 'Immersive night walk WebGL experience through hidden realms',
  language: 'en',
  url: 'https://midnight-walk.com',
  twitter: '@midnightwalk',
  
  // SEO sections
  sections: [
    { id: 'gate', title: 'The Gate', jp: '伽藍', desc: 'Charred cypress, worn stone, one gate left open.' },
    { id: 'pathways', title: 'Still Gardens', jp: '庭園', desc: 'Courts where silence gently unfolds.' },
    { id: 'lessons', title: 'Sacred Craft', jp: '手業', desc: 'Hands and heritage that shape devotion.' },
    { id: 'eternity', title: 'Afterlight', jp: '残光', desc: 'The gate does not close behind you.' },
  ],
  
  // Structured data (JSON-LD)
  structuredData: {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Midnight Walk',
    description: 'An immersive night walk through hidden realms',
    url: 'https://midnight-walk.com',
    applicationCategory: 'EntertainmentApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript. Requires WebGL.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  },
};