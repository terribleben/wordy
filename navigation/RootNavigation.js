
import React from 'react';
import { StackNavigator } from 'react-navigation';

import MainScreen from '../screens/MainScreen';
import SettingsScreen from '../screens/SettingsScreen';

const RootStackNavigator = StackNavigator(
  {
    Main: {
      screen: MainScreen,
    },
    Settings: {
      screen: SettingsScreen,
    },
  },
  {
    headerMode: 'none',
  }
);

export default class RootNavigation extends React.Component {
  render() {
    return <RootStackNavigator />;
  }
}
