const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'dist')));

app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(3008, async () => {
  const res = await fetch('http://localhost:3008/some/random/page');
  console.log('Status:', res.status);
  console.log('Body snippet:', (await res.text()).substring(0, 50));
  process.exit(0);
});
