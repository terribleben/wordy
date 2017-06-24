
import React from 'react';
import { StackNavigator } from 'react-navigation';

import MainScreen from '../screens/MainScreen';

const RootStackNavigator = StackNavigator(
  {
    Main: {
      screen: MainScreen,
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
