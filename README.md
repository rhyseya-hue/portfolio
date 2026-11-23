# Rozel Eliodra — Creative Developer

An independent web-development portfolio with an industrial, minimal visual system: blueprint grids, equipment-style labels, bold type, and a safety-orange accent. The site includes two project case studies, a profile and experience record, and an interactive geometry lab.

## Run locally

```sh
python3 -m http.server 4173 --bind 0.0.0.0
```

Open `http://localhost:4173/`. There is no install or build step. Pages, scripts, fonts, and artwork use relative URLs so the same files work at a domain root or in a subdirectory.

## Explore

- **Work:** Browse the gallery or switch to the compact index. Each project has its own notes and a separate link to the live site.
- **Project notes:** In [Pawpaw Cafe](work/pawpaw-cafe.html), switch between the arrival screen and filtered menu. In [Marci Metzger](work/marci-metzger.html), compare the buyer search and seller enquiry. Each capture has a caption and a full-size link.
- **Profile:** Expand the experience and education records to read more.
- **Form Lab:** Choose a knot, ring, or ribbon and an ink. Drag horizontally or use the keyboard-accessible rotation slider. **Save SVG** downloads the current drawing and captions as a standalone vector file; nothing is uploaded.
- **Contact:** Use the email or phone links, or copy the email address.

## Motion and accessibility

Scrolling and links are native. The footer controls let visitors change the theme or pause animation; a device’s reduced-motion setting takes precedence. Layout, theme, and motion preferences are saved when local storage is available. The mobile menu supports keyboard navigation and Escape.

Without JavaScript, navigation, project notes, disclosures, contact links, and the initial geometry plate are still available. The project screen picker uses CSS `:has()` and works without JavaScript in supporting browsers; otherwise both studies are shown in sequence. Both studies also appear in print. If the animation library fails to load, the other controls still work.

## Files and maintenance

| Path | Purpose |
| --- | --- |
| `index.html`, `work/*.html` | Semantic pages, metadata, project links, and shared navigation/contact markup. |
| `styles.css`, `work.css` | Shared design system, responsive layouts, project archive, case studies, and print styles. |
| `script.js` | Menu, reading progress, local time in the Philippines, preferences, archive views, and optional GSAP motion. |
| `geometry.js`, `lab.js` | Parametric surfaces, projection, lab controls, and SVG export. |
| `assets/press/` | Icon sprite and static knot plate, plus artwork from earlier iterations. |
| `assets/screens/` | Self-hosted WebP captures of the project interfaces. |
| `tools/plot-default.mjs` | Regenerates the no-JavaScript plate after changing the projection. |

Optional checks (Node 22+):

```sh
node --test tests/geometry.test.mjs
node --check script.js && node --check lab.js
npx --yes html-validate@11.21.1 index.html work/*.html
```

Run `node tools/plot-default.mjs` if the default drawing changes. The site itself does not need Node.

## Credits

- Interface screens were captured from the public [Pawpaw Cafe build](https://github.com/rhyseya-hue/pawpaw-cafe/tree/f939ec2fb9065655b666d31450d3a440114b09b3) and [Marci Metzger build](https://github.com/rhyseya-hue/marcimetzger/tree/1c65cf5ee6d1b49435e60f44b761a7a29249818a). They are static portfolio exhibits, not live booking or property-search widgets.
- The portrait and project photos come from the existing portfolio. The asset library also includes a generated hand illustration from an earlier version and a Pawpaw image based on [Pexels photo 27969840](https://www.pexels.com/photo/two-plates-with-sandwiches-and-a-menu-on-them-27969840/).
- Anton, Space Grotesk, and IBM Plex Mono are self-hosted in `assets/fonts/`, alongside their licenses. Kalam remains in the asset library from an earlier version.
- [GSAP 3.15.1](https://www.npmjs.com/package/gsap/v/3.15.1) and ScrollTrigger are served from `assets/vendor/gsap/` under the [GSAP standard license](https://gsap.com/standard-license/).
