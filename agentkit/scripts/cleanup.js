const fs = require('fs');
const path = require('path');

const dist = 'dist/functions';

if (fs.existsSync(dist)) {
  fs.readdirSync(dist).forEach(dir => {
    const distDir = path.join(dist, dir);
    
    if (fs.statSync(distDir).isDirectory()) {
      fs.readdirSync(distDir).forEach(file => {
        if (file.endsWith('.ts') || file.endsWith('.md')) {
          fs.unlinkSync(path.join(distDir, file));
        }
      });
    }
  });
}

console.log('✅ Cleanup completed successfully'); 