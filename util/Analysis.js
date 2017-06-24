import StopWords from './StopWords';

const MIN_WORD_FREQ = 2;

class Analysis {
  constructor() {
    this.STOP_WORDS = [];
  }
  
  _isStopWord = (token) => {
    if (!this.STOP_WORDS.length) {
      this.STOP_WORDS = StopWords.split('\n');
    }
    return this.STOP_WORDS.indexOf(token) > -1;
  }
  
  getWordFrequencies = (text) => {
    let words = {};
    const cleanText = text.replace(/<\/?[^>]+(>|$)/g, "");
    const allTokens = cleanText.split(' ');
    let rawWords = {};
    allTokens.forEach((token) => {
      token = token.trim().toLowerCase().replace(/[^0-9a-z\']/gi, '');
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
      if (rawWords[word] > MIN_WORD_FREQ) {
        words[word] = rawWords[word];
      }
    });
    return words;
  }
}

export default new Analysis();
