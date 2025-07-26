const fs = require('fs');
const path = require('path');

const src = 'src/functions';
const dist = 'dist/functions';

if (!fs.existsSync(dist)) {
  fs.mkdirSync(dist, { recursive: true });
}

fs.readdirSync(src).forEach(dir => {
  const srcDir = path.join(src, dir);
  const distDir = path.join(dist, dir);
  
  if (fs.statSync(srcDir).isDirectory()) {
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }
    
    fs.readdirSync(srcDir).forEach(file => {
      if (file.endsWith('.json')) {
        fs.copyFileSync(path.join(srcDir, file), path.join(distDir, file));
      }
    });
  }
});

console.log('✅ Schema files copied successfully'); 