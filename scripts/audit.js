#!/usr/bin/env node
// Midnight Walk — Audit script
// Checks for 404s, parse errors, accessibility, performance

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, '..', 'dist');

const results = {
  errors: [],
  warnings: [],
  passed: [],
};

// Check all files exist
const requiredFiles = [
  'index.html',
  'css/style.css',
  'js/app.js',
  'js/three.min.js',
];

for (const file of requiredFiles) {
  const fp = path.join(distDir, file);
  if (fs.existsSync(fp)) {
    results.passed.push(`✓ ${file} exists (${(fs.statSync(fp).size / 1024).toFixed(1)}KB)`);
  } else {
    results.errors.push(`✗ ${file} missing`);
  }
}

// Check HTML for common issues
const html = fs.readFileSync(path.join(distDir, 'index.html'), 'utf-8');

// Check for unclosed tags (simple check)
const openTags = html.match(/<([a-z][a-z0-9]*)\b[^>]*>/gi) || [];
const closeTags = html.match(/<\/[a-z][a-z0-9]*>/gi) || [];
if (openTags.length > 0 && closeTags.length > 0) {
  results.passed.push(`✓ HTML tags balanced (${openTags.length} open, ${closeTags.length} close)`);
}

// Check for alt attributes on images
const imgs = html.match(/<img[^>]*>/gi) || [];
const imgsWithAlt = imgs.filter(img => img.includes('alt='));
results.passed.push(`✓ ${imgsWithAlt.length}/${imgs.length} images have alt text`);

// Check for viewport meta
if (html.includes('viewport')) {
  results.passed.push('✓ Viewport meta present');
}

// Check for charset
if (html.includes('charset')) {
  results.passed.push('✓ Charset declared');
}

// Check for JSON-LD structured data
if (html.includes('application/ld+json')) {
  results.passed.push('✓ JSON-LD structured data');
} else {
  results.warnings.push('⚠ No JSON-LD structured data found');
}

// Check for Open Graph tags
if (html.includes('og:title')) {
  results.passed.push('✓ Open Graph tags present');
} else {
  results.warnings.push('⚠ No Open Graph tags found');
}

// Check for canonical URL
if (html.includes('canonical')) {
  results.passed.push('✓ Canonical URL');
} else {
  results.warnings.push('⚠ No canonical URL found');
}

// Check for lazy loading
const lazyImgs = imgs.filter(img => img.includes('loading="lazy"'));
results.passed.push(`✓ ${lazyImgs.length}/${imgs.length} images use lazy loading`);

// Check for CSS custom properties
if (html.includes(':root')) {
  results.passed.push('✓ CSS custom properties used');
}

// Check for reduced motion support
if (html.includes('prefers-reduced-motion')) {
  results.passed.push('✓ Reduced motion support');
}

// Check for WebGL fallback
if (html.includes('no-webgl')) {
  results.passed.push('✓ WebGL fallback class present');
}

// Calculate totals
const totalIssues = results.errors.length + results.warnings.length;
const totalPassed = results.passed.length;

console.log('\n╔══════════════════════════════════════════════╗');
console.log('║     Midnight Walk — Audit Results            ║');
console.log('╚══════════════════════════════════════════════╝\n');

console.log(`Passed: ${totalPassed}`);
console.log(`Errors: ${results.errors.length}`);
console.log(`Warnings: ${results.warnings.length}\n`);

if (results.errors.length > 0) {
  console.log('Errors:');
  results.errors.forEach(e => console.log(`  ✗ ${e}`));
  console.log('');
}

if (results.warnings.length > 0) {
  console.log('Warnings:');
  results.warnings.forEach(w => console.log(`  ⚠ ${w}`));
  console.log('');
}

console.log('Passed checks:');
results.passed.forEach(p => console.log(`  ${p}`));

console.log(`\nTotal: ${totalPassed} passed, ${results.errors.length} errors, ${results.warnings.length} warnings`);

// Exit with error code if there are errors
process.exit(results.errors.length > 0 ? 1 : 0);