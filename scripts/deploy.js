#!/usr/bin/env node
// Midnight Walk — Deployment Script
// Builds and optionally deploys to Vercel/Netlify/Cloudflare

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname);

const platforms = ['vercel', 'netlify', 'cloudflare', 'github'];

function build() {
  console.log('Building...');
  execSync('npm run build', { cwd: rootDir, stdio: 'inherit' });
  console.log('Build complete!\n');
}

function deploy(platform) {
  switch (platform) {
    case 'vercel':
      console.log('Deploying to Vercel...');
      execSync('npx vercel --prod', { cwd: rootDir, stdio: 'inherit' });
      break;
    case 'netlify':
      console.log('Deploying to Netlify...');
      execSync('npx netlify deploy --prod --dir=dist', { cwd: rootDir, stdio: 'inherit' });
      break;
    case 'cloudflare':
      console.log('Deploying to Cloudflare Pages...');
      execSync('npx wrangler pages deploy dist', { cwd: rootDir, stdio: 'inherit' });
      break;
    case 'github':
      console.log('Pushing to GitHub Pages...');
      execSync('git add -A && git commit -m "Deploy" && git push origin main', { cwd: rootDir, stdio: 'inherit' });
      break;
    default:
      console.log(`Unknown platform: ${platform}`);
      console.log(`Available: ${platforms.join(', ')}`);
      process.exit(1);
  }
}

// Main
const platform = process.argv[2];

if (!platform || !platforms.includes(platform)) {
  console.log('Usage: node deploy.js <platform>');
  console.log(`Platforms: ${platforms.join(', ')}`);
  process.exit(1);
}

build();
deploy(platform);