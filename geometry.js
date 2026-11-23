// Shared by the live drawing and its static first frame. Points describe the
// surface, not a pre-rendered image: every viewing angle gets a new projection.
const TAU = Math.PI * 2;

function surface(form, u, v) {
  const a = u * TAU,
    b = v * TAU;
  if (form === 'ribbon') {
    const width = (v - 0.5) * 62,
      r = 91 + width * Math.cos(a / 2);
    return [r * Math.cos(a), r * Math.sin(a), width * Math.sin(a / 2)];
  }
  if (form === 'ring') {
    const r = 82 + 30 * Math.cos(b);
    return [r * Math.cos(a), r * Math.sin(a), 30 * Math.sin(b)];
  }
  // A tube around a (2,3) torus knot; use its tangent to orient the cross-section.
  const c = Math.cos(2 * a),
    s = Math.sin(2 * a),
    r = 72 + 25 * Math.cos(3 * a);
  const dr = -75 * Math.sin(3 * a);
  let tx = dr * c - 2 * r * s,
    ty = dr * s + 2 * r * c,
    tz = 75 * Math.cos(3 * a);
  const len = Math.hypot(tx, ty, tz);
  tx /= len;
  ty /= len;
  tz /= len;
  const norm = Math.hypot(tx, ty),
    nx = -ty / norm,
    ny = tx / norm;
  const cs = 17 * Math.cos(b),
    sn = 17 * Math.sin(b);
  return [
    r * c + cs * nx - sn * tz * ny,
    r * s + cs * ny + sn * tz * nx,
    25 * Math.sin(3 * a) + sn * (tx * ny - ty * nx),
  ];
}

export function makeWires(form) {
  const wires = [],
    open = form === 'ribbon';
  for (let j = 0; j < (open ? 13 : 12); j++) {
    wires.push(Array.from({ length: 97 }, (_, i) => surface(form, i / 96, j / 12)));
  }
  for (let i = 0; i < 42; i++) {
    wires.push(Array.from({ length: open ? 2 : 19 }, (_, j) => surface(form, i / 42, open ? j : j / 18)));
  }
  return wires;
}

export function projectWires(wires, degrees) {
  const yaw = (degrees * Math.PI) / 180,
    cy = Math.cos(yaw),
    sy = Math.sin(yaw);
  const cx = Math.cos(-0.6),
    sx = Math.sin(-0.6),
    cz = Math.cos(-0.19),
    sz = Math.sin(-0.19);
  return wires
    .map((line) =>
      line
        .map(([x, y, z], i) => {
          const x1 = x * cy + z * sy,
            z1 = -x * sy + z * cy,
            y1 = y * cx - z1 * sx;
          const k = (1.38 * 550) / (550 - (y * sx + z1 * cx));
          return `${i === 0 ? 'M' : 'L'}${(320 + k * (x1 * cz - y1 * sz)).toFixed(1)},${(206 + k * (x1 * sz + y1 * cz)).toFixed(1)}`;
        })
        .join(''),
    )
    .join('');
}
