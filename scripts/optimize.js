const fs = await import('fs');
const path = await import('path');

const srcDir = path.dirname(new URL(import.meta.url).pathname);
const distDir = path.join(srcDir, '..', 'dist');

// Files to copy directly
const staticFiles = ['index.html', '404.html', 'README.md', 'DEPLOY.md', 'MONETIZATION.md', 'SEO.md', 'STRUCTURE.md', 'LAUNCH.md', 'sitemap.xml', 'robots.txt'];

// Copy static files
staticFiles.forEach(file => {
  const src = path.join(srcDir, file);
  const dest = path.join(distDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`Copied ${file}`);
  }
});

// Copy directories
const dirs = ['css', 'js', 'scenes', 'assets', 'foreground'];
dirs.forEach(dir => {
  const srcDirPath = path.join(srcDir, dir);
  const destDirPath = path.join(distDir, dir);
  if (fs.existsSync(srcDirPath)) {
    fs.rmSync(destDirPath, { recursive: true, force: true });
    fs.cpSync(srcDirPath, destDirPath, { recursive: true });
    console.log(`Copied ${dir}/`);
  }
});

console.log('Build complete!');