const express = require('express');
const app = express();
app.get('*all', (req, res) => res.send('matched *all'));
app.listen(3005, () => console.log('started'));
