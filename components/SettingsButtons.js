import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { Palette } from '../util/Colors';

export default class SettingsButtons extends React.Component {
  render() {
    return (
      <View style={[styles.container, this.props.style]}>
        <TouchableOpacity
          onPress={this.props.onPressReload}
          style={styles.button}>
          <Ionicons
            name="ios-refresh"
            size={30}
            style={styles.reloadIcon}
            />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={this.props.onPressSettings}
          style={styles.button}>
          <Ionicons
            name="ios-settings"
            size={27}
            style={styles.reloadIcon}
            />
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 4,
    alignItems: 'center',
    backgroundColor: Palette.blue,
    marginRight: 4,
  },
  reloadIcon: {
    color: '#ffffff',
    marginTop: 4,
    backgroundColor: 'transparent',
  },
});
