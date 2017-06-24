import React from 'react';
import {
  Dimensions,
  View,
  Text,
  StyleSheet,
} from 'react-native';

import {
  computeLinearWeights,
  computeTopNWeights,
} from '../util/Weights';

export default class Cloud extends React.Component {
  _mounted = false;
  state = {
    cloud: {},
    loading: true,
  };

  componentWillUnmount() {
    this._mounted = false;
  }

  componentDidMount() {
    this._mounted = true;
    this._resetAsync(this.props.words);
  }

  componentWillReceiveProps(nextProps) {
    this._resetAsync(nextProps.words);
  }

  render () {
    let { loading } = this.state;
    if (loading) {
      return (<View />);
    } else {
      return this._renderWords(this.props.words, this.state.cloud);
    }
  }

  _renderWords = (words, cloudData) => {
    let { width, height } = this.props;
    return (
      <View style={[
              styles.cloudContainer,
              { width, height }
            ]}>
        {Object.keys(words).map((word) => {
          if (!cloudData[word]) {
            return null;
          }
          const cloudStyles = cloudData[word];
          return (
            <Text
              style={[styles.word, cloudStyles]}
              key={word}>
              {word}
            </Text>
          );
        })}
      </View>
    );
  }

  _resetAsync = async (words) => {
    if (this._mounted) {
      this.setState({ loading: true });
    }
    await this._computeCloudAsync(words);
    if (this._mounted) {
      this.setState({ loading: false });
    }
  }

  _computeCloudAsync = async (wordsMapping) => {
    let cloud = {};
    let words = Object.keys(wordsMapping);

    // compute weights
    let weights = this._computeWeights(words, wordsMapping);

    // compute styles
    let bounds = [];
    words.forEach((word) => {
      if (!weights[word]) {
        // zero weight or we decided to omit it from the cloud, continue
        return;
      }
      const box = this._computeBoundingBox(word, weights[word], bounds);
      bounds.push(box);
      let data = {
        left: box.x,
        top: box.y,
        fontSize: this._computeFontSize(word, weights[word]),
      };
      cloud[word] = data;
    });
    
    this.setState({ cloud });
    return;
  }

  _computeWeights = (words, frequencies) => {
    return computeTopNWeights(words, frequencies, 8, 25);
  }

  _computeFontSize = (word, weight) => {
    const minFontSize = 4, maxFontSize = 64;
    return minFontSize + ((maxFontSize - minFontSize) * weight);
  }

  _computeBoundingBox = (word, weight, existingBoxes) => {
    // compute width, height of proposed word
    // TODO: measure this for realz
    const fontSize = this._computeFontSize(word, weight);
    const width = word.length * fontSize * 0.6, height = fontSize * 1.2;

    if (!existingBoxes || existingBoxes.length == 0) {
      // base case: center on screen
      return {
        x: (this.props.width * 0.5) - (width * 0.5),
        y: (this.props.height * 0.5) - (height * 0.5),
        width,
        height,
      };
    } else {
      let numTries = 0, maxNumTries = 100;
      let candidateBox;
      while (numTries++ < maxNumTries) {
        // randomly pick something adjacent to an existing bounding box
        const randomExistingBox = existingBoxes[Math.floor(Math.random() * existingBoxes.length)];
        candidateBox = this._computeRandomAdjacentBox(randomExistingBox, width, height);
        if (!this._boxIntersectsBoxes(candidateBox, existingBoxes) &&
            !this._boxIsOutsideBounds(candidateBox)) {
          return candidateBox;
        }
      }
      console.log('exceeded max num tries for word', word);
      return candidateBox;
    }
  }

  _boxIsOutsideBounds = (candidateBox) => {
    const buffer = 32;
    if (candidateBox.x < -buffer) return true;
    if (candidateBox.x + candidateBox.width > this.props.width + buffer) return true;
    if (candidateBox.y < -buffer) return true;
    if (candidateBox.y + candidateBox.height > this.props.height + buffer) return true;
    return false;
  }

  _boxIntersectsBoxes = (candidateBox, existingBoxes) => {
    if (!existingBoxes) {
      return false;
    }
    const candidate = this._getMinMaxVectors(candidateBox);
    for (let ii = 0, nn = existingBoxes.length; ii < nn; ii++) {
      const existing = this._getMinMaxVectors(existingBoxes[ii]);
      if (candidate.max.x < existing.min.x) continue; // a is left of b
      if (candidate.min.x > existing.max.x) continue; // a is right of b
      if (candidate.max.y < existing.min.y) continue; // a is above b
      if (candidate.min.y > existing.max.y) continue; // a is below b
      return true; // boxes overlap
    }
    return false;
  }

  _getMinMaxVectors = (box) => {
    return {
      min: { x: box.x, y: box.y },
      max: { x: box.x + box.width, y: box.y + box.height },
    };
  }

  _computeRandomAdjacentBox = (existingBox, width, height) => {
    // any side will do!
    const side = Math.floor(Math.random() * 4);
    const buffer = 0.1;
    switch (side) {
    case 0:
      // left
      return { x: existingBox.x - width - buffer, y: existingBox.y, width, height };
     case 1:
      // top
      return { x: existingBox.x, y: existingBox.y - height - buffer, width, height };
    case 2:
      // right
      return { x: existingBox.x + existingBox.width + buffer, y: existingBox.y, width, height };
    case 3:
      // bottom
      return { x: existingBox.x, y: existingBox.y + existingBox.height + buffer, width, height };
    }
    return existingBox;
  }
}

const styles = StyleSheet.create({
  cloudContainer: {
    backgroundColor: '#ffffff',
  },
  word: {
    position: 'absolute',
    backgroundColor: 'transparent',
  }
});
