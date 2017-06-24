import React from 'react';
import {
  ActivityIndicator,
  Dimensions,
  View,
  StyleSheet,
} from 'react-native';

import CloudWord from './CloudWord';

import {
  boxesIntersect,
  boxIntersectsBoxes,
  computeRandomAdjacentBox,
} from '../util/Geometry';

import {
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
      return (<ActivityIndicator loading={true} />);
    } else {
      return this._renderWords(this.props.words, this.state.cloud);
    }
  }

  _renderWords = (words, cloudData) => {
    const { width, height } = this.props;
    const center = {
      x: (this.props.width * 0.5),
      y: (this.props.height * 0.5),
    };
    let ii = 0;
    return (
      <View style={[
              styles.cloudContainer,
              { width, height }
            ]}>
        {Object.keys(words).map((word) => {
          if (!cloudData[word]) {
            return null;
          }
          ii++;
          return (
            <CloudWord
              style={cloudData[word].style}
              box={cloudData[word].box}
              center={center}
              animation={{delay: ii * 5, duration: 500 + (ii * 5)}}
              key={word}
              value={word} />
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
        style: {
          fontSize: this._computeFontSize(word, weights[word]),
        },
        box,
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
        candidateBox = computeRandomAdjacentBox(randomExistingBox, width, height);
        if (!boxIntersectsBoxes(candidateBox, existingBoxes) &&
            !this._boxIsOutsideBounds(candidateBox)) {
          return candidateBox;
        }
      }
      return candidateBox;
    }
  }

  _boxIsOutsideBounds = (candidateBox) => {
    const buffer = 0;
    if (candidateBox.x < -buffer) return true;
    if (candidateBox.x + candidateBox.width > this.props.width + buffer) return true;
    if (candidateBox.y < -buffer) return true;
    if (candidateBox.y + candidateBox.height > this.props.height + buffer) return true;
    return false;
  }
}

const styles = StyleSheet.create({
  cloudContainer: {
    backgroundColor: '#ffffff',
  },
});
