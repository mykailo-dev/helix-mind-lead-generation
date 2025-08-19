const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Helix Mind development server on port 3003...');
console.log('📱 Your app will be available at: http://localhost:3003');

const devProcess = spawn('npx', ['next', 'dev', '-p', '3003'], {
  stdio: 'inherit',
  shell: true,
  cwd: path.join(__dirname, '..')
});

devProcess.on('close', (code) => {
  console.log(`\n🛑 Development server stopped with code ${code}`);
});

devProcess.on('error', (error) => {
  console.error('❌ Error starting development server:', error);
}); 