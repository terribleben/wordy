import React from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  StyleSheet,
  View,
} from 'react-native';

import CloudWord from './CloudWord';
import * as Colors from '../util/Colors';

import {
  distance,
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
    scale: 0.7,
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
    const responders = {
      onStartShouldSetResponder: this._onContainerStartShouldSetResponder,
      onResponderGrant: this._onContainerResponderGrant,
      onResponderMove: this._onContainerResponderMove,
      onResponderRelease: this._onContainerResponderRelease,
    };
    let ii = 0;
    return (
      <View
        style={[
          styles.cloudContainer,
          { width, height }
        ]}
        {...responders}>
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
              scale={this.state.scale}
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
      cloud[word] = data;
    });
    
    this.setState({ cloud });
    return;
  }

  _computeWeights = (words, frequencies) => {
    return computeTopNWeights(words, frequencies, 10, 50);
  }

  _computeFontSize = (word, weight) => {
    const minFontSize = 4, maxFontSize = 64;
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

  /* gesture responders */

  _onContainerStartShouldSetResponder = () => true;

  _onContainerResponderGrant = (event) => {
    this._handleTouch(event);
  }

  _onContainerResponderMove = (event) => {
    this._handleTouch(event);
  }

  _onContainerResponderRelease = (event) => {
    this._handleRelease(event);
  }

  _handleTouch = (event) => {
    let { nativeEvent } = event;
    let touches = nativeEvent ? nativeEvent.touches : null;

    this._hasTouch = true;
    if (touches && touches.length) {
      if (touches.length === 2) {
        const isGestureStart = !this._hasDoubleTouch;
        const touchA = touches[0], touchB = touches[1];
        this._hasDoubleTouch = true;
        this._handlePinchZoom(touchA, touchB, isGestureStart);
      } else {
        this._hasDoubleTouch = false;
      }
    }
  }

  _handleRelease = (event) => {
    this._hasTouch = false;
    this._hasDoubleTouch = false;
  }

  _handlePinchZoom = (touchA, touchB, isGestureStart) => {
    const locA = this._touchLocation(touchA), locB = this._touchLocation(touchB);
    const distanceAB = distance(locA, locB);
    if (isGestureStart) {
      this._initialGestureDistance = distanceAB;
      this._initialGestureScale = this.state.scale;
    } else {
      const pinchRatio = distanceAB / this._initialGestureDistance;
      const newScale = Math.max(0.5, Math.min(2.0, pinchRatio * this._initialGestureScale));
      if (newScale) {
        this.setState({ scale: newScale });
      }
    }
  }

  _touchLocation = (touch) => {
    // use pageX rather than locationX because we are scaling the view we care about
    const result = { x: touch.pageX, y: touch.pageY };
    if (result.x === null) result.x = 0;
    if (result.y === null) result.y = 0;
    return result;
  }
}

const styles = StyleSheet.create({
  cloudContainer: {
    backgroundColor: '#ffffff',
  },
});
