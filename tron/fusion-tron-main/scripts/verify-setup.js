#!/usr/bin/env node

/**
 * 🔧 Fusion+ Tron Bridge - Setup Verification Script
 * Verifies all prerequisites and development environment setup
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Fusion+ Tron Bridge - Setup Verification\n');

const checks = [
  {
    name: 'Node.js Version',
    check: () => {
      const version = process.version;
      const major = parseInt(version.slice(1).split('.')[0]);
      if (major >= 18) {
        return { success: true, message: `✅ Node.js ${version} (≥18 required)` };
      }
      return { success: false, message: `❌ Node.js ${version} - Need ≥18.0.0` };
    }
  },
  
  {
    name: 'NPM Version',
    check: () => {
      try {
        const version = execSync('npm --version', { encoding: 'utf8' }).trim();
        const major = parseInt(version.split('.')[0]);
        if (major >= 8) {
          return { success: true, message: `✅ NPM ${version} (≥8 required)` };
        }
        return { success: false, message: `❌ NPM ${version} - Need ≥8.0.0` };
      } catch (error) {
        return { success: false, message: `❌ NPM not found` };
      }
    }
  },
  
  {
    name: 'TronBox Installation',
    check: () => {
      try {
        const version = execSync('tronbox version', { encoding: 'utf8' });
        if (version.includes('Tronbox')) {
          return { success: true, message: `✅ TronBox installed` };
        }
        return { success: false, message: `❌ TronBox version check failed` };
      } catch (error) {
        return { success: false, message: `❌ TronBox not installed - Run: npm install -g tronbox` };
      }
    }
  },
  
  {
    name: 'Environment Configuration',
    check: () => {
      const envExample = path.join(__dirname, '..', '.env.example');
      const envFile = path.join(__dirname, '..', '.env');
      
      if (!fs.existsSync(envExample)) {
        return { success: false, message: `❌ .env.example not found` };
      }
      
      if (!fs.existsSync(envFile)) {
        return { success: false, message: `⚠️  .env not found - Copy .env.example to .env and configure` };
      }
      
      return { success: true, message: `✅ Environment files present` };
    }
  },
  
  {
    name: 'Project Structure',
    check: () => {
      const requiredDirs = ['contracts', 'src', 'tests', 'scripts'];
      const missing = requiredDirs.filter(dir => 
        !fs.existsSync(path.join(__dirname, '..', dir))
      );
      
      if (missing.length === 0) {
        return { success: true, message: `✅ Project structure complete` };
      }
      return { success: false, message: `❌ Missing directories: ${missing.join(', ')}` };
    }
  }
];

let allPassed = true;

console.log('Running setup verification checks...\n');

checks.forEach((check, index) => {
  console.log(`${index + 1}. ${check.name}`);
  const result = check.check();
  console.log(`   ${result.message}`);
  if (!result.success) allPassed = false;
  console.log('');
});

console.log('='.repeat(50));

if (allPassed) {
  console.log('🎉 All checks passed! Environment is ready for development.');
  console.log('\nNext steps:');
  console.log('1. Configure your .env file with private keys');
  console.log('2. Run: npm install');
  console.log('3. Start development: npm run deploy:all');
} else {
  console.log('❌ Some checks failed. Please resolve the issues above.');
  process.exit(1);
}

console.log('\n🚀 Ready for Phase 1: Core HTLC Contract Development!'); 