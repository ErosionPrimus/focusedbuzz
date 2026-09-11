# Midnight Walk — Deployment Guide

## Option A: Vercel (recommended)

1. Push to GitHub
2. Go to vercel.com → New Project → Import repo
3. Build settings:
   - Framework: Other
   - Build Command: (leave empty)
   - Output Directory: `.`
   - Install Command: (leave empty)
4. Deploy

## Option B: Netlify

1. Drag and drop the project folder to netlify.com/drop
2. Or connect GitHub repo → Deploy

## Option C: GitHub Pages

```bash
# Add to package.json
"deploy": "gh-pages -d ."
```

## Option D: Cloudflare Pages (current DNS)

1. Login to Cloudflare dashboard
2. Pages → Create project → Connect to GitHub
3. Build config:
   - Build command: `npm run build`
   - Output directory: `dist/`
4. Deploy

## DNS (current: Cloudflare)

- A record → `172.67.212.224` (current IP)
- OR CNAME → `your-vercel-url.vercel.app`
- OR CNAME → `your-netlify-url.netlify.app`

## Environment variables

None required for static site.