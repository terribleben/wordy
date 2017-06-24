import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';

import Store from '../redux/Store';

export default class SettingsScreen extends React.Component {
  render() {
    return (
      <View style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'white',
            }}>
        <TouchableOpacity onPress={this._onPressButton}>
          <Text>Clck me</Text>
        </TouchableOpacity>
      </View>
    );
  }

  _onPressButton = () => {
    Store.dispatch({ type: 'UPDATE_SETTINGS' });
  }
}
