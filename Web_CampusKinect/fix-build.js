const fs = require('fs');
const path = require('path');

// Simple placeholder for images during build
const placeholder = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

// Find all files that import KinectLogo
const filesToFix = [
  'src/app/page.tsx',
  'src/app/auth/verify/page.tsx',
  'src/app/auth/resend-code/page.tsx',
  'src/components/auth/LoginForm.tsx',
  'src/components/auth/RegisterForm.tsx',
  'src/components/layout/Header.tsx'
];

console.log('🔧 Temporarily fixing image imports for build...');

filesToFix.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Replace the import statement
      content = content.replace(
        /import\s+KinectLogo\s+from\s+['"`]@\/assets\/logos\/KinectLogo\.png['"`];?/g,
        `const KinectLogo = { src: '${placeholder}' };`
      );
      
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed ${filePath}`);
    } catch (error) {
      console.log(`❌ Error fixing ${filePath}:`, error.message);
    }
  }
});

console.log('🚀 Build fix complete!'); 