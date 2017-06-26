
function distance(pA, pB) {
  return Math.sqrt(
    Math.pow(pB.x - pA.x, 2.0) + Math.pow(pB.y - pA.y, 2.0)
  );
}

function _getMinMaxVectors(box) {
  return {
    min: { x: box.x, y: box.y },
    max: { x: box.x + box.width, y: box.y + box.height },
  };
}

function _minMaxBoxesIntersect(a, b) {
  if (a.max.x < b.min.x) return false; // a is left of b
  if (a.min.x > b.max.x) return false; // a is right of b
  if (a.max.y < b.min.y) return false; // a is above b
  if (a.min.y > b.max.y) return false; // a is below b
  return true; // boxes overlap
}

function boxesIntersect(a, b) {
  return _minMaxBoxesIntersect(
    _getMinMaxVectors(a),
    _getMinMaxVectors(b)
  );
}

function boxIntersectsBoxes(candidateBox, existingBoxes) {
  if (!existingBoxes) {
    return false;
  }
  const candidate = _getMinMaxVectors(candidateBox);
  for (let ii = 0, nn = existingBoxes.length; ii < nn; ii++) {
    const existing = _getMinMaxVectors(existingBoxes[ii]);
    if (_minMaxBoxesIntersect(candidate, existing)) {
      return true;
    }
  }
  return false;
}

function computeRandomAdjacentBox(existingBox, width, height) {
  // any side will do!
  const side = Math.floor(Math.random() * 4);
  const buffer = 0.1;
  const offsetRand = Math.random();
  const centerOffset = {
    x: existingBox.width * offsetRand - width * 0.5,
    y: existingBox.height * offsetRand - height * 0.5,
  }
  switch (side) {
  case 0:
    // left
    return { x: existingBox.x - width - buffer, y: existingBox.y + centerOffset.y, width, height };
  case 1:
    // top
    return { x: existingBox.x + centerOffset.x, y: existingBox.y - height - buffer, width, height };
  case 2:
    // right
    return { x: existingBox.x + existingBox.width + buffer, y: existingBox.y + centerOffset.y, width, height };
  case 3:
    // bottom
    return { x: existingBox.x + centerOffset.x, y: existingBox.y + existingBox.height + buffer, width, height };
  }
  return existingBox;
}

export {
  boxesIntersect,
  boxIntersectsBoxes,
  computeRandomAdjacentBox,
  distance,
};
