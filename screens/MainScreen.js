import React from 'react';
import {
  Dimensions,
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';

import { AppLoading } from 'expo';

import Cloud from '../components/Cloud';
import StopWords from '../util/StopWords';

const BOOKS = {
  metamorphosis: 'http://www.gutenberg.org/cache/epub/5200/pg5200.txt',
  prideandprejudice: 'http://www.gutenberg.org/files/1342/1342-0.txt',
};

export default class MainScreen extends React.Component {
  state = {
    words: {},
    isLoading: true,
  };

  STOP_WORDS = [];
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
      return (<AppLoading />);
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
    let words = {};
    try {
      const text = await this._getWebsiteAsync(url);
      const cleanText = text.replace(/<\/?[^>]+(>|$)/g, "");
      const allTokens = cleanText.split(' ');
      let rawWords = {};
      allTokens.forEach((token) => {
        token = token.trim().toLowerCase().replace(/\W/g, '');
        if (this._isStopWord(token)) {
          return;
        }
        if (rawWords[token]) {
          rawWords[token]++;
        } else {
          rawWords[token] = 1;
        }
      });

      Object.keys(rawWords).forEach((word) => {
        if (rawWords[word] > 2) {
          words[word] = rawWords[word];
        }
      });
    } catch (e) {
      console.log('hay', e);
    }
    if (this._mounted) {
      this.setState({ isLoading: false, words });
    }
  }

  _isStopWord = (token) => {
    if (!this.STOP_WORDS.length) {
      this.STOP_WORDS = StopWords.split('\n');
    }
    return this.STOP_WORDS.indexOf(token) > -1;
  }

  _getWebsiteAsync = async (url) => {
    const response = await fetch(url, {
      method: 'get',
    });
    if (response.status >= 400 && response.status < 600) {
      console.log('bad', response.status);
      return;
    }

    let text;
    let contentType = response.headers.get('Content-Type');
    if (contentType && contentType.indexOf('text') !== -1) {
      text = await response.text();
    } else {
      console.log('nope', contentType);
    }

    return text;
  }
}

const styles = StyleSheet.create({
  cloudContainer: {
    backgroundColor: '#ffffff',
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
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
