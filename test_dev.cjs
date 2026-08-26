const express = require('express');
const { createServer } = require('vite');

async function test() {
  const app = express();
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);

  const server = app.listen(3009, async () => {
    const res = await fetch('http://localhost:3009/');
    console.log('Dev GET / status:', res.status);
    console.log('Dev GET / body:', (await res.text()).substring(0, 100));
    server.close();
    process.exit(0);
  });
}
test();
