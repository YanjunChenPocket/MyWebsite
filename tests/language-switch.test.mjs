import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { runInNewContext } from 'node:vm';

// Exercise the shipped inline script with the reader currently at Publications.
async function createSwitch(locale, reducedMotion = false) {
  const path = locale === 'en' ? '../dist/index.html' : '../dist/zh/index.html';
  const html = await readFile(new URL(path, import.meta.url), 'utf8');
  const script = [...html.matchAll(/<script type="module">([\s\S]*?)<\/script>/g)]
    .map(match => match[1]).find(source => source.includes('.language-switch'));
  assert.ok(script, 'the built page must contain the language switch behavior');

  const links = [
    { href: 'https://chen-yanjun.com/', dataset: { language: 'en' } },
    { href: 'https://chen-yanjun.cn/', dataset: { language: 'zh-CN' } },
  ];
  const handlers = {};
  const pageHandlers = {};
  const timers = new Map();
  const destinations = [];
  let timerId = 0;
  const control = {
    dataset: { language: locale },
    contains: link => links.includes(link),
    querySelectorAll: () => links,
    addEventListener: (name, handler) => { handlers[name] = handler; },
  };
  runInNewContext(script, {
    URL,
    document: { querySelectorAll: () => [control] },
    window: {
      location: { hash: '#publication', assign: url => destinations.push(url) },
      matchMedia: () => ({ matches: reducedMotion }),
      addEventListener: (name, handler) => { pageHandlers[name] = handler; },
      setTimeout: callback => { timers.set(++timerId, callback); return timerId; },
      clearTimeout: id => { timers.delete(id); },
    },
  });
  return {
    links, control, destinations, pageHandlers, timers,
    click(language, modifiers = {}) {
      const link = links.find(item => item.dataset.language === language);
      const event = {
        button: 0, defaultPrevented: false, target: { closest: () => link },
        preventDefault() { this.defaultPrevented = true; }, ...modifiers,
      };
      handlers.click(event);
      return event;
    },
    flush() {
      for (const callback of timers.values()) callback();
      timers.clear();
    },
  };
}

test('language links always open the homepage, never the current section', async () => {
  for (const locale of ['en', 'zh-CN']) {
    for (const target of ['en', 'zh-CN']) {
      const ui = await createSwitch(locale);
      const destination = target === 'en' ? 'https://chen-yanjun.com/' : 'https://chen-yanjun.cn/';
      assert.equal(ui.links.find(link => link.dataset.language === target).href, destination);
      assert.equal(ui.pageHandlers.hashchange, undefined);
      assert.equal(ui.click(target).defaultPrevented, true);
      // Finishing the initial page load must not cancel an early user click.
      ui.pageHandlers.pageshow({ persisted: false });
      ui.flush();
      assert.deepEqual(ui.destinations, [destination]);
    }
  }
});

test('reduced motion and modified clicks preserve native homepage navigation', async () => {
  for (const [reducedMotion, modifiers] of [[true, {}], [false, { ctrlKey: true }], [false, { metaKey: true }]]) {
    const ui = await createSwitch('en', reducedMotion);
    assert.equal(ui.click('zh-CN', modifiers).defaultPrevented, false);
    assert.equal(ui.links[1].href, 'https://chen-yanjun.cn/');
    assert.equal(ui.timers.size, 0);
  }
});

test('history restoration resets the selected language and cancels stale navigation', async () => {
  const ui = await createSwitch('en');
  ui.click('zh-CN');
  assert.equal(ui.control.dataset.language, 'zh-CN');
  ui.pageHandlers.pageshow({ persisted: true });
  assert.equal(ui.control.dataset.language, 'en');
  ui.flush();
  assert.deepEqual(ui.destinations, []);
});
