
const Palette = {
  blue: '#0094cd',
};

/**
 *  @param a color of the form { r, g, b, a }
 *  @param b another like a
 *  @param amount number from 0-1
 */
function interp(a, b, amount) {
  return {
    r: a.r + (b.r - a.r) * amount,
    g: a.g + (b.g - a.g) * amount,
    b: a.b + (b.b - a.b) * amount,
    a: a.a + (b.a - a.a) * amount,
  };
}

export {
  Palette,
  interp,
}
