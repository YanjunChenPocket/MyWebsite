# chen-yanjun.com

Personal academic site, built with [Astro](https://astro.build/) and deployed on Cloudflare Pages.

## Quick start

```bash
# Install dependencies (one-time)
npm install

# Run dev server at http://localhost:4321
npm run dev

# Build static site to ./dist
npm run build

# Preview the built site locally
npm run preview
```

Requires Node.js 18.17+ or 20.3+ (recommended: 20 LTS).

---

## How content is organized

Everything you might want to edit lives in plain files. **You should never need to touch component code to update content.**

| What you want to change | File to edit |
|--|--|
| Bio, photo, name, CV link, nav, footer | `src/config.ts` |
| Add / edit a publication | `src/content/publications/*.md` (one file per paper) |
| Add / edit a fun project | `src/content/projects/*.md` |
| Site colors, fonts, spacing | `src/styles/global.css` (CSS variables at the top) |
| News items (newest first, plain text) | `src/data/news.ts` |
| Chinese biography and interface labels | `src/i18n.ts` |

### English and Chinese versions

- `chen-yanjun.com` remains the English homepage.
- `chen-yanjun.cn` and `www.chen-yanjun.cn` serve the pre-rendered Chinese homepage
  at the root URL. No client-side translation or language flash is needed.
- Both versions share the original Yanjun Chen signature logo and publication
  titles, English / romanized author names, venues, awards, assets, and resource
  links. Author ordering, bold names, and contribution stars are preserved.
  Chinese biography and News use 陈彦君 and 韩腾. The institute link uses its
  Chinese homepage. The CV remains the existing English PDF; its Chinese tooltip
  says so. Chinese resource buttons remain 论文 / 原文 / 视频.
- The EN / 中 switch slides between the two domains, preserving the current
  section anchor. On wide desktop screens it sits independently at the upper
  right, aligned above News, without moving Home / Publication. Narrow screens
  keep it in the compact header. It also supports keyboard navigation, native
  links without JavaScript, and reduced-motion preferences.
- Edit both `text` and `textZh` for each News item. Project awards can use
  `awardZh`; preview captions can use `previewNoteZh`.
- Preview Chinese locally at `/zh/`. `worker/localized.js` handles domain routing,
  then delegates to the existing media worker; `wrangler.jsonc` selects this entry.
- `npm test` builds both languages and checks routing, metadata, links, and 404s.

The English-only baseline is recorded in
[`archives/2026-10-25-before-chinese-version/`](archives/2026-10-25-before-chinese-version/).
Its manifest identifies the complete previous Git revision for recovery.

Domain routing uses the existing Cloudflare Static Assets binding; see the
[Cloudflare binding documentation](https://developers.cloudflare.com/workers/static-assets/binding/).

The desktop News panel fits the latest three items. Scroll inside it to read older news;
two seconds after the pointer leaves, it smoothly returns to the top. Returning the
pointer cancels the pending reset, and keyboard focus pauses it. Reduced-motion
preferences disable the return animation. The blue marker appears only on hover.

Publication buttons use soft coral (PDF), apricot (DOI), and blue (Video), with dark,
regular-weight labels. Their dimensions remain 80 × 38 px.

### Biography archive

Before the October 25, 2026 refresh, the original biography, Hero component, and
NailBender preview date were saved in
[`archives/2026-10-25-before-bio-update/`](archives/2026-10-25-before-bio-update/).
These source snapshots are also tracked in Git and are not served by the website.
`biography.txt` is a readable plain-text copy of the previous introduction.
`manifest.json` records the original commit, source-file mapping, and recovery notes.

The current introduction has three fields in `src/config.ts`: `hero.bio` (current
position), `hero.interests` (research), and `hero.background` (previous experience).
To restore only the old biography, copy `hero.bio` and `hero.interests` from the
archived `config.ts.txt` and set `hero.background` to an empty string. Preserve any
unrelated changes made since the archive. The archived `Hero.astro.txt` also retains
the original two-paragraph layout if it is needed later.

### Adding a new publication

Create a new file in `src/content/publications/`, e.g. `00-new-paper.md`:

```markdown
---
title: "Paper Title Here"
authors: "Author One, **Yanjun Chen**, Author Three"
venue: "CHI 2026: ACM Conference on Human Factors in Computing Systems"
year: 2026
order: 0          # lower number = appears higher on the page
paperUrl: "/uploads/your-paper.pdf"
doiUrl: "https://doi.org/..."
videoUrl: "https://www.youtube.com/watch?v=..."
previewVideo: "/uploads/your-preview.mp4"
---
```

- Wrap your own name in `**double asterisks**` to bold it in the author list.
- `order: 0` puts it at the top. Existing papers go from `order: 1` (newest) downward.
- Drop the PDF and preview video into `public/uploads/`.
- Any of the URL fields can be omitted — buttons only show if a URL is set.

### Adding a fun project

Same idea, in `src/content/projects/`:

```markdown
---
title: "Project Name"
venue: "Some Conference 2025"
year: 2025
order: 0
image: "/uploads/your-image.jpg"
award: "🏆 Best Demo"   # optional
---
```

---

## Migrating content from the old WordPress site

Your existing PDFs, videos, and images currently live at
`https://chen-yanjun.com/wp-content/uploads/...` and `https://chen-yanjun.com/uploads/...`.

1. Download everything from the old site's `/uploads/` and `/wp-content/uploads/` folders.
2. Drop the files into this repo's `public/uploads/` folder.
3. The Markdown files already reference them at `/uploads/<filename>` — no path changes needed.

You also need a profile photo (`me.png`) and headshot (`cropped-me.png`) in `public/uploads/`. The headshot is used as the favicon and the hero photo.

### Tip: shrink those preview videos

The original site serves preview clips as full-size `.mp4`. Re-encode to ~720p and a few seconds long to keep page loads snappy:

```bash
# Example using ffmpeg
ffmpeg -i original.mp4 -t 6 -vf scale=-2:720 -c:v libx264 -crf 28 -an preview.mp4
```

A 1–2 MB preview file is plenty.

---

## Deploying to Cloudflare Pages

1. Push this repo to GitHub (or GitLab).
2. Go to [Cloudflare Pages dashboard](https://dash.cloudflare.com/) → **Create a project** → connect to your repo.
3. Use these build settings:
   - **Framework preset**: Astro
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Node version**: `20` (set under environment variables: `NODE_VERSION=20`)
4. Click **Save and Deploy**. First build takes ~1 minute.
5. In **Custom domains**, add `chen-yanjun.com` and `www.chen-yanjun.com`.
   - Cloudflare will guide you through DNS setup. If your domain is already on Cloudflare, this is one click.

After this, every `git push` to your main branch automatically rebuilds and deploys the site.

---

## Stack

- **Astro 6** — static site generator. Outputs zero JS by default.
- **No CSS framework** — plain CSS with custom properties. ~5 KB gzipped.
- **Small client-side scripts** — for interactions such as News sizing and delayed scroll reset.
- **Total build output** for a site this size: well under 100 KB of HTML/CSS (videos and PDFs excluded).

## Why this is easier to maintain than WordPress

- No database, no PHP, no plugin updates, no security patches.
- Adding a paper = creating one Markdown file and `git push`.
- Versioned in git — full history of every edit.
- Free hosting on Cloudflare Pages with global CDN.
