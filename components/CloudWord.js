import React from 'react';
import {
  Animated,
  Easing,
  Text,
  StyleSheet,
  View,
} from 'react-native';

import Constants from '../util/Constants';

export default class CloudWord extends React.Component {
  state = {
    transitionIn: new Animated.Value(0),
  };
  _mounted = false;

  async componentDidMount() {
    this._mounted = true;
    let { delay, duration } = this.props.animation;
    requestAnimationFrame(() => {
      this._mounted &&
        Animated.timing(this.state.transitionIn, {
          easing: Easing.out(Easing.exp),
          toValue: 1,
          delay,
          duration,
        }).start();
    });
  }

  componentWillUnmount() {
    this._mounted = false;
  }
  
  render() {
    const { center, box, scale } = this.props;
    
    // vector from [center to box.origin]
    // scaled * scale
    // vector from screen origin to there
    const scaledBoxFromCenter = {
      x: ((box.x - center.x) * scale) + center.x,
      y: ((box.y - center.y) * scale) + center.y,
      width: box.width * scale,
      height: box.height * scale,
    };
    
    const left = this.state.transitionIn.interpolate({
      inputRange: [0, 1],
      outputRange: [center.x - scaledBoxFromCenter.width * 0.5, scaledBoxFromCenter.x],
    });
    const top = this.state.transitionIn.interpolate({
      inputRange: [0, 1],
      outputRange: [center.y - scaledBoxFromCenter.height * 0.5, scaledBoxFromCenter.y],
    });

    // disappear if too small
    let maxOpacity = 1.0;
    const scaledFontSize = this.props.style.fontSize * scale;
    const { FONT_SIZE_TOO_SMALL, FONT_SIZE_ALMOST_TOO_SMALL } = Constants;
    if (scaledFontSize <= FONT_SIZE_TOO_SMALL) {
      return null;
    } else if (scaledFontSize <= FONT_SIZE_ALMOST_TOO_SMALL) {
      // nearly too small, fade out
      maxOpacity = (scaledFontSize - FONT_SIZE_TOO_SMALL) / (FONT_SIZE_ALMOST_TOO_SMALL - FONT_SIZE_TOO_SMALL);
    }
    const opacity = this.state.transitionIn.interpolate({
      inputRange: [0, 1],
      outputRange: [0, maxOpacity],
    });
    
    return (
      <Animated.View
        style={{
          position: 'absolute',
          left,
          top,
          opacity,
        }}>
        <Text
          style={[
            styles.word,
            this.props.style,
            { fontSize: scaledFontSize },
          ]}>
          {this.props.value}
        </Text>
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  word: {
    backgroundColor: 'transparent',
  },
});
