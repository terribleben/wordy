import { createStore } from 'redux';

const initialState = {
  url: 'http://dumb',
};

const reduce = (state, action) => {
  switch (action.type) {
  case 'UPDATE_SETTINGS':
    return {
      ...state,
      url: 'http://yooooo',
    }
  default:
    return state;
  }
};

export default createStore(reduce, initialState);
