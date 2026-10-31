import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

for (const [page, doiLabel] of [['index.html', 'doi'], ['zh/index.html', '原文']]) {
  test(`${page} shows the released NailBender preview and DOI`, async () => {
    const html = await readFile(new URL(`../dist/${page}`, import.meta.url), 'utf8');
    const card = html.match(/<article class="entry">[\s\S]*?<\/article>/)?.[0];
    assert.ok(card, 'The first publication must exist');
    assert.match(card, /NailBender: Exploring Nail Flexion for Haptic Input and Output/);
    assert.match(card, /data-src="\/uploads\/nailbender.mp4"/);
    assert.match(card, /poster="\/uploads\/posters\/nailbender.jpg"/);
    assert.match(card, /<video[^>]*autoplay[^>]*muted[^>]*loop[^>]*playsinline/);
    assert.match(card, new RegExp(`<a href="https://dl\\.acm\\.org/doi/10\\.1145/3830398\\.3830525" class="entry-link entry-link-doi"[^>]*>[\\s\\S]*?<span>${doiLabel}</span>`));
    assert.match(card, /href="https:\/\/www.youtube.com\/watch\?v=PtVEMRXrico"/);
    assert.doesNotMatch(card, /entry-placeholder|NailBender-soon|preview-note/);
    assert.match(html, /href="\/uploads\/Yanjun_Chen.pdf\?v=20261031"/);
  });
}

test('NailBender preview stays small and its MP4 metadata is before the media', async () => {
  const video = await readFile(new URL('../public/uploads/nailbender.mp4', import.meta.url));
  assert.ok(video.length > 100_000 && video.length < 2_500_000, 'Keep the preview within the existing video size range');
  const atoms = [];
  for (let offset = 0; offset < video.length;) {
    assert.ok(offset + 8 <= video.length, 'MP4 atom header is complete');
    const size = video.readUInt32BE(offset);
    assert.ok(size >= 8 && offset + size <= video.length, 'MP4 atom is complete');
    atoms.push(video.toString('ascii', offset + 4, offset + 8));
    offset += size;
  }
  assert.equal(atoms[0], 'ftyp');
  assert.ok(atoms.includes('moov') && atoms.includes('mdat'));
  assert.ok(atoms.indexOf('moov') < atoms.indexOf('mdat'), 'Fast-start playback must not wait for the whole file');
});

test('the production build contains the exact updated CV, video, and poster', async () => {
  for (const asset of ['Yanjun_Chen.pdf', 'nailbender.mp4', 'posters/nailbender.jpg']) {
    const source = await readFile(new URL(`../public/uploads/${asset}`, import.meta.url));
    const built = await readFile(new URL(`../dist/uploads/${asset}`, import.meta.url));
    assert.deepEqual(built, source, `Published ${asset} must match its source`);
    if (asset.endsWith('.pdf')) assert.equal(source.toString('ascii', 0, 5), '%PDF-');
    if (asset.endsWith('.jpg')) assert.equal(source.readUInt16BE(0), 0xffd8);
  }
});
