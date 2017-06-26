import React from 'react';
import {
  View,
} from 'react-native';

import Constants from '../util/Constants';
import { distance } from '../util/Geometry';

/**
 *  @prop onUpdate method to be called when pan or scale changes from a gesture.
 */
export default class PinchZoom extends React.Component {
  state = {
    pan: { x: 0, y: 0 },
    scale: 1.0,
  };

  render() {
    const responders = {
      onStartShouldSetResponder: this._onContainerStartShouldSetResponder,
      onResponderGrant: this._onContainerResponderGrant,
      onResponderMove: this._onContainerResponderMove,
      onResponderRelease: this._onContainerResponderRelease,
    };
    return (
      <View
        {...responders}>
        {this.props.children}
      </View>
    );
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

    if (touches && touches.length) {
      let newState = {};
      
      const isPanGestureStart = !this._hasTouch;
      this._hasTouch = true;
      let touchA = touches[0], touchB = null;
      if (touches.length === 2) {
        const isPinchGestureStart = !this._hasDoubleTouch;
        touchB = touches[1];
        this._hasDoubleTouch = true;
        const newScale = this._handlePinchZoom(touchA, touchB, isPinchGestureStart);
        if (newScale) {
          newState.scale = newScale;
        }
      } else {
        this._hasDoubleTouch = false;
      }
      newState.pan = this._handlePan(touchA, touchB, isPanGestureStart);
      if (newState.pan || newState.scale) {
        if (this.props.onUpdate) {
          this.props.onUpdate(newState);
          this.setState({ newState });
        }
      }
    }
  }

  _handleRelease = (event) => {
    this._hasTouch = false;
    this._hasDoubleTouch = false;
  }

  _handlePan = (touchA, maybeTouchB, isGestureStart) => {
    const center = this._touchLocation(touchA);
    if (isGestureStart) {
      this._initialPanGestureLocation = center;
      this._initialPan = this.state.pan;
    } else {
      const delta = {
        x: center.x - this._initialPanGestureLocation.x,
        y: center.y - this._initialPanGestureLocation.y,
      };
      return {
        x: this._initialPan.x + delta.x,
        y: this._initialPan.y + delta.y,
      }
    }
  }

  _handlePinchZoom = (touchA, touchB, isGestureStart) => {
    const locA = this._touchLocation(touchA), locB = this._touchLocation(touchB);
    const distanceAB = distance(locA, locB);
    if (isGestureStart) {
      this._initialGestureDistance = distanceAB;
      this._initialGestureScale = this.state.scale;
    } else {
      const pinchRatio = distanceAB / this._initialGestureDistance;
      const newScale = Math.max(Constants.CLOUD_SCALE_MIN, Math.min(Constants.CLOUD_SCALE_MAX, pinchRatio * this._initialGestureScale));
      return newScale;
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
