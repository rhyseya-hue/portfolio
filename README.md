# Rozel Eliodra — Portfolio studio

A responsive, framework-free portfolio for Rozel Eliodra, a web developer and IT professional based in the Philippines.

## Run locally

```bash
python3 -m http.server 4173 --bind 0.0.0.0
```

Open `http://localhost:4173`. No install, build step, third-party scripts, or runtime asset CDNs are required.

## Explore the studio

- Move the pointer across **Byte** to tilt the scene. The computer, floppy disk, asterisk, and orb sit on separate CSS perspective planes. Its live SVG face looks toward the pointer.
- Click, tap, or focus Byte and press **Enter** or **Space** to cycle its pixel expressions and greetings.
- The control beside **Fig. 01 — Byte** pauses or resumes ambient animation. This preference and the light/dark palette are saved locally when storage is available.
- Project posters open the live websites. Each card’s **Build notes** disclosure explains the implementation.
- About, experience, education, email, phone, and location remain accessible through native links and semantic sections.

## Files

- `index.html` — content, structured metadata, accessible controls, icon symbols, and the pixel expressions.
- `styles.css` — responsive layouts, palette tokens, depth planes, and motion.
- `script.js` — small progressive enhancements for scene interaction, navigation, theme, and copy-to-clipboard.
- `assets/studio/` — optimized, locally served WebP artwork. The generated studio stills were processed into separate transparent hero layers and two illustrated project covers.
- `assets/fonts/` — self-hosted Space Grotesk, IBM Plex Mono, and Kalam, with their license files.
- `assets/portrait.jpg` — the portfolio owner's original portrait.

## Accessibility and motion

Native navigation, project links, build notes, and contact information work without JavaScript. The mobile menu supports keyboard navigation and Escape. The scene never captures scrolling or requires dragging. Reduced-motion preferences disable the float, blink, tilt, bounce, and smooth scrolling while keeping the expressions usable. Ambient animations pause off-screen and in background tabs.

## Featured work

- [Pawpaw Cafe](https://pawpaw-cafe.vercel.app/)
- [Marci Metzger](https://marcimetzger-sandy.vercel.app/)

## Quick checks

```bash
node --check script.js
npx --yes html-validate@11.21.1 index.html
```

The original Pawpaw preview photo (`assets/pawpaw-brunch.jpg`) is from [Pexels photo 27969840](https://www.pexels.com/photo/two-plates-with-sandwiches-and-a-menu-on-them-27969840/). The original project imagery remains available in `assets/`.
