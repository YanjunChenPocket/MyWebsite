import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import localizedWorker, { isChineseDomain } from '../worker/localized.js';

function createAssets() {
  const requests = [];
  return {
    requests,
    async fetch(request) {
      const url = new URL(request.url);
      requests.push({ path: url.pathname, search: url.search, method: request.method });
      const files = {
        '/': { body: '<html lang="en">English homepage</html>', type: 'text/html' },
        '/zh/': { body: '<html lang="zh-CN">中文首页</html>', type: 'text/html' },
        '/zh/404/': { body: '<html lang="zh-CN">页面未找到</html>', type: 'text/html' },
        '/uploads/video.mp4': { body: 'video-data', type: 'video/mp4' },
        '/uploads/CV.pdf': { body: 'pdf-data', type: 'application/pdf' },
        '/_astro/styles.css': { body: 'body{}', type: 'text/css' },
      };
      const file = files[url.pathname];
      return new Response(request.method === 'HEAD' ? null : file?.body ?? '<html>Not found</html>', {
        status: file ? 200 : 404,
        headers: { 'content-type': file?.type ?? 'text/html', 'cache-control': 'public, max-age=60' },
      });
    },
  };
}

test('Chinese locale is limited to the exact .cn domains', () => {
  assert.equal(isChineseDomain('chen-yanjun.cn'), true);
  assert.equal(isChineseDomain('www.chen-yanjun.cn'), true);
  for (const hostname of ['chen-yanjun.com', 'www.chen-yanjun.com', 'evilchen-yanjun.cn', 'chen-yanjun.cn.evil.test']) {
    assert.equal(isChineseDomain(hostname), false);
  }
});

for (const hostname of ['chen-yanjun.cn', 'www.chen-yanjun.cn']) {
  test(`${hostname} serves Chinese at the root without redirecting`, async () => {
    const assets = createAssets();
    const response = await localizedWorker.fetch(new Request(`https://${hostname}/?ref=home`), { ASSETS: assets });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('location'), null);
    assert.equal(response.headers.get('content-language'), 'zh-CN');
    assert.match(await response.text(), /中文首页/);
    assert.deepEqual(assets.requests, [{ path: '/zh/', search: '?ref=home', method: 'GET' }]);
  });
}

test('.com stays English even with a Chinese browser preference', async () => {
  const assets = createAssets();
  const response = await localizedWorker.fetch(new Request('https://chen-yanjun.com/', {
    headers: { 'accept-language': 'zh-CN' },
  }), { ASSETS: assets });
  assert.equal(response.headers.get('content-language'), 'en');
  assert.match(await response.text(), /English homepage/);
});

test('an explicit Chinese preview path works without domain rewriting', async () => {
  const assets = createAssets();
  const response = await localizedWorker.fetch(new Request('https://chen-yanjun.com/zh/'), { ASSETS: assets });
  assert.equal(response.headers.get('content-language'), 'zh-CN');
  assert.match(await response.text(), /中文首页/);
});

test('HEAD and index.html aliases preserve their request semantics', async () => {
  const assets = createAssets();
  const response = await localizedWorker.fetch(new Request('https://chen-yanjun.cn/index.html', { method: 'HEAD' }), { ASSETS: assets });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('content-language'), 'zh-CN');
  assert.equal(await response.text(), '');
  assert.deepEqual(assets.requests, [{ path: '/zh/', search: '', method: 'HEAD' }]);
});

test('media, CV downloads, and stylesheets are not localized', async () => {
  for (const path of ['/uploads/video.mp4', '/uploads/CV.pdf', '/_astro/styles.css']) {
    const assets = createAssets();
    const response = await localizedWorker.fetch(new Request(`https://chen-yanjun.cn${path}`), { ASSETS: assets });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('content-language'), null);
    assert.equal(assets.requests[0].path, path);
    assert.equal(response.headers.get('cache-control'), 'public, max-age=60');
  }
});

test('Chinese error pages retain HTTP 404 rather than becoming soft 404s', async () => {
  const assets = createAssets();
  const response = await localizedWorker.fetch(new Request('https://chen-yanjun.cn/missing-page'), { ASSETS: assets });
  assert.equal(response.status, 404);
  assert.equal(response.headers.get('content-language'), 'zh-CN');
  assert.match(await response.text(), /页面未找到/);
  assert.deepEqual(assets.requests.map(request => request.path), ['/missing-page', '/zh/404/']);
});

test('English error pages stay English', async () => {
  const assets = createAssets();
  const response = await localizedWorker.fetch(new Request('https://chen-yanjun.com/missing-page'), { ASSETS: assets });
  assert.equal(response.status, 404);
  assert.equal(response.headers.get('content-language'), 'en');
  assert.match(await response.text(), /Not found/);
  assert.equal(assets.requests.length, 1);
});

test('country-specific media handling stays independent of domain language', async () => {
  const originalRewriter = globalThis.HTMLRewriter;
  let transforms = 0;
  globalThis.HTMLRewriter = class {
    on() { return this; }
    transform(response) { transforms++; return response; }
  };
  try {
    for (const [hostname, country, language] of [
      ['chen-yanjun.cn', 'US', 'zh-CN'],
      ['chen-yanjun.cn', 'CN', 'zh-CN'],
      ['chen-yanjun.com', 'CN', 'en'],
    ]) {
      const request = new Request(`https://${hostname}/`);
      Object.defineProperty(request, 'cf', { value: { country } });
      const response = await localizedWorker.fetch(request, { ASSETS: createAssets() });
      assert.equal(response.headers.get('content-language'), language);
    }
    assert.equal(transforms, 2);
  } finally {
    if (originalRewriter === undefined) delete globalThis.HTMLRewriter;
    else globalThis.HTMLRewriter = originalRewriter;
  }
});

test('pre-rendered languages have correct content, metadata, and shared links', async () => {
  const english = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
  const chinese = await readFile(new URL('../dist/zh/index.html', import.meta.url), 'utf8');
  assert.match(english, /<html lang="en">/);
  assert.match(chinese, /<html lang="zh-CN">/);
  assert.match(english, /rel="canonical" href="https:\/\/chen-yanjun.com"/);
  assert.match(chinese, /rel="canonical" href="https:\/\/chen-yanjun.cn"/);
  assert.match(english, /My research focuses on human-computer interaction/);
  assert.match(chinese, /我的研究方向是人机交互/);
  assert.match(chinese, /<title>陈彦君<\/title>/);
  assert.match(chinese, /你好，我是陈彦君。/);
  assert.match(chinese, /韩腾教授/);
  assert.match(chinese, /href="https:\/\/www.iscas.ac.cn\/"/);
  assert.doesNotMatch(chinese, /english.is.cas.cn/);
  assert.match(english, /Hi, I am Yanjun Chen./);
  assert.match(english, /Prof. Teng Han/);
  assert.match(english, /href="http:\/\/english.is.cas.cn\/"/);
  assert.match(chinese, /下载简历（英文）/);
  assert.match(chinese, /<span>论文<\/span>/);
  assert.match(chinese, /<span>原文<\/span>/);
  assert.match(chinese, /查看出版页面（DOI）/);
  assert.doesNotMatch(chinese, /<span>(pdf|doi)<\/span>/);
  assert.match(english, /<span>pdf<\/span>/);
  assert.match(english, /<span>doi<\/span>/);
  assert.match(english, /November 4, 2026 · 2:00–2:12 PM EST/);
  assert.match(chinese, /2026年11月4日 · 14:00–14:12 EST（美东标准时间）/);
  assert.match(chinese, /NailBender: Exploring Nail Flexion for Haptic Input and Output/);
  assert.match(chinese, /Chutian Jiang\*/);
  assert.match(chinese, /<strong>陈彦君<\/strong>\*/);
  assert.match(english, /<strong>Yanjun Chen<\/strong>\*/);
  assert.doesNotMatch(chinese, /Yanjun Chen|Teng Han/);
  assert.match(chinese, /2026.10.07/);
  assert.match(chinese, /发表 NailBender 主题演讲/);
  assert.doesNotMatch(chinese, /活动中介绍 NailBender/);
  for (const html of [english, chinese]) {
    assert.equal([...html.matchAll(/<p class="hero-bio"/g)].length, 3);
    assert.equal([...html.matchAll(/<li class="news-item"/g)].length, 5);
    assert.match(html, /hreflang="zh-CN" href="https:\/\/chen-yanjun.cn\/"/);
    const news = html.match(/<aside class="news-sidebar"[\s\S]*?<\/aside>/)[0];
    assert.doesNotMatch(news, /<a\s/);
  }
  // The institute link intentionally uses its Chinese homepage on .cn.
  const links = html => [...html.matchAll(/<a [^>]*href="([^"]+)"/g)]
    .map(match => match[1].replace('https://www.iscas.ac.cn/', 'http://english.is.cas.cn/')).sort();
  assert.deepEqual(links(english), links(chinese));
});
