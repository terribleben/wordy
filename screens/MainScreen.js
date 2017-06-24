import React from 'react';
import {
  ActivityIndicator,
  Dimensions,
  View,
  StyleSheet,
} from 'react-native';

import { connect } from 'react-redux';

import Analysis from '../util/Analysis';
import * as Api from '../api/Api';
import Cloud from '../components/Cloud';
import SettingsButtons from '../components/SettingsButtons';

const BOOKS = {
  metamorphosis: 'http://www.gutenberg.org/cache/epub/5200/pg5200.txt',
  prideandprejudice: 'http://www.gutenberg.org/files/1342/1342-0.txt',
};

class MainScreen extends React.Component {
  state = {
    words: {},
    isLoading: true,
  };

  _mounted = false;

  componentDidMount() {
    this._mounted = true;
    this._makeWordsFromWebsiteAsync(BOOKS.metamorphosis);
  }

  componentWillUnmount() {
    this._mounted = false;
  }

  componentWillReceiveProps(nextProps) {
    console.log('ben new mainscreen props', nextProps);
  }
  
  render() {
    if (this.state.isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator loading={true} />
        </View>
      );
    }
    return (
      <View style={styles.cloudContainer}>
        <Cloud
          words={this.state.words}
          width={Dimensions.get('window').width}
          height={Dimensions.get('window').height} />
        <SettingsButtons
          style={styles.buttons}
          onPressReload={this._onPressReload}
          onPressSettings={this._onPressSettings} />
      </View>
    );
  }

  _onPressReload = () => {
    this._makeWordsFromWebsiteAsync(BOOKS.metamorphosis);
  }

  _onPressSettings = () => {
    this.props.navigation.navigate('Settings');
  }

  _makeWordsFromWebsiteAsync = async (url) => {
    if (this._mounted) {
      this.setState({ isLoading: true });
    }
    let words = {};
    try {
      const text = await Api.getWebsiteAsync(url);
      words = Analysis.getWordFrequencies(text);
    } catch (e) {
      console.log('hay', e.message);
    }
    if (this._mounted) {
      this.setState({ isLoading: false, words });
    }
  }
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  cloudContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  buttons: {
    position: 'absolute',
    left: 16,
    bottom: 16,
  },
});

export default connect((state) => ({ url: state.url }))(MainScreen);
