// Run after changing the projection: the first plate must work without JavaScript.
import { writeFile } from 'node:fs/promises';
import { makeWires, projectWires } from '../geometry.js';

const path = projectWires(makeWires('knot'), 24);
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 412">
  <title>Knot study, rotated 24 degrees</title>
  <g fill="none" stroke="#2449c9" stroke-width="1.12" stroke-linecap="round" stroke-linejoin="round">
    <path id="mesh" d="${path}"/>
  </g>
</svg>
`;
await writeFile(new URL('../assets/press/knot.svg', import.meta.url), svg);
