# Midnight Walk

An immersive night walk through hidden realms. Scroll-driven WebGL, cinematic atmosphere, five chapters of stillness.

## Quick Start

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # optimized → dist/
npm start          # http://localhost:8080
```

## Architecture

```
midnight-walk/
├── index.html          ← Entry point, semantic HTML
├── css/
│   └── style.css       ← All styles, tokens, responsive
├── js/
│   ├── app.js          ← Main WebGL runtime
│   └── three.min.js    ← Three.js r149 vendored
├── scenes/             ← 3D scene templates (YAML → JS)
├── foreground/         ← PNG cutout assets (WebP)
├── assets/             ← Generated WebP cards, preview
└── index.html          ← Single entry, zero build step
```

## Features

- Scroll-driven camera path (5 chapters)
- Procedural Three.js scene: temple, gate, terrain, trees
- Rain + leaf particle systems
- Moon + lantern lighting
- Foreground PNG parallax layers
- WebGL fallback → pure CSS scene
- Reduced motion support
- Mobile responsive
- No framework, no build step, no analytics, no trackers

## SEO

- Semantic HTML5 landmarks
- Meta description, viewport, theme-color
- Structured heading hierarchy (h1 → h2 → h3)
- All images have alt text
- No JS-rendered content (SSR friendly)

## Accessibility

- ARIA labels on interactive elements
- Keyboard navigable
- Focus visible indicators
- `prefers-reduced-motion` respected
- `no-webgl` CSS fallback

## License

MIT# 3D-web-without-code
