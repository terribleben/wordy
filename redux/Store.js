import { createStore } from 'redux';

import Books from '../util/Books';

const initialState = {
  url: Books.metamorphosis.url,
};

const reduce = (state, action) => {
  switch (action.type) {
  case 'UPDATE_SETTINGS':
    return {
      ...state,
      url: action.url,
    }
  default:
    return state;
  }
};

export default createStore(reduce, initialState);
