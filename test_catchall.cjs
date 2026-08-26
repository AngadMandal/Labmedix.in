const express = require('express');
const app = express();

app.get('/api/test', (req, res) => res.send('api'));

const distPath = __dirname + '/dist';
app.use(express.static(distPath));

app.get('*all', (req, res) => {
  res.send('matched *all for path: ' + req.path);
});

app.listen(3006, async () => {
  const res1 = await fetch('http://localhost:3006/api/test');
  console.log('/api/test:', await res1.text());

  const res2 = await fetch('http://localhost:3006/some/random/route');
  console.log('/some/random/route:', await res2.text());

  process.exit(0);
});
