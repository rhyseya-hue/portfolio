# Rozel Eliodra — Portfolio

A responsive, single-page portfolio for Rozel Eliodra. The site is intentionally framework-free: semantic HTML, component-like CSS sections, and a small amount of progressive JavaScript.

## Preview locally

```bash
python3 -m http.server 4173 --bind 0.0.0.0
```

Then open `http://localhost:4173`.

## Structure

- `index.html` — semantic page content and metadata
- `styles.css` — responsive visual system and component styles
- `script.js` — navigation and progressive reveal interactions
- `assets/` — portrait, project imagery, and favicon

## Featured live work

- [Pawpaw Cafe](https://pawpaw-cafe.vercel.app/)
- [Marci Metzger](https://marcimetzger-sandy.vercel.app/)

## Quality checks

```bash
npx --yes html-validate@latest index.html
```

The design includes a keyboard-accessible mobile menu, visible focus states, reduced-motion support, semantic landmarks, responsive layouts, lazy-loaded project imagery, and structured person metadata.

## Image note

The Pawpaw project preview uses a Pexels photograph from [photo 27969840](https://www.pexels.com/photo/two-plates-with-sandwiches-and-a-menu-on-them-27969840/). Other project imagery is sourced from the portfolio owner's existing work.
