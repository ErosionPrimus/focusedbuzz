# Midnight Walk Project Structure

midnight-walk/
├── index.html              ← Main entry (4821 lines Kage-style)
├── 404.html                ← Fallback page
├── package.json            ← NPM config
├── README.md               ← Project docs
├── DEPLOY.md               ← Deployment guide
├── gatsby-config.js        ← Gatsby config (optional)
├── sitemap.xml             ← SEO sitemap
├── robots.txt              ← Crawler rules
├── css/
│   └── style.css           ← All styles (~20KB)
│   └── fonts.css           ← Font declarations
├── js/
│   ├── app.js              ← Main WebGL runtime (~20KB)
│   ├── three.min.js        ← Three.js r149 vendored (608KB)
│   └── config.js           ← Site config
├── scenes/                  ← 3D scene templates (empty, ready)
├── foreground/              ← PNG cutout assets (13 WebP placeholders)
├── assets/                  ← Generated WebP cards, preview
└── dist/                    ← Build output (generated)