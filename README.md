# Rozel Eliodra — Independent portfolio

A personal web-development portfolio presented as an interactive print folio. The cover combines oversized type, a halftone hand, and a sculpted asterisk. Inside are two project stories, Rozel’s working record, and a geometric print you can design and download.

## Run locally

```sh
python3 -m http.server 4173 --bind 0.0.0.0
```

Open `http://localhost:4173/`. There is no install or build step. Pages, scripts, fonts, and artwork use relative URLs so the same files work at a domain root or under `/portfolio/` on GitHub Pages.

## Explore

- **Cover:** Move the pointer over the hand for depth, or use **Remix ink** to pull a different colorway. The cover itself is at least one viewport tall and can grow to accommodate larger text.
- **Work:** Switch between the gallery and index. [Pawpaw Cafe](work/pawpaw-cafe.html) and [Marci Metzger](work/marci-metzger.html) each have a project brief, illustrated interface preview, development notes, and a link to the live site.
- **Profile:** Native disclosures cover experience and education. Contact details work without scripts.
- **Form Lab:** Choose a knot, ring, or ribbon, then an ink. Drag horizontally or use the keyboard-accessible rotation slider. **Save SVG** downloads the current drawing, captions, and paper as a standalone vector file. Nothing is uploaded.

## Motion and accessibility

GSAP sequences the cover entrance and hand movement. ScrollTrigger handles the offset printing plate and one-time section entrances; scrolling and links remain native. The pause control beside **Remix ink** and the motion setting in the footer both stop animation. A device’s reduced-motion setting takes precedence. The floating hand and moving type strip also pause outside the visible page or in a background tab.

Layout, theme, and motion preferences are saved if local storage is available. The mobile menu supports keyboard navigation and Escape. Without JavaScript, navigation, both stories, disclosures, contact links, and the initial print are still available. If the animation library fails to load, the other controls still work.

## Files and maintenance

| Path | Purpose |
| --- | --- |
| `index.html`, `work/*.html` | Semantic pages, metadata, real project links, and shared navigation/contact markup. |
| `styles.css` | Page grid, print layers, responsive compositions, color palettes, and print styles. |
| `script.js` | Menu, reading progress, local time in the Philippines, preferences, archive views, and GSAP motion. |
| `geometry.js`, `lab.js` | Parametric surfaces and perspective projection; lab controls and SVG export. |
| `assets/press/` | The optimized original hand illustration, grain tile, icon sprite, and static knot plate. |
| `tools/plot-default.mjs` | Regenerates the no-JavaScript plate after changing the projection. |

Optional checks (Node 22+):

```sh
node --test tests/geometry.test.mjs
node --check script.js && node --check lab.js
npx --yes html-validate@11.21.1 index.html work/*.html
```

Run `node tools/plot-default.mjs` if the default drawing changes. The site itself does not need Node.

## Credits

- Art direction references: [K95](https://k95.it/), [Juan Mora](https://juanmora.co/), [Flesh and Bones](https://wearefleshandbones.com/), [Lovely Friendly](https://lovelyfriendly.com/), and [Digital Panda](https://www.digitalpanda.com/). The artwork and layouts here are original, not assets from those sites.
- The cover hand was generated for this folio and processed into a transparent WebP. The portrait and project photos come from the existing portfolio. The Pawpaw preview uses [Pexels photo 27969840](https://www.pexels.com/photo/two-plates-with-sandwiches-and-a-menu-on-them-27969840/).
- Anton, Space Grotesk, IBM Plex Mono, and Kalam are self-hosted in `assets/fonts/`, alongside their licenses.
- [GSAP 3.15.1](https://www.npmjs.com/package/gsap/v/3.15.1) and ScrollTrigger are served from `assets/vendor/gsap/` under the [GSAP standard license](https://gsap.com/standard-license/).
