const express = require('express');
const cors = require('cors');
const path = require('node:path');
const fs = require('node:fs');

const apiRouter = require('./routes/apiRouter');
const redirectRouter = require('./routes/redirectRouter');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Trust proxy for Herd / Nginx reverse proxy
app.set('trust proxy', true);

// 1. Dashboard REST API
app.use('/api', apiRouter);

// 2. Explicit redirect path: /r/:code
app.use('/r', redirectRouter);

// 3. Static frontend build (Vite dist)
const clientDist = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
}

// 4. Root direct slug redirect /:code (checks if single slug)
app.get('/:code([a-zA-Z0-9-_]{3,32})', (req, res, next) => {
  // If it's an asset or api call, let next handlers deal with it
  const code = req.params.code;
  if (code === 'api' || code === 'assets' || code === 'vite.svg' || code === 'favicon.ico') {
    return next();
  }
  // Delegate to redirectRouter
  redirectRouter(req, res, next);
});

// 5. SPA fallback
app.get('*', (req, res) => {
  const indexHtml = path.join(clientDist, 'index.html');
  if (fs.existsSync(indexHtml)) {
    return res.sendFile(indexHtml);
  }
  // Standby page if client not yet built
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>RAWLINK TRACKER // BACKEND ACTIVE</title>
        <style>
          body { background: #f4f4f0; font-family: monospace; padding: 40px; color: #000; }
          .box { border: 2px solid #000; padding: 24px; background: #fff; max-width: 600px; box-shadow: 4px 4px 0 #000; }
        </style>
      </head>
      <body>
        <div class="box">
          <h3>[RAWLINK TRACKER API STANDBY]</h3>
          <p>Backend Express siap di port 5060.</p>
          <p>Jalankan <code>npm run build</code> untuk mengompilasi dashboard React.</p>
        </div>
      </body>
    </html>
  `);
});

module.exports = app;
