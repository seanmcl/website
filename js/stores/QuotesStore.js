'use strict';

import Dispatcher from '../SiteDispatcher';
import { ActionTypes } from '../SiteConstants';
import { EventEmitter } from 'events';
import { CHANGE_EVENT } from '../Util';
const assign = require('object-assign');

let _quotes = {
  quotes: []
};

const Store = assign({}, EventEmitter.prototype, {
  emitChange() {
    this.emit(CHANGE_EVENT);
  },

  addChangeListener(callback) {
    this.on(CHANGE_EVENT, callback);
  },

  removeChangeListener(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  },

  get() {
    return _quotes;
  }
});

Store.dispatchToken = Dispatcher.register(action => {
  switch(action.type) {
    case ActionTypes.RECEIVE_QUOTES:
      _quotes.quotes = action.quotes;
      Store.emitChange();
      break;

    default:
      // do nothing
      console.log(`Unknown action: ${action.type}`);
  }
});

export default Store;
