import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { makeWires, projectWires } from '../geometry.js';

for (const shape of ['knot', 'ring', 'ribbon']) {
  test(`${shape} stays inside the print at every rotation`, () => {
    const wires = makeWires(shape);
    const firstFrame = projectWires(wires, 0);
    assert.equal(projectWires(wires, 360), firstFrame, 'A complete turn returns to the first frame');
    assert.notEqual(projectWires(wires, 45), firstFrame);
    for (let turn = 0; turn < 360; turn++) {
      const frame = projectWires(wires, turn);
      assert.match(frame, /^(?:[ML]\d+\.\d,\d+\.\d)+$/);
      for (const point of frame.matchAll(/[ML]([\d.]+),([\d.]+)/g)) {
        assert.ok(+point[1] > 0 && +point[1] < 640 && +point[2] > 0 && +point[2] < 412);
      }
    }
  });
}

test('the no-JavaScript plate matches the live lab’s first frame', async () => {
  const svg = await readFile(new URL('../assets/press/knot.svg', import.meta.url), 'utf8');
  assert.equal(svg.match(/<path id="mesh" d="([^"]+)"/)?.[1], projectWires(makeWires('knot'), 24));
});
