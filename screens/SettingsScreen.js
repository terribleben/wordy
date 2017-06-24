import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { connect } from 'react-redux';

import Books from '../util/Books';
import Store from '../redux/Store';

class SettingsScreen extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>
          Source Text
        </Text>
        {this._renderBooksList()}
      </View>
    );
  }

  _renderBooksList = () => {
    return (
      <View style={styles.booksList}>
        {Object.keys(Books).map((key) => {
          const book = Books[key];
          let checkmark;
          if (book.url === this.props.url) {
            checkmark = this._renderCheckmark();
          }
          return (
            <TouchableOpacity
              key={key}
              style={styles.button}
              onPress={() => this._onSelectUrl(book.url)}>
              <View>
                <Text style={styles.buttonText}>{book.title}</Text>
                {checkmark}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  _renderCheckmark = () => {
    return (
      <Ionicons  name="ios-checkmark" size={30} style={styles.checkmark} />
    );
  }

  _onSelectUrl = (url) => {
    Store.dispatch({ type: 'UPDATE_SETTINGS', url });
    this.props.navigation.goBack();
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    backgroundColor: 'white',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0094cd',
    paddingLeft: 16,
    marginBottom: 16,
  },
  booksList: {
    flexDirection: 'column',
  },
  button: {
    borderBottomWidth: 1,
    borderColor: '#eeeeee',
    paddingHorizontal: 16,
  },
  buttonText: {
    marginVertical: 12,
  },
  checkmark: {
    position: 'absolute',
    right: 0,
    top: 6,
    justifyContent: 'center',
    color: '#0094cd',
  },
});

export default connect((state) => ({ url: state.url }))(SettingsScreen);
