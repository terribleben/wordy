import Expo from 'expo';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Provider } from 'react-redux';

import RootNavigation from './navigation/RootNavigation';
import Store from './redux/Store';

class App extends React.Component {
  render() {
    return (
      <Provider store={Store}>
        <View style={styles.container}>
          <RootNavigation />
        </View>
      </Provider>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

Expo.registerRootComponent(App);
