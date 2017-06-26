import React from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  StyleSheet,
  View,
} from 'react-native';

import CloudWord from './CloudWord';
import Constants from '../util/Constants';
import * as Colors from '../util/Colors';

import {
  boxesIntersect,
  boxIntersectsBoxes,
  computeRandomAdjacentBox,
} from '../util/Geometry';

import {
  computeLogarithmicWeights,
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
    if (nextProps.dateLoaded !== this.props.dateLoaded) {
      this._resetAsync(nextProps.words);
    }
  }

  render() {
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
    /* const rasterProps = (Platform.OS === 'ios')
          ? { shouldRasterizeIOS: true }
          : { renderToHardwareTextureAndroid: true }; */
    return (
      <View
        style={[
          styles.cloudContainer,
          { width, height },
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
              scale={this.props.scale}
              pan={this.props.pan}
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
    let weights = computeLogarithmicWeights(words, wordsMapping, 125);

    // compute styles
    let bounds = [];
    const minFontSize = Constants.FONT_SIZE_TOO_SMALL / Constants.CLOUD_SCALE_MAX;
    const weakColor = { r: 128, g: 128, b: 128, a: 1.0 },
      strongColor = { r: 0, g: 0, b: 0, a: 1.0 };
    words.forEach((word) => {
      if (!weights[word]) {
        // zero weight or we decided to omit it from the cloud, continue
        return;
      }
      const box = this._computeBoundingBox(word, weights[word], bounds);
      bounds.push(box);
      const color = Colors.interp(weakColor, strongColor, weights[word]);
      let data = {
        style: {
          fontSize: this._computeFontSize(word, weights[word]),
          color: `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`,
        },
        box,
      };
      // skip stuff too small to show up
      if (data.style.fontSize > minFontSize) {
        cloud[word] = data;
      }
    });
    
    this.setState({ cloud });
    return;
  }

  _computeFontSize = (word, weight) => {
    const minFontSize = 0.5, maxFontSize = 64;
    return minFontSize + ((maxFontSize - minFontSize) * weight);
  }

  // TODO: un-hack plz
  _computeFakeWordDimensions = (word, fontSize) => {
    // const width = word.length * fontSize * 0.6, height = fontSize * 1.2;
    const height = fontSize * 1.2;
    let width = 0;
    const fakeCharWidths = {
      f: 0.4,
      i: 0.3,
      l: 0.3,
      m: 1.0,
      r: 0.4,
      t: 0.4,
      w: 1.0,
      "'": 0.3,
      default: 0.6,
    };
    for (let ii = 0, nn = word.length; ii < nn; ii++) {
      const char = word.charAt(ii);
      const charWidth = (fakeCharWidths.hasOwnProperty(char))
            ? fakeCharWidths[char]
            : fakeCharWidths.default;
      width += charWidth * fontSize;
    }
    return { width, height };
  }

  _computeBoundingBox = (word, weight, existingBoxes) => {
    // compute width, height of proposed word
    const fontSize = this._computeFontSize(word, weight);
    const { width, height } = this._computeFakeWordDimensions(word, fontSize);

    if (!existingBoxes || existingBoxes.length == 0) {
      // base case: center on screen
      return {
        x: (this.props.width * 0.5) - (width * 0.5),
        y: (this.props.height * 0.5) - (height * 0.5),
        width,
        height,
      };
    } else {
      let numTries = 0, maxNumTries = 150;
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
    const buffer = 32;
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
