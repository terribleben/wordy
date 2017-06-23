
function normalize(weights, maxValue) {
  Object.keys(weights).forEach((word) => {
    weights[word] = weights[word] / maxValue;
  });
  return weights;
}

// this is not great, do not use it
function computeLinearWeights(words, frequencies) {
  let maxValue = 0;
  let weights = {};
  words.forEach((word) => {
    weights[word] = frequencies[word];
    maxValue = Math.max(maxValue, frequencies[word]);
  });
  return normalize(weights, maxValue);
}

function computeTopNWeights(words, frequencies, topNCount, maxCount) {
  words = words.sort((a, b) => {
    // highest frequency first
    return (frequencies[b] - frequencies[a]);
  });

  let weights = {};
  let maxValue = 0;
  for (let ii = 0, nn = words.length; ii < nn && ii < maxCount; ii++) {
    if (ii < topNCount) {
      weights[words[ii]] = (topNCount - ii) + 1;
    } else {
      weights[words[ii]] = 1;
    }
    maxValue = Math.max(maxValue, weights[words[ii]]);
  }
  return normalize(weights, maxValue);
}

export {
  computeLinearWeights,
  computeTopNWeights,
};
