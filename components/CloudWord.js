import React from 'react';
import {
  Animated,
  Easing,
  Text,
  StyleSheet,
  View,
} from 'react-native';

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
    const opacity = this.state.transitionIn;
    return (
      <Animated.View
        style={{
          position: 'absolute',
          left,
          top,
          opacity
        }}>
        <Text
          style={[
            styles.word,
            this.props.style,
            { fontSize: this.props.style.fontSize * scale },
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
