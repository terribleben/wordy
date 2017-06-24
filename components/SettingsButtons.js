import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

export default class SettingsButtons extends React.Component {
  render() {
    return (
      <TouchableOpacity
        onPress={this.props.onPressReload}
        style={[styles.button, this.props.style]}>
        <Ionicons
          name="ios-refresh"
          size={30}
          style={styles.reloadIcon}
          />
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  button: {
    width: 36,
    height: 36,
    borderRadius: 4,
    alignItems: 'center',
    backgroundColor: '#0094cd',
  },
  reloadIcon: {
    color: '#ffffff',
    marginTop: 4,
    backgroundColor: 'transparent',
  },
});
