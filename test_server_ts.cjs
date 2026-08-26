const { spawn } = require('child_process');

const proc = spawn('npx', ['tsx', 'server.ts'], {
  env: { ...process.env, PORT: '3011', NODE_ENV: 'development' }
});

proc.stdout.on('data', (data) => console.log(`stdout: ${data}`));
proc.stderr.on('data', (data) => console.log(`stderr: ${data}`));

setTimeout(async () => {
  try {
    const res1 = await fetch('http://localhost:3011/');
    console.log('GET / status:', res1.status);
    const res2 = await fetch('http://localhost:3011/patients');
    console.log('GET /patients status:', res2.status);
    console.log('GET /patients body snippet:', (await res2.text()).substring(0, 100));
  } catch (err) {
    console.error('Fetch error:', err);
  } finally {
    proc.kill();
    process.exit(0);
  }
}, 3000);
