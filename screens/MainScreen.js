import React from 'react';
import {
  Dimensions,
  View,
  StyleSheet,
} from 'react-native';

import Cloud from '../components/Cloud';
import StopWords from '../util/StopWords';

export default class MainScreen extends React.Component {
  state = {
    words: {},
    /* words: {
      'hello': 100,
      'world': 50,
      'this': 10,
      'is': 1,
      'ben': 10,
    }, */
  };

  STOP_WORDS = [];

  componentDidMount() {
    this._makeWordsFromWebsiteAsync('http://www.gutenberg.org/files/1342/1342-0.txt');
  }
  
  render() {
    return (
      <View style={styles.cloudContainer}>
        <Cloud
          words={this.state.words}
          width={Dimensions.get('window').width}
          height={Dimensions.get('window').height} />
      </View>
    );
  }

  _makeWordsFromWebsiteAsync = async (url) => {
    try {
      const text = await this._getWebsiteAsync(url);
      const cleanText = text.replace(/<\/?[^>]+(>|$)/g, "");
      const allTokens = cleanText.split(' ');
      let rawWords = {};
      allTokens.forEach((token) => {
        token = token.trim().toLowerCase();
        if (this._isStopWord(token)) {
          return;
        }
        if (rawWords[token]) {
          rawWords[token]++;
        } else {
          rawWords[token] = 1;
        }
      });

      let words = {};
      Object.keys(rawWords).forEach((word) => {
        if (rawWords[word] > 2) {
          words[word] = rawWords[word];
        }
      });
      this.setState({ words });
    } catch (e) {
      console.log('hay', e);
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
});
