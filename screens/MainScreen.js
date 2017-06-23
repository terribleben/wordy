import React from 'react';
import {
  Dimensions,
  View,
  StyleSheet,
} from 'react-native';

import Cloud from '../components/Cloud';

export default class MainScreen extends React.Component {
  state = {
    words: {
      'hello': 100,
      'world': 50,
      'this': 10,
      'is': 1,
      'ben': 10,
    },
  };
  
  render() {
    return (
      <View style={styles.cloudContainer}>
        <Cloud
          words={this.state.words}
          width={Dimensions.get('window').width}
          height={Dimensions.get('window').height} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  cloudContainer: {
    backgroundColor: '#ffffff',
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});
