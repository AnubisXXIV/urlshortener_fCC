require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dns = require('dns');
const urlparser = require('url');
// Basic Configuration
const port = process.env.PORT || 3000;
mongoose.connect(process.env.MONGO_URI);

const urlSchema = new mongoose.Schema({
  originalUrl: String,
  shortUrl: Number
});

const ShortUrl = new mongoose.model('url', urlSchema);

app.use(cors());

app.use(bodyParser.urlencoded({extended: false}));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', async (req, res) => {
  const userInput = req.body.url;

  const dnsTest = dns.lookup(urlparser.parse(userInput).hostname, async (err, address) => {
    if (!address) {
      res.json({
        error: 'invalid url'
      });
    } else {
      const counts = await ShortUrl.estimatedDocumentCount();

      const newEntry = new ShortUrl({
        originalUrl: userInput,
        shortUrl: counts + 1
      });

      newEntry.save();

      res.json({
        original_url: userInput,
        short_url: counts + 1
      });
    }
  })
});

app.get('/api/shorturl/:id', async (req, res) => {
  const query = await ShortUrl.findOne({shortUrl: +req.params.id});
  res.redirect(query.originalUrl);
})


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
