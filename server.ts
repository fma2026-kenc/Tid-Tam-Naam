import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Proxy endpoint to strip X-Frame-Options and Content-Security-Policy
  // Specifically solves embedding for https://siahra-radar.co and restricted flood portals
  app.get('/api/proxy', async (req, res) => {
    const rawUrl = req.query.url as string;
    if (!rawUrl) {
      return res.status(400).send('Missing url parameter');
    }

    try {
      const decodedUrl = decodeURIComponent(rawUrl);
      const parsedUrl = new URL(decodedUrl);

      const upstreamResponse = await fetch(decodedUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'th,en-US;q=0.9,en;q=0.8',
        },
      });

      const contentType = upstreamResponse.headers.get('content-type') || 'text/html';
      res.setHeader('Content-Type', contentType);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.removeHeader('X-Frame-Options');
      res.removeHeader('Content-Security-Policy');

      let body = await upstreamResponse.text();

      if (contentType.includes('text/html')) {
        const originWithSlash = parsedUrl.origin + '/';

        // Strip any meta tags with CSP or X-Frame-Options
        body = body.replace(/<meta[^>]*http-equiv=["']Content-Security-Policy["'][^>]*>/gi, '');
        body = body.replace(/<meta[^>]*http-equiv=["']X-Frame-Options["'][^>]*>/gi, '');

        // Inject base tag so relative assets resolve to the origin domain
        if (body.includes('<head>')) {
          body = body.replace('<head>', `<head><base href="${originWithSlash}">`);
        } else if (body.includes('<head ')) {
          body = body.replace(/<head[^>]*>/, `$&<base href="${originWithSlash}">`);
        }
      }

      res.send(body);
    } catch (err: any) {
      console.error('Proxy error for', rawUrl, ':', err.message);
      res.status(502).send(`Error fetching target URL: ${err.message}`);
    }
  });

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Dev server with Vite middlewares
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

startServer();
