const fs = require('fs');
const express = require('express');
const Mustache = require('mustache');

const app = express();
app.use(express.static('public'));



app.get('/:player', (req, res) => {
  const template = fs.readFileSync('./public/play.html', 'utf-8');
  const rendered = Mustache.render(template, { playerName: req.params.player });
  res.send(rendered);
});
app.listen(3000);
