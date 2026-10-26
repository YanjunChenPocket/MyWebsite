import mediaWorker from './index.js';

export function isChineseDomain(hostname) {
  return hostname === 'chen-yanjun.cn' || hostname === 'www.chen-yanjun.cn';
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const chineseDomain = isChineseDomain(url.hostname);
    const readable = request.method === 'GET' || request.method === 'HEAD';

    // Keep the public URL at .cn/ while serving pre-rendered Chinese HTML.
    // Leave the existing media worker and its country-specific behavior intact.
    const assetUrl = new URL(url);
    if (chineseDomain && readable && (url.pathname === '/' || url.pathname === '/index.html')) {
      assetUrl.pathname = '/zh/';
    }
    const localizedEnv = {
      ...env,
      ASSETS: {
        fetch: originalRequest => env.ASSETS.fetch(new Request(assetUrl, originalRequest)),
      },
    };
    let response = await mediaWorker.fetch(request, localizedEnv, ctx);

    if (chineseDomain && readable && response.status === 404
        && response.headers.get('content-type')?.includes('text/html')) {
      const fallbackUrl = new URL('/zh/404/', url);
      const fallbackEnv = {
        ...env,
        ASSETS: {
          fetch: originalRequest => env.ASSETS.fetch(new Request(fallbackUrl, originalRequest)),
        },
      };
      const fallback = await mediaWorker.fetch(request, fallbackEnv, ctx);
      response = new Response(fallback.body, { status: 404, headers: fallback.headers });
    }

    if (response.headers.get('content-type')?.includes('text/html')) {
      response = new Response(response.body, response);
      const chineseHtml = assetUrl.pathname.startsWith('/zh/')
        || (chineseDomain && response.status === 404);
      response.headers.set('content-language', chineseHtml ? 'zh-CN' : 'en');
    }
    return response;
  },
};
