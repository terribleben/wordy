
function normalizeMax(weights, maxValue) {
  Object.keys(weights).forEach((word) => {
    weights[word] = weights[word] / maxValue;
  });
  return weights;
}

function normalizeMaxMin(weights, maxValue, minValue) {
  let finalWeights = [];
  const denominator = maxValue - minValue;
  Object.keys(weights).forEach((word) => {
    const numerator = (weights[word] - minValue);
    if (numerator > 0) {
      finalWeights[word] =  numerator / denominator;
    }
  });
  return finalWeights;
}

// this is not great, do not use it
function computeLinearWeights(words, frequencies) {
  let maxValue = 0;
  let weights = {};
  words.forEach((word) => {
    weights[word] = frequencies[word];
    maxValue = Math.max(maxValue, frequencies[word]);
  });
  return normalizeMax(weights, maxValue);
}

function computeLogarithmicWeights(words, frequencies, limit) {
  let maxValue = 0, minValue = 9999;
  let weights = {};
  words.sort((a, b) => {
    // highest frequency first
    return (frequencies[b] - frequencies[a]);
  });
  for (let ii = 0, nn = words.length; ii < nn; ii++) {
    const word = words[ii];
    const val = Math.log(frequencies[word]);
    if (val && !isNaN(val)) {
      weights[word] = val;
      maxValue = Math.max(maxValue, weights[word]);
      minValue = Math.min(minValue, weights[word]);
    }
    if (limit && ii === limit) {
      break;
    }
  }
  return normalizeMaxMin(weights, maxValue, minValue);
}

function computeTopNWeights(words, frequencies, topNCount, maxCount) {
  words.sort((a, b) => {
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
  return normalizeMax(weights, maxValue);
}

export {
  computeLinearWeights,
  computeLogarithmicWeights,
  computeTopNWeights,
};
