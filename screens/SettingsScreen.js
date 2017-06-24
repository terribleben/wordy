import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';

import Books from '../util/Books';
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
          <Text>Pride and Prejudice instead</Text>
        </TouchableOpacity>
      </View>
    );
  }

  _onPressButton = () => {
    Store.dispatch({ type: 'UPDATE_SETTINGS', url: Books.prideandprejudice });
    this.props.navigation.goBack();
  }
}
