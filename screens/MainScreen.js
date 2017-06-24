import React from 'react';
import {
  ActivityIndicator,
  Dimensions,
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';

import Analysis from '../util/Analysis';
import * as Api from '../api/Api';
import Cloud from '../components/Cloud';

const BOOKS = {
  metamorphosis: 'http://www.gutenberg.org/cache/epub/5200/pg5200.txt',
  prideandprejudice: 'http://www.gutenberg.org/files/1342/1342-0.txt',
};

export default class MainScreen extends React.Component {
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
        <TouchableOpacity
          onPress={this._onPressButton}
          style={styles.button}>
          <Text style={styles.buttonText}>Reload</Text>
        </TouchableOpacity>
      </View>
    );
  }

  _onPressButton = () => {
    this._makeWordsFromWebsiteAsync(BOOKS.metamorphosis);
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
  button: {
    position: 'absolute',
    width: 96,
    height: 32,
    left: 16,
    bottom: 16,
    alignItems: 'center',
    backgroundColor: '#dddddd',
    borderRadius: 4,
  },
  buttonText: {
    margin: 6,
  },
});
