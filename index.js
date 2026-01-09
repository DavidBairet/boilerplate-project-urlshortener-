require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

// Middleware pour parser les données POST
app.use(express.urlencoded({ extended: true }));

app.use('/public', express.static(`${process.cwd()}/public`));

// Base de données en mémoire
const urls = [];

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// POST endpoint pour créer une URL courte
app.post('/api/shorturl', function(req, res) {
  const originalUrl = req.body.url;
  
  // Vérifier le format de base
  try {
    const urlObj = new URL(originalUrl);
    
    // Vérifier le protocole
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      return res.json({ error: 'invalid url' });
    }
    
    // Vérifier le DNS avec dns.lookup(host, cb)
    dns.lookup(urlObj.hostname, function(err, address) {
      if (err) {
        return res.json({ error: 'invalid url' });
      }
      
      // Chercher si l'URL existe déjà
      let found = urls.find(item => item.original_url === originalUrl);
      
      if (found) {
        return res.json({
          original_url: found.original_url,
          short_url: found.short_url
        });
      }
      
      // Créer une nouvelle entrée
      const short_url = urls.length + 1;
      const newUrl = {
        original_url: originalUrl,
        short_url: short_url
      };
      
      urls.push(newUrl);
      
      return res.json({
        original_url: originalUrl,
        short_url: short_url
      });
    });
    
  } catch (err) {
    return res.json({ error: 'invalid url' });
  }
});

// GET endpoint pour rediriger vers l'URL originale
app.get('/api/shorturl/:short_url', function(req, res) {
  const short_url = parseInt(req.params.short_url);
  
  const urlObj = urls.find(item => item.short_url === short_url);
  
  if (urlObj) {
    return res.redirect(urlObj.original_url);
  }
  
  return res.json({ error: 'No short URL found for the given input' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});