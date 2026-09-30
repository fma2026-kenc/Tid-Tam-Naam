// Cloudflare Pages Function: /api/proxy
// Proxies external flood radars and strips X-Frame-Options/CSP frame-ancestors

export async function onRequestGet(context: { request: Request }) {
  const url = new URL(context.request.url);
  const targetUrl = url.searchParams.get('url');

  if (!targetUrl) {
    return new Response('Missing url parameter', { status: 400 });
  }

  try {
    const decodedUrl = decodeURIComponent(targetUrl);
    const parsedTarget = new URL(decodedUrl);

    const response = await fetch(decodedUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'th,en-US;q=0.9,en;q=0.8',
      },
    });

    const contentType = response.headers.get('content-type') || 'text/html';
    let body = await response.text();

    if (contentType.includes('text/html')) {
      const originWithSlash = parsedTarget.origin + '/';
      body = body.replace(/<meta[^>]*http-equiv=["']Content-Security-Policy["'][^>]*>/gi, '');
      body = body.replace(/<meta[^>]*http-equiv=["']X-Frame-Options["'][^>]*>/gi, '');

      if (body.includes('<head>')) {
        body = body.replace('<head>', `<head><base href="${originWithSlash}">`);
      } else if (body.includes('<head ')) {
        body = body.replace(/<head[^>]*>/, `$&<base href="${originWithSlash}">`);
      }
    }

    const newHeaders = new Headers(response.headers);
    newHeaders.set('Content-Type', contentType);
    newHeaders.set('Access-Control-Allow-Origin', '*');
    newHeaders.delete('x-frame-options');
    newHeaders.delete('content-security-policy');

    return new Response(body, {
      status: response.status,
      headers: newHeaders,
    });
  } catch (err: any) {
    return new Response(`Error proxying: ${err.message}`, { status: 502 });
  }
}
